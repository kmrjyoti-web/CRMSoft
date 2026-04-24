import { Injectable } from '@nestjs/common';

export interface FieldScore {
  field: string;
  importValue: string;
  dbValue: string;
  similarity: number;
}

export interface CombinedScore {
  score: number;
  confidence: 'EXACT' | 'HIGH' | 'MEDIUM' | 'LOW';
  fieldScores: FieldScore[];
  matchReason: string;
}

const HONORIFICS = /^(mr|mrs|ms|miss|dr|prof|shri|smt|sri)\.?\s+/i;
const COMPANY_SUFFIXES = /\s+(pvt|private|ltd|limited|llp|inc|incorporated|corp|corporation|co|company|enterprises|solutions|services|technologies|tech|group|&)\s*/gi;

@Injectable()
export class FuzzyMatcherService {
  /** Levenshtein distance between two strings */
  levenshteinDistance(a: string, b: string): number {
    const la = a.length;
    const lb = b.length;
    const dp: number[][] = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0));

    for (let i = 0; i <= la; i++) dp[i][0] = i;
    for (let j = 0; j <= lb; j++) dp[0][j] = j;

    for (let i = 1; i <= la; i++) {
      for (let j = 1; j <= lb; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[la][lb];
  }

  /** Similarity ratio 0.0-1.0 using Levenshtein */
  levenshteinSimilarity(a: string, b: string): number {
    if (!a && !b) return 1;
    if (!a || !b) return 0;
    const al = a.toLowerCase().trim();
    const bl = b.toLowerCase().trim();
    if (al === bl) return 1;
    const maxLen = Math.max(al.length, bl.length);
    if (maxLen === 0) return 1;
    return 1 - this.levenshteinDistance(al, bl) / maxLen;
  }

  /** Name similarity: removes honorifics, handles initials, token-based matching */
  nameSimilarity(a: string, b: string): number {
    if (!a || !b) return 0;
    const cleanA = a.replace(HONORIFICS, '').trim().toLowerCase();
    const cleanB = b.replace(HONORIFICS, '').trim().toLowerCase();
    if (cleanA === cleanB) return 1;

    // Token-based: compare name parts
    const tokensA = cleanA.split(/\s+/).filter(Boolean);
    const tokensB = cleanB.split(/\s+/).filter(Boolean);

    // Match tokens allowing initials (e.g., "K" matches "Kumar")
    let matchScore = 0;
    let totalWeight = 0;

    const longer = tokensA.length >= tokensB.length ? tokensA : tokensB;
    const shorter = tokensA.length >= tokensB.length ? tokensB : tokensA;

    for (const tokenL of longer) {
      totalWeight++;
      let bestMatch = 0;
      for (const tokenS of shorter) {
        // Initial check: "K" matches "Kumar"
        if (tokenL.length === 1 && tokenS.startsWith(tokenL)) {
          bestMatch = Math.max(bestMatch, 0.8);
        } else if (tokenS.length === 1 && tokenL.startsWith(tokenS)) {
          bestMatch = Math.max(bestMatch, 0.8);
        } else {
          bestMatch = Math.max(bestMatch, this.levenshteinSimilarity(tokenL, tokenS));
        }
      }
      matchScore += bestMatch;
    }

    return totalWeight > 0 ? matchScore / totalWeight : 0;
  }

  /** Company similarity: removes Ltd/Pvt/Corp, & → and */
  companySimilarity(a: string, b: string): number {
    if (!a || !b) return 0;
    const cleanA = a.replace(COMPANY_SUFFIXES, ' ').replace(/[&]/g, 'and').trim().toLowerCase();
    const cleanB = b.replace(COMPANY_SUFFIXES, ' ').replace(/[&]/g, 'and').trim().toLowerCase();
    if (cleanA === cleanB) return 1;
    return this.levenshteinSimilarity(cleanA, cleanB);
  }

  /** Phone partial match: compare last N digits */
  phonePartialMatch(a: string, b: string, lastN = 8): boolean {
    if (!a || !b) return false;
    const cleanA = a.replace(/\D/g, '');
    const cleanB = b.replace(/\D/g, '');
    if (cleanA.length < lastN || cleanB.length < lastN) return false;
    return cleanA.slice(-lastN) === cleanB.slice(-lastN);
  }

  /** Combined weighted score from multiple field comparisons */
  combinedScore(fieldScores: FieldScore[]): CombinedScore {
    const WEIGHTS: Record<string, number> = {
      name: 3, firstName: 3, lastName: 3, 'firstName+lastName': 3,
      'organization.name': 2, company: 2, companyName: 2,
      phone: 2, mobile: 2,
      city: 1, email: 2,
    };

    let totalWeight = 0;
    let weightedSum = 0;
    const reasons: string[] = [];

    for (const fs of fieldScores) {
      const weight = WEIGHTS[fs.field] || 1;
      totalWeight += weight;
      weightedSum += fs.similarity * weight;

      if (fs.similarity >= 0.8) {
        const pct = Math.round(fs.similarity * 100);
        reasons.push(`${fs.field} ${pct}% similar`);
      }
    }

    const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
    let confidence: 'EXACT' | 'HIGH' | 'MEDIUM' | 'LOW';
    if (score >= 1) confidence = 'EXACT';
    else if (score >= 0.9) confidence = 'HIGH';
    else if (score >= 0.8) confidence = 'MEDIUM';
    else confidence = 'LOW';

    return {
      score,
      confidence,
      fieldScores,
      matchReason: reasons.join(' + ') || 'No strong match',
    };
  }
}
