// ── Form Field Config Types ──────────────────────────────

export interface FormFieldConfig {
  id: string;
  label: string;
  visible: boolean;
  section: string;
  required?: boolean;
}

export interface FormConfigData {
  fields: FormFieldConfig[];
}

// ── System Defaults ──────────────────────────────────────

export const FORM_REGISTRY: Record<string, FormFieldConfig[]> = {
  "form-contacts": [
    { id: "firstName", label: "First Name", visible: true, section: "Personal Information", required: true },
    { id: "lastName", label: "Last Name", visible: true, section: "Personal Information", required: true },
    { id: "email", label: "Email", visible: true, section: "Personal Information" },
    { id: "phone", label: "Phone", visible: true, section: "Personal Information" },
    { id: "organizationId", label: "Organization", visible: true, section: "Company" },
    { id: "designation", label: "Designation", visible: true, section: "Company" },
    { id: "department", label: "Department", visible: true, section: "Company" },
    { id: "sourceId", label: "Source", visible: true, section: "Company" },
    { id: "categoryId", label: "Category", visible: true, section: "Company" },
    { id: "notes", label: "Notes", visible: true, section: "Notes" },
  ],
  "form-organizations": [
    { id: "name", label: "Company Name", visible: true, section: "Company Information", required: true },
    { id: "industryId", label: "Industry", visible: true, section: "Company Information" },
    { id: "gstNumber", label: "GST Number", visible: true, section: "Company Information" },
    { id: "annualRevenue", label: "Annual Revenue", visible: true, section: "Company Information" },
    { id: "orgTypeId", label: "Organization Type", visible: true, section: "Classification" },
    { id: "orgCategoryId", label: "Category", visible: true, section: "Classification" },
    { id: "orgGroupId", label: "Group", visible: true, section: "Classification" },
    { id: "orgStatusId", label: "Status", visible: true, section: "Classification" },
    { id: "businessTypeId", label: "Business Type", visible: true, section: "Classification" },
    { id: "website", label: "Website", visible: true, section: "Contact" },
    { id: "email", label: "Email", visible: true, section: "Contact" },
    { id: "phone", label: "Phone", visible: true, section: "Contact" },
    { id: "address", label: "Street Address", visible: true, section: "Address" },
    { id: "city", label: "City", visible: true, section: "Address" },
    { id: "state", label: "State", visible: true, section: "Address" },
    { id: "country", label: "Country", visible: true, section: "Address" },
    { id: "pincode", label: "PIN Code", visible: true, section: "Address" },
    { id: "notes", label: "Notes", visible: true, section: "Notes" },
  ],
  "form-leads": [
    { id: "contactId", label: "Contact", visible: true, section: "Lead Information", required: true },
    { id: "organizationId", label: "Organization", visible: true, section: "Lead Information" },
    { id: "priority", label: "Priority", visible: true, section: "Lead Information" },
    { id: "expectedValue", label: "Expected Value", visible: true, section: "Lead Information" },
    { id: "expectedCloseDate", label: "Expected Close Date", visible: true, section: "Lead Information" },
    { id: "leadTypeId", label: "Lead Type", visible: true, section: "Classification" },
    { id: "leadCategoryId", label: "Lead Category", visible: true, section: "Classification" },
    { id: "leadGroupId", label: "Lead Group", visible: true, section: "Classification" },
    { id: "customerBudgetId", label: "Customer Budget", visible: true, section: "Classification" },
    { id: "previousSoftwareId", label: "Previous Software", visible: true, section: "Classification" },
    { id: "itInfraId", label: "IT Infrastructure", visible: true, section: "Classification" },
    { id: "notes", label: "Notes", visible: true, section: "Notes" },
  ],
};
