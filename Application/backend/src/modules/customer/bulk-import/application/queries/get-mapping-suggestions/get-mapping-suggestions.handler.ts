import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMappingSuggestionsQuery } from './get-mapping-suggestions.query';

// ── Target field definitions per entity ──────────────────

interface TargetFieldDef {
  field: string;
  label: string;
  type: string;
  /** Aliases used for smart matching — lowercase, no spaces */
  aliases: string[];
}

const TARGET_FIELDS: Record<string, TargetFieldDef[]> = {
  ROW_CONTACT: [
    { field: 'firstName', label: 'First Name', type: 'string', aliases: ['firstname', 'first_name', 'fname', 'first', 'givenname', 'given_name'] },
    { field: 'lastName', label: 'Last Name', type: 'string', aliases: ['lastname', 'last_name', 'lname', 'last', 'surname', 'familyname', 'family_name'] },
    { field: 'companyName', label: 'Company Name', type: 'string', aliases: ['companyname', 'company_name', 'company', 'org', 'organization', 'organisation', 'firm', 'firmname'] },
    { field: 'designation', label: 'Designation', type: 'string', aliases: ['designation', 'title', 'jobtitle', 'job_title', 'position', 'role'] },
    { field: 'department', label: 'Department', type: 'string', aliases: ['department', 'dept', 'division', 'team'] },
    { field: 'notes', label: 'Notes', type: 'text', aliases: ['notes', 'note', 'remarks', 'remark', 'comment', 'comments', 'description'] },
    { field: 'email', label: 'Email', type: 'email', aliases: ['email', 'emailaddress', 'email_address', 'emailid', 'email_id', 'mail', 'e-mail', 'e_mail'] },
    { field: 'mobile', label: 'Mobile', type: 'phone', aliases: ['mobile', 'mobileno', 'mobile_no', 'mobilenumber', 'mobile_number', 'cell', 'cellphone', 'cell_phone', 'whatsapp', 'whatsappno'] },
    { field: 'phone', label: 'Phone', type: 'phone', aliases: ['phone', 'phoneno', 'phone_no', 'phonenumber', 'phone_number', 'telephone', 'tel', 'landline', 'contact', 'contactno', 'contact_no', 'contactnumber'] },
    { field: 'address', label: 'Address', type: 'string', aliases: ['address', 'addr', 'streetaddress', 'street_address', 'street', 'address1', 'addressline1', 'fulladdress'] },
    { field: 'city', label: 'City', type: 'string', aliases: ['city', 'town', 'location', 'place'] },
    { field: 'state', label: 'State', type: 'string', aliases: ['state', 'province', 'region'] },
    { field: 'pincode', label: 'Pincode', type: 'string', aliases: ['pincode', 'pin', 'zipcode', 'zip', 'postalcode', 'postal_code', 'zip_code', 'pin_code'] },
    { field: 'gstin', label: 'GSTIN', type: 'string', aliases: ['gstin', 'gst', 'gstnumber', 'gst_number', 'gstno', 'gst_no', 'gstinno'] },
    { field: 'pan', label: 'PAN', type: 'string', aliases: ['pan', 'panno', 'pan_no', 'pannumber', 'pan_number', 'pancard'] },
    { field: 'website', label: 'Website', type: 'url', aliases: ['website', 'web', 'url', 'site', 'webpage', 'homepage'] },
  ],
  CONTACT: [
    { field: 'firstName', label: 'First Name', type: 'string', aliases: ['firstname', 'first_name', 'fname', 'first', 'givenname', 'given_name'] },
    { field: 'lastName', label: 'Last Name', type: 'string', aliases: ['lastname', 'last_name', 'lname', 'last', 'surname', 'familyname'] },
    { field: 'email', label: 'Email', type: 'email', aliases: ['email', 'emailaddress', 'email_address', 'emailid', 'mail', 'e-mail'] },
    { field: 'mobile', label: 'Mobile', type: 'phone', aliases: ['mobile', 'mobileno', 'mobile_no', 'mobilenumber', 'cell', 'cellphone', 'whatsapp'] },
    { field: 'phone', label: 'Phone', type: 'phone', aliases: ['phone', 'phoneno', 'phone_no', 'phonenumber', 'telephone', 'tel', 'landline', 'contactno'] },
    { field: 'designation', label: 'Designation', type: 'string', aliases: ['designation', 'title', 'jobtitle', 'job_title', 'position'] },
    { field: 'department', label: 'Department', type: 'string', aliases: ['department', 'dept', 'division'] },
    { field: 'organization.name', label: 'Company Name', type: 'string', aliases: ['companyname', 'company_name', 'company', 'organization', 'organisation', 'org', 'firm'] },
    { field: 'address', label: 'Address', type: 'string', aliases: ['address', 'addr', 'streetaddress', 'street'] },
    { field: 'city', label: 'City', type: 'string', aliases: ['city', 'town', 'location'] },
    { field: 'state', label: 'State', type: 'string', aliases: ['state', 'province', 'region'] },
    { field: 'pincode', label: 'Pincode', type: 'string', aliases: ['pincode', 'pin', 'zipcode', 'zip', 'postalcode', 'postal_code'] },
    { field: 'notes', label: 'Notes', type: 'text', aliases: ['notes', 'note', 'remarks', 'comment', 'comments'] },
  ],
  ORGANIZATION: [
    { field: 'name', label: 'Organization Name', type: 'string', aliases: ['name', 'orgname', 'org_name', 'companyname', 'company_name', 'company', 'organization', 'organisation', 'firm', 'firmname'] },
    { field: 'email', label: 'Email', type: 'email', aliases: ['email', 'emailaddress', 'email_address', 'emailid', 'mail'] },
    { field: 'phone', label: 'Phone', type: 'phone', aliases: ['phone', 'phoneno', 'phone_no', 'telephone', 'tel', 'contactno', 'mobile'] },
    { field: 'website', label: 'Website', type: 'url', aliases: ['website', 'web', 'url', 'site', 'homepage'] },
    { field: 'gstNumber', label: 'GST Number', type: 'string', aliases: ['gstnumber', 'gst_number', 'gstin', 'gst', 'gstno'] },
    { field: 'industry', label: 'Industry', type: 'string', aliases: ['industry', 'sector', 'businesstype', 'business_type', 'vertical'] },
    { field: 'address', label: 'Address', type: 'string', aliases: ['address', 'addr', 'streetaddress', 'street'] },
    { field: 'city', label: 'City', type: 'string', aliases: ['city', 'town', 'location'] },
    { field: 'state', label: 'State', type: 'string', aliases: ['state', 'province', 'region'] },
    { field: 'country', label: 'Country', type: 'string', aliases: ['country', 'nation'] },
    { field: 'pincode', label: 'Pincode', type: 'string', aliases: ['pincode', 'pin', 'zipcode', 'zip', 'postalcode'] },
    { field: 'annualRevenue', label: 'Annual Revenue', type: 'number', aliases: ['annualrevenue', 'annual_revenue', 'revenue', 'turnover', 'annualturnover'] },
    { field: 'notes', label: 'Notes', type: 'text', aliases: ['notes', 'note', 'remarks', 'comment', 'comments', 'description'] },
  ],
  LEAD: [
    { field: 'contactName', label: 'Contact Name', type: 'string', aliases: ['contactname', 'contact_name', 'name', 'fullname', 'full_name', 'leadname', 'lead_name'] },
    { field: 'email', label: 'Email', type: 'email', aliases: ['email', 'emailaddress', 'emailid', 'mail'] },
    { field: 'mobile', label: 'Mobile', type: 'phone', aliases: ['mobile', 'mobileno', 'mobile_no', 'cell', 'cellphone', 'phone', 'phoneno', 'contactno'] },
    { field: 'organization.name', label: 'Organization', type: 'string', aliases: ['organization', 'organisation', 'company', 'companyname', 'company_name', 'org', 'firm'] },
    { field: 'priority', label: 'Priority', type: 'enum', aliases: ['priority', 'prio', 'importance', 'urgency'] },
    { field: 'expectedValue', label: 'Expected Value', type: 'number', aliases: ['expectedvalue', 'expected_value', 'value', 'amount', 'dealvalue', 'deal_value', 'dealsize'] },
    { field: 'notes', label: 'Notes', type: 'text', aliases: ['notes', 'note', 'remarks', 'comment', 'comments', 'description'] },
  ],
  PRODUCT: [
    { field: 'name', label: 'Product Name', type: 'string', aliases: ['name', 'productname', 'product_name', 'itemname', 'item_name', 'item', 'product', 'description'] },
    { field: 'code', label: 'Product Code', type: 'string', aliases: ['code', 'productcode', 'product_code', 'itemcode', 'item_code', 'sku', 'partno', 'part_no', 'partnumber'] },
    { field: 'description', label: 'Description', type: 'text', aliases: ['description', 'desc', 'shortdescription', 'short_description', 'detail', 'details'] },
    { field: 'hsnCode', label: 'HSN/SAC Code', type: 'string', aliases: ['hsncode', 'hsn_code', 'hsn', 'saccode', 'sac_code', 'sac', 'hsnsac', 'hsn_sac'] },
    { field: 'mrp', label: 'MRP', type: 'number', aliases: ['mrp', 'maximumretailprice', 'maximum_retail_price', 'listprice', 'list_price'] },
    { field: 'sellingPrice', label: 'Selling Price', type: 'number', aliases: ['sellingprice', 'selling_price', 'saleprice', 'sale_price', 'sp', 'price', 'rate', 'unitprice', 'unit_price'] },
    { field: 'purchasePrice', label: 'Purchase Price', type: 'number', aliases: ['purchaseprice', 'purchase_price', 'costprice', 'cost_price', 'cost', 'buyingprice', 'buying_price', 'cp'] },
    { field: 'taxRate', label: 'Tax Rate %', type: 'number', aliases: ['taxrate', 'tax_rate', 'gstrate', 'gst_rate', 'gst', 'tax', 'taxpercent', 'gstpercent'] },
    { field: 'unit', label: 'Unit', type: 'string', aliases: ['unit', 'uom', 'unitofmeasure', 'unit_of_measure', 'measurement'] },
    { field: 'barcode', label: 'Barcode', type: 'string', aliases: ['barcode', 'ean', 'upc', 'barcodeno', 'barcode_no'] },
  ],
  LEDGER: [
    { field: 'name', label: 'Ledger Name', type: 'string', aliases: ['name', 'ledgername', 'ledger_name', 'accountname', 'account_name', 'account', 'ledger', 'partyname', 'party_name'] },
    { field: 'code', label: 'Ledger Code', type: 'string', aliases: ['code', 'ledgercode', 'ledger_code', 'accountcode', 'account_code'] },
    { field: 'groupType', label: 'Group Type', type: 'string', aliases: ['grouptype', 'group_type', 'group', 'accountgroup', 'account_group', 'type'] },
    { field: 'openingBalance', label: 'Opening Balance', type: 'number', aliases: ['openingbalance', 'opening_balance', 'opening', 'obamt', 'ob', 'balance'] },
    { field: 'gstin', label: 'GSTIN', type: 'string', aliases: ['gstin', 'gst', 'gstnumber', 'gst_number', 'gstno'] },
    { field: 'pan', label: 'PAN', type: 'string', aliases: ['pan', 'panno', 'pan_no', 'pannumber'] },
    { field: 'mobile', label: 'Mobile', type: 'phone', aliases: ['mobile', 'mobileno', 'mobile_no', 'phone', 'phoneno', 'contact'] },
    { field: 'email', label: 'Email', type: 'email', aliases: ['email', 'emailaddress', 'emailid', 'mail'] },
    { field: 'address', label: 'Address', type: 'string', aliases: ['address', 'addr', 'street'] },
    { field: 'city', label: 'City', type: 'string', aliases: ['city', 'town', 'location'] },
    { field: 'state', label: 'State', type: 'string', aliases: ['state', 'province', 'region'] },
  ],
};

