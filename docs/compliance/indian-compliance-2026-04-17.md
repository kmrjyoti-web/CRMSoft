# Indian Compliance Report
**Date:** 2026-04-17
**Mode:** full
**Grade:** A
**Findings:** 0 / 10 checks

## Checklist
| Area | Status |
|------|--------|
| GST (CGST/SGST/IGST) | ✅ |
| PAN / GSTIN validation | ✅ checked |
| HSN codes | ✅ checked |
| INR formatting | ✅ checked |
| Timezone (Asia/Kolkata) | ✅ checked |

## Notes
- Full GST compliance requires both CGST/SGST (intra-state) and IGST (inter-state) logic
- PAN format: ABCDE1234F (5 alpha + 4 numeric + 1 alpha)
- GSTIN format: 15 chars (state code + PAN + entity type + checksum)
- HSN codes required on all invoices for GST filing
