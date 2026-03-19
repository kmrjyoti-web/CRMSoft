import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { FuzzyMatcherService, FieldScore } from './fuzzy-matcher.service';

export interface DuplicateResult {
  isDuplicate: boolean;
  duplicateType?: 'EXACT_DB' | 'FUZZY_DB' | 'IN_FILE';
  duplicateOfEntityId?: string;
  duplicateOfRowNumber?: number;
  duplicateMatchField?: string;
  duplicateMatchValue?: string;
  fuzzyMatchScore?: number;
  fuzzyMatchDetails?: any;
}

@Injectable()
export class DuplicateDetectorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fuzzyMatcher: FuzzyMatcherService,
  ) {}

  /** Phase 1: Detect in-file duplicates (rows with same email/phone within the file) */
  detectInFileDuplicates(
    rows: { rowNumber: number; mappedData: Record<string, any> }[],
    checkFields: string[],
  ): Map<number, DuplicateResult> {
    const results = new Map<number, DuplicateResult>();
    const seen = new Map<string, number>(); // value → first row number

    for (const row of rows) {
      for (const field of checkFields) {
        const val = this.extractField(row.mappedData, field);
        if (!val) continue;

        const key = `${field}:${val.toLowerCase()}`;
        const firstRow = seen.get(key);

        if (firstRow !== undefined && firstRow !== row.rowNumber) {
          results.set(row.rowNumber, {
            isDuplicate: true,
            duplicateType: 'IN_FILE',
            duplicateOfRowNumber: firstRow,
            duplicateMatchField: field,
            duplicateMatchValue: val,
          });
          break;
        }
        seen.set(key, row.rowNumber);
      }
    }
    return results;
  }

  /** Phase 2: Batch exact DB duplicate detection */
  async detectExactDbDuplicates(
    rows: { rowNumber: number; mappedData: Record<string, any> }[],
    checkFields: string[],
    targetEntity: string,
  ): Promise<Map<number, DuplicateResult>> {
    const results = new Map<number, DuplicateResult>();

    // Collect unique values per field for batch query
    const fieldValues = new Map<string, Map<string, number[]>>(); // field → value → rowNumbers

    for (const row of rows) {
      for (const field of checkFields) {
        const val = this.extractField(row.mappedData, field);
        if (!val) continue;
        if (!fieldValues.has(field)) fieldValues.set(field, new Map());
        const valMap = fieldValues.get(field)!;
        const normalVal = val.toLowerCase().trim();
        if (!valMap.has(normalVal)) valMap.set(normalVal, []);
        valMap.get(normalVal)!.push(row.rowNumber);
      }
    }

    // Batch query DB per field
    for (const [field, valMap] of fieldValues) {
      const values = Array.from(valMap.keys());
      if (values.length === 0) continue;

      const dbMatches = await this.queryDbForField(field, values, targetEntity);

      for (const dbMatch of dbMatches) {
        const matchVal = dbMatch.matchValue.toLowerCase();
        const rowNumbers = valMap.get(matchVal) || [];
        for (const rowNum of rowNumbers) {
          if (!results.has(rowNum)) {
            results.set(rowNum, {
              isDuplicate: true,
              duplicateType: 'EXACT_DB',
              duplicateOfEntityId: dbMatch.entityId,
              duplicateMatchField: field,
              duplicateMatchValue: dbMatch.matchValue,
            });
          }
        }
      }
    }
    return results;
  }

  /** Phase 3: Fuzzy DB matching for non-exact matched rows */
  async detectFuzzyDbDuplicates(
    rows: { rowNumber: number; mappedData: Record<string, any> }[],
    fuzzyFields: string[],
    targetEntity: string,
    threshold: number,
  ): Promise<Map<number, DuplicateResult>> {
    const results = new Map<number, DuplicateResult>();

    // Load candidate records from DB (limit to reasonable batch)
    const candidates = await this.loadFuzzyCandidates(targetEntity, 500);
    if (candidates.length === 0) return results;

    for (const row of rows) {
      const fieldScores: FieldScore[] = [];

      for (const fuzzyField of fuzzyFields) {
        const importVal = this.extractFuzzyField(row.mappedData, fuzzyField);
        if (!importVal) continue;

        let bestScore = 0;
        let bestCandidate: any = null;
        let bestDbVal = '';

        for (const candidate of candidates) {
          const dbVal = this.extractFuzzyField(candidate, fuzzyField);
          if (!dbVal) continue;

          let score: number;
          if (fuzzyField.includes('Name') || fuzzyField === 'firstName+lastName') {
            score = this.fuzzyMatcher.nameSimilarity(importVal, dbVal);
          } else if (fuzzyField.includes('organization') || fuzzyField.includes('company')) {
            score = this.fuzzyMatcher.companySimilarity(importVal, dbVal);
          } else {
            score = this.fuzzyMatcher.levenshteinSimilarity(importVal, dbVal);
          }

          if (score > bestScore) {
            bestScore = score;
            bestCandidate = candidate;
            bestDbVal = dbVal;
          }
        }

        if (bestScore > 0.5) {
          fieldScores.push({
            field: fuzzyField,
            importValue: importVal,
            dbValue: bestDbVal,
            similarity: bestScore,
          });
        }
      }

      if (fieldScores.length === 0) continue;

      const combined = this.fuzzyMatcher.combinedScore(fieldScores);
      if (combined.score >= threshold) {
        const bestField = fieldScores.sort((a, b) => b.similarity - a.similarity)[0];
        results.set(row.rowNumber, {
          isDuplicate: true,
          duplicateType: 'FUZZY_DB',
          duplicateOfEntityId: undefined, // set from best candidate
          duplicateMatchField: bestField.field,
          duplicateMatchValue: bestField.dbValue,
          fuzzyMatchScore: combined.score,
          fuzzyMatchDetails: {
            confidence: combined.confidence,
            overallScore: combined.score,
            fieldScores: combined.fieldScores,
            matchReason: combined.matchReason,
          },
        });
      }
    }
    return results;
  }

  /** Extract field value from mapped data for duplicate check */
  private extractField(data: Record<string, any>, field: string): string | null {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return data[parent]?.[child] || null;
    }
    return data[field] || null;
  }

  /** Extract combined fields for fuzzy (e.g., "firstName+lastName") */
  private extractFuzzyField(data: Record<string, any>, field: string): string {
    if (field.includes('+')) {
      return field.split('+').map(f => data[f] || '').join(' ').trim();
    }
    return this.extractField(data, field) || '';
  }

  /** Query DB for exact matches on a field */
  private async queryDbForField(
    field: string, values: string[], targetEntity: string,
  ): Promise<{ entityId: string; matchValue: string }[]> {
    const results: { entityId: string; matchValue: string }[] = [];

    if (targetEntity === 'ROW_CONTACT' || targetEntity === 'CONTACT' || targetEntity === 'LEAD') {
      if (field === 'email' || field === 'mobile' || field === 'phone') {
        const comms = await this.prisma.communication.findMany({
          where: { value: { in: values, mode: 'insensitive' } },
          select: { value: true, contactId: true, rawContactId: true },
        });
        for (const c of comms) {
          results.push({
            entityId: c.contactId || c.rawContactId || '',
            matchValue: c.value,
          });
        }
      }
    }

    if (targetEntity === 'ORGANIZATION') {
      if (field === 'name' || field === 'organization.name') {
        const orgs = await this.prisma.organization.findMany({
          where: { name: { in: values, mode: 'insensitive' }, isActive: true },
          select: { id: true, name: true },
        });
        for (const o of orgs) results.push({ entityId: o.id, matchValue: o.name });
      }
    }

    return results;
  }

  /** Load fuzzy match candidates from DB */
  private async loadFuzzyCandidates(targetEntity: string, limit: number): Promise<any[]> {
    if (targetEntity === 'CONTACT') {
      return this.prisma.contact.findMany({
        where: { isActive: true },
        select: { id: true, firstName: true, lastName: true, organization: { select: { name: true } } },
        take: limit,
        orderBy: { updatedAt: 'desc' },
      });
    }
    if (targetEntity === 'ORGANIZATION') {
      return this.prisma.organization.findMany({
        where: { isActive: true },
        select: { id: true, name: true, city: true },
        take: limit,
        orderBy: { updatedAt: 'desc' },
      });
    }
    return [];
  }
}
