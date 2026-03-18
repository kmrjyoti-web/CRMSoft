import { Injectable } from '@nestjs/common';
import { ProfileMatcherService } from './profile-matcher.service';

@Injectable()
export class FieldMapperService {
  constructor(private readonly profileMatcher: ProfileMatcherService) {}

  /** Map all rows using field mapping config */
  mapRows(
    rows: Record<string, string>[],
    fieldMapping: any[],
    defaults?: Record<string, any>,
  ): { mappedRows: Record<string, any>[]; notesByRow: Map<number, string[]> } {
    const mappedRows: Record<string, any>[] = [];
    const notesByRow = new Map<number, string[]>();

    for (let i = 0; i < rows.length; i++) {
      const { mapped, notes } = this.mapSingleRow(rows[i], fieldMapping, defaults);
      mappedRows.push(mapped);
      if (notes.length > 0) notesByRow.set(i, notes);
    }

    return { mappedRows, notesByRow };
  }

  /** Map a single row from raw to target fields */
  private mapSingleRow(
    rowData: Record<string, string>,
    fieldMapping: any[],
    defaults?: Record<string, any>,
  ): { mapped: Record<string, any>; notes: string[] } {
    const mapped: Record<string, any> = {};
    const notes: string[] = [];
    const appendNotes: string[] = [];

    for (const fm of fieldMapping) {
      if (!fm.targetField || fm.transform === 'SKIP') continue;

      const header = fm.sourceColumn || fm.matchedHeader || fm.sourceHeader;
      let value = rowData[header] || '';
      value = this.applyTransform(value, fm.transform);

      if (!value) continue;

      // Handle SPLIT_NAME: "Mr Rahul K Sharma" → firstName + lastName
      if (fm.transform === 'SPLIT_NAME') {
        const { firstName, lastName } = this.splitName(value);
        mapped.firstName = firstName;
        if (lastName) mapped.lastName = lastName;
        continue;
      }

      // Handle APPEND_NOTES: collect all note fields
      if (fm.transform === 'APPEND_NOTES') {
        appendNotes.push(`${fm.sourceHeader}: ${value}`);
        continue;
      }

      // Nested fields: "organization.name" → { organization: { name: ... } }
      if (fm.targetField.includes('.')) {
        const [parent, child] = fm.targetField.split('.');
        if (!mapped[parent]) mapped[parent] = {};
        mapped[parent][child] = value;
      } else {
        mapped[fm.targetField] = value;
      }
    }

    // Merge append notes
    if (appendNotes.length > 0) {
      const existing = mapped.notes || '';
      mapped.notes = [existing, ...appendNotes].filter(Boolean).join('\n');
    }

    // Apply defaults (only for missing fields)
    if (defaults) {
      for (const [key, val] of Object.entries(defaults)) {
        if (mapped[key] === undefined || mapped[key] === '') {
          mapped[key] = val;
        }
      }
    }

    return { mapped, notes };
  }

  /** Split full name into firstName + lastName */
  private splitName(fullName: string): { firstName: string; lastName: string } {
    const clean = fullName.replace(/^(mr|mrs|ms|miss|dr|prof|shri|smt|sri)\.?\s+/i, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);

    if (parts.length === 0) return { firstName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };

    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }

  /** Apply value transform */
  private applyTransform(value: string, transform?: string): string {
    if (!value || !transform) return value;
    switch (transform) {
      case 'TRIM': return value.trim();
      case 'UPPERCASE': return value.trim().toUpperCase();
      case 'LOWERCASE': return value.trim().toLowerCase();
      case 'CLEAN_PHONE': return value.replace(/[\s\-\(\)\.]/g, '').trim();
      case 'CLEAN_EMAIL': return value.trim().toLowerCase();
      case 'SPLIT_NAME': return value.trim();
      case 'APPEND_NOTES': return value.trim();
      default: return value.trim();
    }
  }
}
