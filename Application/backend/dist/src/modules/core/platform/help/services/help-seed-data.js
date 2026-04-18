"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpSeedData = void 0;
exports.helpSeedData = [
    {
        articleCode: 'USER_ADD_CONTACTS',
        title: 'How to Add {contact}s',
        content: 'To add a new {contact} in {product}, navigate to the {contact}s module from the sidebar. ' +
            'Click the "Create" button at the top-right corner. Fill in the required fields such as ' +
            'Name, Email, and Phone. You can also associate the {contact} with an {organization}. ' +
            'Click "Save" to create the {contact}.\n\n' +
            '**Quick Tips:**\n' +
            '- Use the bulk import feature to add multiple {contact}s at once.\n' +
            '- Required fields are marked with an asterisk (*).\n' +
            '- You can add custom fields from Settings > Custom Fields.',
        summary: 'Step-by-step guide to adding new contacts in the CRM.',
        helpType: 'USER',
        moduleCode: 'CONTACTS',
        screenCode: 'CONTACT_LIST',
        fieldCode: null,
        applicableTypes: ['ALL'],
        usesTerminology: true,
        videoUrl: null,
        relatedArticles: ['USER_MANAGING_LEADS', 'USER_CREATING_QUOTATIONS'],
        visibleToRoles: ['ALL'],
        tags: ['contacts', 'getting-started', 'create'],
        isPublished: true,
    },
    {
        articleCode: 'USER_CREATING_QUOTATIONS',
        title: 'Creating Quotations',
        content: 'To create a quotation in {product}, go to the Quotations module. ' +
            'Click "Create New Quotation" and select a {contact} or {organization}. ' +
            'Add line items with products, quantities, and pricing. ' +
            'The system automatically calculates GST based on your tax configuration.\n\n' +
            '**GST Calculation:**\n' +
            '- CGST + SGST for intra-state transactions\n' +
            '- IGST for inter-state transactions\n' +
            '- Tax rates are configurable per product\n\n' +
            'Click "Save as Draft" or "Send to Client" when ready.',
        summary: 'Learn how to create and send quotations with automatic GST calculations.',
        helpType: 'USER',
        moduleCode: 'QUOTATIONS',
        screenCode: 'QUOTATION_FORM',
        fieldCode: null,
        applicableTypes: ['ALL'],
        usesTerminology: true,
        videoUrl: null,
        relatedArticles: ['USER_ADD_CONTACTS'],
        visibleToRoles: ['ALL'],
        tags: ['quotations', 'gst', 'sales'],
        isPublished: true,
    },
    {
        articleCode: 'USER_MANAGING_LEADS',
        title: 'Managing Leads with Kanban Board',
        content: 'The {product} Leads module provides a powerful Kanban board for visual pipeline management. ' +
            'Each column represents a lead stage (New, Contacted, Qualified, Proposal, Negotiation, Won, Lost).\n\n' +
            '**Using the Kanban Board:**\n' +
            '- Drag and drop leads between stages\n' +
            '- Click on a lead card to view/edit details\n' +
            '- Use filters to focus on specific lead sources or owners\n' +
            '- Switch to table view for bulk operations\n\n' +
            'You can also create a new lead directly from the Kanban view.',
        summary: 'Guide to managing leads using the visual Kanban board and pipeline stages.',
        helpType: 'USER',
        moduleCode: 'LEADS',
        screenCode: 'LEAD_KANBAN',
        fieldCode: null,
        applicableTypes: ['ALL'],
        usesTerminology: true,
        videoUrl: null,
        relatedArticles: ['USER_ADD_CONTACTS', 'USER_CREATING_QUOTATIONS'],
        visibleToRoles: ['ALL'],
        tags: ['leads', 'kanban', 'pipeline', 'sales'],
        isPublished: true,
    },
    {
        articleCode: 'USER_WHATSAPP_SETUP',
        title: 'Setting Up WhatsApp Integration',
        content: 'To enable WhatsApp messaging in {product}, go to Settings > Communication > WhatsApp.\n\n' +
            '**Setup Steps:**\n' +
            '1. Enter your WhatsApp Business API credentials\n' +
            '2. Configure your phone number and display name\n' +
            '3. Create message templates (must be approved by WhatsApp)\n' +
            '4. Test the connection with a sample message\n\n' +
            '**Template Variables:**\n' +
            '- Use {{1}}, {{2}} for dynamic content in templates\n' +
            '- Templates support text, images, and documents\n\n' +
            'Once configured, you can send WhatsApp messages from {contact} profiles and lead details.',
        summary: 'Configure WhatsApp Business API integration for sending messages from the CRM.',
        helpType: 'USER',
        moduleCode: 'COMMUNICATIONS',
        screenCode: 'WHATSAPP_SETTINGS',
        fieldCode: null,
        applicableTypes: ['ALL'],
        usesTerminology: true,
        videoUrl: null,
        relatedArticles: ['USER_ADD_CONTACTS'],
        visibleToRoles: ['ADMIN'],
        tags: ['whatsapp', 'communication', 'integration', 'setup'],
        isPublished: true,
    },
    {
        articleCode: 'USER_DASHBOARD_GUIDE',
        title: 'Understanding the Dashboard',
        content: 'The {product} Dashboard provides a real-time overview of your business metrics.\n\n' +
            '**KPI Cards:**\n' +
            '- Total {contact}s, Active Leads, Open Quotations, Revenue\n' +
            '- Cards show current values with percentage change from last period\n\n' +
            '**Charts:**\n' +
            '- Lead Pipeline funnel chart\n' +
            '- Revenue trend line chart (monthly/quarterly)\n' +
            '- Activity summary bar chart\n' +
            '- Top performers leaderboard\n\n' +
            '**Customization:**\n' +
            '- Use the date range filter to adjust the reporting period\n' +
            '- Click on any chart to drill down into detailed reports\n' +
            '- Dashboard data refreshes every 5 minutes automatically.',
        summary: 'Overview of dashboard KPI cards, charts, and how to interpret your business metrics.',
        helpType: 'USER',
        moduleCode: 'DASHBOARD',
        screenCode: 'DASHBOARD_MAIN',
        fieldCode: null,
        applicableTypes: ['ALL'],
        usesTerminology: true,
        videoUrl: null,
        relatedArticles: ['USER_MANAGING_LEADS', 'USER_CREATING_QUOTATIONS'],
        visibleToRoles: ['ALL'],
        tags: ['dashboard', 'reports', 'analytics', 'kpi'],
        isPublished: true,
    },
    {
        articleCode: 'DEV_CONTACTS_API',
        title: '{contact}s API Reference',
        content: '## {contact}s API\n\n' +
            'Base URL: `/api/v1/contacts`\n\n' +
            '### Endpoints\n\n' +
            '| Method | Path | Description |\n' +
            '|--------|------|-------------|\n' +
            '| GET | `/contacts` | List all {contact}s (paginated) |\n' +
            '| GET | `/contacts/:id` | Get {contact} by ID |\n' +
            '| POST | `/contacts` | Create a new {contact} |\n' +
            '| PUT | `/contacts/:id` | Update a {contact} |\n' +
            '| DELETE | `/contacts/:id` | Soft-delete a {contact} |\n\n' +
            '### Query Parameters\n' +
            '- `page` (number): Page number (default: 1)\n' +
            '- `limit` (number): Items per page (default: 20)\n' +
            '- `search` (string): Full-text search\n' +
            '- `sortBy` (string): Sort field\n' +
            '- `sortOrder` (string): asc or desc\n\n' +
            '### Authentication\n' +
            'All endpoints require a Bearer token in the Authorization header.',
        summary: 'Complete API reference for the Contacts module endpoints.',
        helpType: 'DEVELOPER',
        moduleCode: 'CONTACTS',
        screenCode: null,
        fieldCode: null,
        applicableTypes: ['ALL'],
        usesTerminology: true,
        videoUrl: null,
        relatedArticles: ['DEV_AUTH_API', 'DEV_BULK_IMPORT_API'],
        visibleToRoles: ['ALL'],
        tags: ['api', 'contacts', 'rest', 'developer'],
        isPublished: true,
    },
    {
        articleCode: 'DEV_AUTH_API',
        title: 'Authentication API',
        content: '## Authentication API\n\n' +
            'Base URL: `/api/v1/auth`\n\n' +
            '### Endpoints\n\n' +
            '| Method | Path | Description |\n' +
            '|--------|------|-------------|\n' +
            '| POST | `/auth/login` | Authenticate and receive JWT tokens |\n' +
            '| POST | `/auth/refresh` | Refresh access token |\n' +
            '| POST | `/auth/forgot-password` | Send password reset email |\n' +
            '| POST | `/auth/reset-password` | Reset password with token |\n' +
            '| GET | `/auth/me` | Get current user profile |\n\n' +
            '### Login Request\n' +
            '```json\n' +
            '{ "email": "user@example.com", "password": "your-password" }\n' +
            '```\n\n' +
            '### Login Response\n' +
            '```json\n' +
            '{ "accessToken": "eyJ...", "refreshToken": "eyJ...", "expiresIn": 3600 }\n' +
            '```\n\n' +
            '### Token Usage\n' +
            'Include the access token in the Authorization header:\n' +
            '`Authorization: Bearer <access_token>`',
        summary: 'API reference for authentication, JWT tokens, and password management.',
        helpType: 'DEVELOPER',
        moduleCode: 'AUTH',
        screenCode: null,
        fieldCode: null,
        applicableTypes: ['ALL'],
        usesTerminology: false,
        videoUrl: null,
        relatedArticles: ['DEV_CONTACTS_API', 'DEV_WEBHOOK_INTEGRATION'],
        visibleToRoles: ['ALL'],
        tags: ['api', 'authentication', 'jwt', 'developer'],
        isPublished: true,
    },
    {
        articleCode: 'DEV_WEBHOOK_INTEGRATION',
        title: 'Webhook Integration Guide',
        content: '## Webhook Integration\n\n' +
            '{product} supports outbound webhooks for real-time event notifications.\n\n' +
            '### Supported Events\n' +
            '- `contact.created` — A new {contact} is created\n' +
            '- `contact.updated` — A {contact} is updated\n' +
            '- `lead.stage_changed` — A lead moves to a new stage\n' +
            '- `quotation.sent` — A quotation is sent to client\n' +
            '- `payment.received` — A payment is recorded\n\n' +
            '### Webhook Payload\n' +
            '```json\n' +
            '{\n' +
            '  "event": "contact.created",\n' +
            '  "timestamp": "2026-03-08T10:30:00Z",\n' +
            '  "data": { "id": "...", "name": "...", ... }\n' +
            '}\n' +
            '```\n\n' +
            '### Configuration\n' +
            'Set up webhooks at Settings > Developer > Webhooks.\n' +
            'Each webhook requires:\n' +
            '- Target URL (HTTPS only)\n' +
            '- Events to subscribe to\n' +
            '- Optional: custom headers and secret for HMAC verification',
        summary: 'Guide to setting up outbound webhooks for real-time CRM event notifications.',
        helpType: 'DEVELOPER',
        moduleCode: 'DEVELOPER',
        screenCode: null,
        fieldCode: null,
        applicableTypes: ['ALL'],
        usesTerminology: true,
        videoUrl: null,
        relatedArticles: ['DEV_AUTH_API', 'DEV_CUSTOM_FIELDS_API'],
        visibleToRoles: ['ALL'],
        tags: ['api', 'webhooks', 'integration', 'developer'],
        isPublished: true,
    },
    {
        articleCode: 'DEV_CUSTOM_FIELDS_API',
        title: 'Custom Fields API',
        content: '## Custom Fields API\n\n' +
            'Base URL: `/api/v1/custom-fields`\n\n' +
            '### Endpoints\n\n' +
            '| Method | Path | Description |\n' +
            '|--------|------|-------------|\n' +
            '| GET | `/custom-fields?entity=CONTACT` | List custom fields for entity |\n' +
            '| POST | `/custom-fields` | Create a custom field |\n' +
            '| PUT | `/custom-fields/:id` | Update a custom field |\n' +
            '| DELETE | `/custom-fields/:id` | Remove a custom field |\n\n' +
            '### Field Types\n' +
            '- `TEXT` — Single-line text input\n' +
            '- `TEXTAREA` — Multi-line text\n' +
            '- `NUMBER` — Numeric value\n' +
            '- `DATE` — Date picker\n' +
            '- `DROPDOWN` — Single select from options\n' +
            '- `MULTI_SELECT` — Multiple select\n' +
            '- `CHECKBOX` — Boolean toggle\n' +
            '- `URL` — URL input with validation\n\n' +
            '### Supported Entities\n' +
            'CONTACT, ORGANIZATION, LEAD, QUOTATION, PRODUCT',
        summary: 'API reference for managing custom fields on CRM entities.',
        helpType: 'DEVELOPER',
        moduleCode: 'CUSTOM_FIELDS',
        screenCode: null,
        fieldCode: null,
        applicableTypes: ['ALL'],
        usesTerminology: false,
        videoUrl: null,
        relatedArticles: ['DEV_CONTACTS_API'],
        visibleToRoles: ['ALL'],
        tags: ['api', 'custom-fields', 'developer'],
        isPublished: true,
    },
    {
        articleCode: 'DEV_BULK_IMPORT_API',
        title: 'Bulk Import API',
        content: '## Bulk Import API\n\n' +
            'Base URL: `/api/v1/bulk-import`\n\n' +
            '### Endpoints\n\n' +
            '| Method | Path | Description |\n' +
            '|--------|------|-------------|\n' +
            '| POST | `/bulk-import/upload` | Upload CSV/XLSX file |\n' +
            '| GET | `/bulk-import/jobs` | List import jobs |\n' +
            '| GET | `/bulk-import/jobs/:id` | Get import job status |\n' +
            '| POST | `/bulk-import/jobs/:id/start` | Start processing |\n\n' +
            '### File Requirements\n' +
            '- Supported formats: CSV, XLSX\n' +
            '- Maximum file size: 10MB\n' +
            '- Maximum rows per file: 10,000\n' +
            '- First row must be column headers\n\n' +
            '### Import Process\n' +
            '1. Upload file and get column mapping preview\n' +
            '2. Map CSV columns to {product} fields\n' +
            '3. Start the import job\n' +
            '4. Monitor progress via job status endpoint\n\n' +
            '### Error Handling\n' +
            'Failed rows are collected in an error report available after job completion.',
        summary: 'API reference for bulk importing contacts, leads, and other entities via CSV/XLSX.',
        helpType: 'DEVELOPER',
        moduleCode: 'BULK_IMPORT',
        screenCode: null,
        fieldCode: null,
        applicableTypes: ['ALL'],
        usesTerminology: true,
        videoUrl: null,
        relatedArticles: ['DEV_CONTACTS_API', 'DEV_CUSTOM_FIELDS_API'],
        visibleToRoles: ['ALL'],
        tags: ['api', 'bulk-import', 'csv', 'developer'],
        isPublished: true,
    },
];
//# sourceMappingURL=help-seed-data.js.map