// ── Smart matching engine ────────────────────────────────

interface MappingSuggestion {
  sourceColumn: string;
  suggestedField: string;
  confidence: number;
}

/**
 * Normalize a header string for comparison:
 * "First Name" → "firstname", "Phone No." → "phoneno"
 */
function normalize(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Check if string a contains string b or vice versa.
 */
function fuzzyContains(a: string, b: string): boolean {
  return a.includes(b) || b.includes(a);
}

/**
 * Match file headers against target fields using alias matching + fuzzy matching.
 * Returns suggestions sorted by confidence (1.0 = exact alias match, 0.7 = fuzzy).
 */
function matchHeaders(
  fileHeaders: string[],
  targetFields: TargetFieldDef[],
): MappingSuggestion[] {
  const suggestions: MappingSuggestion[] = [];
  const usedFields = new Set<string>();

  // Pass 1: Exact alias match (confidence 1.0)
  for (const header of fileHeaders) {
    const norm = normalize(header);
    if (!norm) continue;

    for (const field of targetFields) {
      if (usedFields.has(field.field)) continue;

      if (field.aliases.includes(norm)) {
        suggestions.push({
          sourceColumn: header,
          suggestedField: field.field,
          confidence: 1.0,
        });
        usedFields.add(field.field);
        break;
      }
    }
  }

  // Pass 2: Fuzzy contains match (confidence 0.7)
  for (const header of fileHeaders) {
    if (suggestions.some((s) => s.sourceColumn === header)) continue;
    const norm = normalize(header);
    if (!norm || norm.length < 3) continue;

    let bestMatch: { field: string; score: number } | null = null;

    for (const field of targetFields) {
      if (usedFields.has(field.field)) continue;

      for (const alias of field.aliases) {
        if (fuzzyContains(norm, alias) && alias.length >= 3) {
          // Longer alias match = higher confidence
          const score = Math.min(alias.length, norm.length) / Math.max(alias.length, norm.length);
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { field: field.field, score };
          }
        }
      }
    }

    if (bestMatch && bestMatch.score >= 0.5) {
      suggestions.push({
        sourceColumn: header,
        suggestedField: bestMatch.field,
        confidence: Math.round(bestMatch.score * 70) / 100, // 0.35–0.70 range
      });
      usedFields.add(bestMatch.field);
    }
  }

  return suggestions;
}

// ── Handler ──────────────────────────────────────────────

@QueryHandler(GetMappingSuggestionsQuery)
export class GetMappingSuggestionsHandler implements IQueryHandler<GetMappingSuggestionsQuery> {
  async execute(query: GetMappingSuggestionsQuery) {
    const fields = TARGET_FIELDS[query.targetEntity] || [];
    const targetFields = fields.map(({ field, label, type }) => ({ field, label, type }));

    // If file headers provided, return smart suggestions
    const suggestions = query.fileHeaders?.length
      ? matchHeaders(query.fileHeaders, fields)
      : [];

    return { targetFields, suggestions };
  }
}
