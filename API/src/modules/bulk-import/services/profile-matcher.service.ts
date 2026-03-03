import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

export interface MatchResult {
  profileId: string;
  profileName: string;
  matchScore: number;
  status: 'FULL_MATCH' | 'PARTIAL' | 'NO_MATCH';
  resolvedMapping: any[];
  unmatchedHeaders: string[];
  matchedCount: number;
  totalExpected: number;
}

@Injectable()
export class ProfileMatcherService {
  constructor(private readonly prisma: PrismaService) {}

  /** Match file headers against a specific profile's expected headers + aliases */
  matchHeaders(fileHeaders: string[], profile: any): MatchResult {
    const mapping: any[] = profile.fieldMapping || [];
    const normalizedFileHeaders = fileHeaders.map((h: string) => h.toLowerCase().trim());
    const resolvedMapping: any[] = [];
    const unmatchedHeaders: string[] = [];
    let matchedCount = 0;

    for (const m of mapping) {
      const sourceNorm = (m.sourceHeader || '').toLowerCase().trim();
      const aliases: string[] = (m.aliases || []).map((a: string) => a.toLowerCase().trim());
      const allNames = [sourceNorm, ...aliases];

      const matchIdx = normalizedFileHeaders.findIndex((h: string) => allNames.includes(h));
      if (matchIdx >= 0) {
        matchedCount++;
        resolvedMapping.push({ ...m, matchedHeader: fileHeaders[matchIdx], matched: true });
      } else {
        resolvedMapping.push({ ...m, matchedHeader: null, matched: false });
        unmatchedHeaders.push(m.sourceHeader);
      }
    }

    const totalExpected = mapping.length;
    const matchScore = totalExpected > 0 ? (matchedCount / totalExpected) * 100 : 0;

    let status: 'FULL_MATCH' | 'PARTIAL' | 'NO_MATCH';
    if (matchScore >= 90) status = 'FULL_MATCH';
    else if (matchScore >= 50) status = 'PARTIAL';
    else status = 'NO_MATCH';

    return {
      profileId: profile.id,
      profileName: profile.name,
      matchScore,
      status,
      resolvedMapping,
      unmatchedHeaders,
      matchedCount,
      totalExpected,
    };
  }

  /** Auto-detect best matching profiles for given file headers */
  async suggestProfiles(fileHeaders: string[], targetEntity: string): Promise<MatchResult[]> {
    const profiles = await this.prisma.importProfile.findMany({
      where: { targetEntity: targetEntity as any, status: 'ACTIVE' },
      orderBy: { usageCount: 'desc' },
    });

    const results: MatchResult[] = [];
    for (const profile of profiles) {
      const match = this.matchHeaders(fileHeaders, profile);
      if (match.matchScore > 0) results.push(match);
    }

    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }

  /** Apply a profile's resolved mapping to row data */
  applyMapping(rowData: Record<string, string>, resolvedMapping: any[], defaults?: any): Record<string, any> {
    const mapped: Record<string, any> = {};

    for (const m of resolvedMapping) {
      if (!m.matched || !m.targetField || m.transform === 'SKIP') continue;
      const header = m.matchedHeader || m.sourceHeader;
      let value = rowData[header] || '';

      value = this.applyTransform(value, m.transform);
      if (!value && !m.isRequired) continue;

      if (m.targetField.includes('.')) {
        const [parent, child] = m.targetField.split('.');
        if (!mapped[parent]) mapped[parent] = {};
        mapped[parent][child] = value;
      } else {
        mapped[m.targetField] = value;
      }
    }

    if (defaults) {
      for (const [key, val] of Object.entries(defaults)) {
        if (!mapped[key]) mapped[key] = val;
      }
    }

    return mapped;
  }

  /** Apply transform to a value */
  private applyTransform(value: string, transform?: string): string {
    if (!value || !transform) return value;

    switch (transform) {
      case 'TRIM': return value.trim();
      case 'UPPERCASE': return value.trim().toUpperCase();
      case 'LOWERCASE': return value.trim().toLowerCase();
      case 'CLEAN_PHONE': return value.replace(/[\s\-\(\)\.]/g, '').trim();
      case 'CLEAN_EMAIL': return value.trim().toLowerCase();
      case 'SPLIT_NAME': return value.trim(); // handled in field mapper
      case 'APPEND_NOTES': return value.trim();
      default: return value.trim();
    }
  }
}
