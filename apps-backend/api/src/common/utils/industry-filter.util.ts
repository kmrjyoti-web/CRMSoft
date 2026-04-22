/**
 * Builds a Prisma WHERE clause that filters records by industry.
 * NULL industryCode records are ALWAYS included (common/default).
 *
 * @param tenantIndustryCode - The tenant's industry code from JWT/tenant lookup
 * @returns Prisma where fragment
 */
export function industryFilter(tenantIndustryCode?: string | null) {
  if (!tenantIndustryCode) {
    // No industry set → show only common (NULL) records
    return { industryCode: null };
  }

  return {
    OR: [
      { industryCode: null },
      { industryCode: tenantIndustryCode },
    ],
  };
}

/**
 * For vendor portal: filter by specific industry or show all.
 */
export function vendorIndustryFilter(industryCode?: string | null) {
  if (!industryCode) {
    return {}; // No filter — show everything
  }
  return { industryCode };
}
