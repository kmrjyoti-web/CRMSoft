import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMappingSuggestionsQuery } from './get-mapping-suggestions.query';

const TARGET_FIELDS: Record<string, { field: string; label: string; type: string }[]> = {
  CONTACT: [
    { field: 'firstName', label: 'First Name', type: 'string' },
    { field: 'lastName', label: 'Last Name', type: 'string' },
    { field: 'email', label: 'Email', type: 'email' },
    { field: 'mobile', label: 'Mobile', type: 'phone' },
    { field: 'phone', label: 'Phone', type: 'phone' },
    { field: 'designation', label: 'Designation', type: 'string' },
    { field: 'department', label: 'Department', type: 'string' },
    { field: 'organization.name', label: 'Company Name', type: 'string' },
    { field: 'address', label: 'Address', type: 'string' },
    { field: 'city', label: 'City', type: 'string' },
    { field: 'state', label: 'State', type: 'string' },
    { field: 'pincode', label: 'Pincode', type: 'string' },
    { field: 'notes', label: 'Notes', type: 'text' },
  ],
  ORGANIZATION: [
    { field: 'name', label: 'Organization Name', type: 'string' },
    { field: 'website', label: 'Website', type: 'url' },
    { field: 'gstNumber', label: 'GST Number', type: 'string' },
    { field: 'industry', label: 'Industry', type: 'string' },
    { field: 'address', label: 'Address', type: 'string' },
    { field: 'city', label: 'City', type: 'string' },
    { field: 'state', label: 'State', type: 'string' },
    { field: 'pincode', label: 'Pincode', type: 'string' },
  ],
  LEAD: [
    { field: 'contactName', label: 'Contact Name', type: 'string' },
    { field: 'organization.name', label: 'Organization', type: 'string' },
    { field: 'priority', label: 'Priority', type: 'enum' },
    { field: 'notes', label: 'Notes', type: 'text' },
  ],
  PRODUCT: [
    { field: 'name', label: 'Product Name', type: 'string' },
    { field: 'code', label: 'Product Code', type: 'string' },
    { field: 'description', label: 'Description', type: 'text' },
  ],
};

@QueryHandler(GetMappingSuggestionsQuery)
export class GetMappingSuggestionsHandler implements IQueryHandler<GetMappingSuggestionsQuery> {
  async execute(query: GetMappingSuggestionsQuery) {
    return { targetFields: TARGET_FIELDS[query.targetEntity] || [] };
  }
}
