# ═══════════════════════════════════════════════════════════════════════
# CRM ADMIN UI — STRICT PROJECT RULES
# ═══════════════════════════════════════════════════════════════════════
# ANY AI MODEL MUST READ THIS ENTIRE DOCUMENT BEFORE WRITING CODE
# VIOLATIONS OF THESE RULES WILL BREAK THE BUILD
# NO EXCEPTIONS — NO "JUST THIS ONCE" — NO SHORTCUTS
# ═══════════════════════════════════════════════════════════════════════

---

# SECTION 1: PROJECT IDENTITY

## 1.1 What Is This Project?
- **Name:** CRM Admin Panel
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **UI Library:** CoreUI (custom fork, AIC-prefixed, via Git submodule)
- **State:** Zustand (client) + TanStack React Query (server)
- **Forms:** react-hook-form + zod validation
- **Backend:** NestJS (separate repo — already built)
- **Port:** Frontend runs on `localhost:3005`, Backend on `localhost:3000`

## 1.2 Repository Structure
```
CRM/
├── API/                    ← NestJS Backend (DO NOT TOUCH from UI work)
└── UI/
    └── crm-admin/          ← THIS PROJECT (Next.js)
        ├── lib/coreui/     ← Git submodule (NEVER edit directly)
        ├── src/            ← ALL work happens here
        ├── scripts/        ← Generator scripts
        └── package.json
```

## 1.3 Current Status (Update After Each Session)
```
✅ DONE:  Prompts 1-4 (Setup, Auth, Login, Layout)
✅ DONE:  AIC Rename (56 components: Smart* → AIC*)
✅ DONE:  Wrapper Layer (56 wrappers + Icon + tests)
✅ DONE:  ESLint Golden Rule enforcement
✅ DONE:  CSS Import Order fixed
✅ DONE:  crm-theme.css token overrides
✅ DONE:  package.json (30+ scripts)
→ NEXT:  Prompt 5 (Features Migration + Shared Components)
```

---

# SECTION 2: THE 10 UNBREAKABLE RULES

These rules are NON-NEGOTIABLE. If you are an AI model and you violate
any of these, the project WILL break and the developer WILL have to
spend hours fixing your mistakes.

## RULE 1: NEVER IMPORT @coreui OUTSIDE src/components/ui/
```
FORBIDDEN:
   import { AICInput } from '@coreui/ui-react';        // in any feature file
   import { AICButton } from '@coreui/ui-react';       // in any page
   import { AICTable } from '@coreui/ui-react';        // in any component

CORRECT:
   import { Input, Button, Table } from '@/components/ui';
```
**WHY:** ESLint will throw a build error. Only `src/components/ui/*.tsx`
files are allowed to import from `@coreui/*`. This is enforced at build time.

## RULE 2: NEVER IMPORT lucide-react OUTSIDE src/components/ui/Icon.tsx
```
FORBIDDEN:
   import { Mail, Lock, Search } from 'lucide-react';  // in any file
   import { Plus } from 'lucide-react';                 // in any component

CORRECT:
   import { Icon } from '@/components/ui';
   <Icon name="mail" />
   <Icon name="lock" />
   <Icon name="search" />
   <Icon name="plus" size={16} />
```
**WHY:** Single icon entry point. Adding new icons = edit Icon.tsx ICON_MAP only.

## RULE 3: NEVER USE INLINE SVGs
```
FORBIDDEN:
   <svg xmlns="..." viewBox="..."><path d="..." /></svg>

CORRECT:
   <Icon name="mail" size={18} />
```
**WHY:** Icon consistency. `pnpm check:svg` will catch violations.

## RULE 4: NEVER EDIT FILES IN lib/coreui/
```
FORBIDDEN:
   Editing any file inside lib/coreui/ to fix a styling issue
   Adding CSS overrides inside lib/coreui/packages/theme/

CORRECT:
   Edit src/styles/crm-theme.css for token overrides
   Edit src/components/ui/X.tsx for wrapper defaults
```
**WHY:** `lib/coreui/` is a Git submodule. Edits here will create merge
conflicts and break the update workflow.

## RULE 5: NEVER USE SmartTextbox, SmartButton, OR ANY Smart* NAME
```
FORBIDDEN (THESE NO LONGER EXIST IN COREUI):
   <SmartTextbox label="Email" />
   import { SmartTextbox } from '@coreui/ui-react';

CORRECT (USE WRAPPER NAMES):
   <Input label="Email" />
   import { Input } from '@/components/ui';
```
**WHY:** All CoreUI components were renamed from `Smart*` to `AIC*` on
the `crm-custom` branch. The wrapper layer uses clean names (Input, Button, etc).

**EXCEPTION — Type discriminator strings stay as originals:**
```
OK:    type: "smart-toolbar"     (KEEP — internal CoreUI string)
WRONG: type: "aic-toolbar"       (WRONG — breaks CoreUI internals)
```

## RULE 6: ROUTE PAGES MUST BE THIN
```
FORBIDDEN — Fat page with 200+ lines of logic:
   // app/(main)/contacts/page.tsx
   export default function ContactsPage() {
     const [data, setData] = useState([]);
     // ... 200 lines of component logic
   }

CORRECT — Thin page that delegates to feature component:
   // app/(main)/contacts/page.tsx
   import { ContactList } from '@/features/contacts/components/ContactList';
   export default function ContactsPage() {
     return <ContactList />;
   }
```
**WHY:** Pages are routing endpoints only. All logic lives in `src/features/`.

## RULE 7: FEATURE FILES STAY IN THEIR FEATURE FOLDER
```
FORBIDDEN:
   src/components/contacts/ContactForm.tsx     (wrong location)
   src/services/contact.service.ts             (wrong — should be in feature)

CORRECT:
   src/features/contacts/components/ContactForm.tsx
   src/features/contacts/services/contact.service.ts
   src/features/contacts/types/contact.types.ts
   src/features/contacts/hooks/useContacts.ts
```
**EXCEPTION — These are SHARED (not feature-specific):**
```
   src/services/api-client.ts          ← Used by ALL features
   src/services/lookup.service.ts      ← Used by ALL features
   src/stores/*.ts                     ← Global state
   src/hooks/useLookup.ts              ← Global hook
   src/types/api-response.ts           ← Global type
```

## RULE 8: NEVER CHANGE THE CSS IMPORT ORDER
```
// src/app/layout.tsx — THIS ORDER IS LOCKED
import "./globals.css";                    // 1. Tailwind (preflight: false)
import "@coreui/theme/tokens/default.css"; // 2. CoreUI token defaults
import "@coreui/ui/styles/base.css";       // 3. CoreUI --st-* tokens
import "../styles/crm-theme.css";          // 4. CRM overrides (LAST = wins)
```
**WHY:** This specific order prevents Tailwind/CoreUI conflicts.

## RULE 9: ALWAYS USE 'import type' FOR TYPE-ONLY IMPORTS
```
FORBIDDEN:
   import { ContactItem } from '../types/contact.types';

CORRECT:
   import type { ContactItem } from '../types/contact.types';
```
**WHY:** ESLint rule `@typescript-eslint/consistent-type-imports` enforces this.

## RULE 10: ALWAYS VALIDATE BEFORE CLAIMING "DONE"
```bash
pnpm validate:quick          # Before every commit
pnpm validate                # Before every PR
pnpm coreui:check:imports    # After CoreUI changes
pnpm check:all               # Full health check
```

---

# SECTION 3: ARCHITECTURE RULES

## 3.1 Three-Layer Import Chain
```
LAYER 1                    LAYER 2                  LAYER 3
lib/coreui/                src/components/ui/       src/features/
┌────────────┐             ┌──────────────┐         ┌──────────────┐
│ AICInput   │─────────────│ Input.tsx    │─────────│ ContactForm  │
│ AICButton  │  ONLY these │ Button.tsx   │  ONLY   │ LoginForm    │
│ AICTable   │  files can  │ Table.tsx    │  import  │ LeadList     │
│ ...56 AIC* │  import     │ Icon.tsx     │  from    │ Dashboard    │
│            │  @coreui    │ index.ts     │  @/ui    │ ...          │
└────────────┘             └──────────────┘         └──────────────┘
```

## 3.2 File Placement Decision Tree
```
UI primitive (button, input, modal)?
  YES → src/components/ui/X.tsx (wrapper around AIC*)

Shared across ALL features (gates, page header, breadcrumb)?
  YES → src/components/common/X.tsx

Global hook used by 3+ features?
  YES → src/hooks/useX.ts

Global store?
  YES → src/stores/x.store.ts

Shared API service (api-client, lookup, menu)?
  YES → src/services/x.service.ts

Feature-specific?
  YES → src/features/<feature-name>/
```

## 3.3 Feature Module Structure (DDD Pattern)
```
src/features/contacts/
├── components/
│   ├── ContactList.tsx
│   ├── ContactForm.tsx
│   ├── ContactDetail.tsx
│   └── __tests__/
├── hooks/
│   └── useContacts.ts
├── services/
│   ├── contact.service.ts
│   └── __tests__/
├── types/
│   └── contact.types.ts
└── utils/
```

---

# SECTION 4: NAMING CONVENTIONS

## 4.1 Files
```
Components:     PascalCase.tsx          ContactForm.tsx
Hooks:          camelCase.ts            useContacts.ts
Services:       kebab-case.service.ts   contact.service.ts
Types:          kebab-case.types.ts     contact.types.ts
Stores:         kebab-case.store.ts     auth.store.ts
Utils:          kebab-case.ts           format-currency.ts
Tests:          X.test.tsx              ContactList.test.tsx
```

## 4.2 API Service Methods
```
getAll()   → GET    /api/v1/admin/contacts
getById()  → GET    /api/v1/admin/contacts/:id
create()   → POST   /api/v1/admin/contacts
update()   → PATCH  /api/v1/admin/contacts/:id
delete()   → DELETE /api/v1/admin/contacts/:id
```

## 4.3 TanStack Query Keys
```
const KEY = 'contacts';
useQuery({ queryKey: [KEY, params] })    // list
useQuery({ queryKey: [KEY, id] })        // detail
```

---

# SECTION 5: CODE PATTERNS (COPY-PASTE THESE)

## 5.1 Feature Service Pattern
```tsx
import apiClient from '@/services/api-client';
import type { ContactItem } from '../types/contact.types';
import type { ApiResponse } from '@/types/api-response';

const BASE_URL = '/admin/contacts';

export const contactService = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse<ContactItem[]>>(BASE_URL, { params }).then(r => r.data),
  getById: (id: string) =>
    apiClient.get<ApiResponse<ContactItem>>(`${BASE_URL}/${id}`).then(r => r.data),
  create: (payload: ContactCreateData) =>
    apiClient.post<ApiResponse<ContactItem>>(BASE_URL, payload).then(r => r.data),
  update: (id: string, payload: ContactUpdateData) =>
    apiClient.patch<ApiResponse<ContactItem>>(`${BASE_URL}/${id}`, payload).then(r => r.data),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`).then(r => r.data),
};
```

## 5.2 Feature Hook Pattern
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../services/contact.service';

const KEY = 'contacts';

export function useContactList(params?: ContactListParams) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => contactService.getAll(params) });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ContactCreateData) => contactService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
```

## 5.3 Thin Page Pattern
```tsx
// src/app/(main)/contacts/page.tsx
import { ContactList } from '@/features/contacts/components/ContactList';

export default function ContactsPage() {
  return <ContactList />;
}
```

---

# SECTION 6: TESTING RULES

## 6.1 What to Test
```
MUST TEST:
  Every wrapper in src/components/ui/
  Every service method
  Every form (validation, submit, error states)
  PermissionGate (show/hide)
  Store actions

DON'T TEST:
  index.ts barrel exports
  Type files
  Page files (test the feature component instead)
  CoreUI internals
```

## 6.2 Coverage Thresholds
```
Global:           60% lines, 50% branches
src/components/ui: 80% lines, 70% branches
```

---

# SECTION 7: IMPORT CHEATSHEET

```tsx
// UI COMPONENTS (from wrapper — the ONLY way)
import {
  Input, Select, Checkbox, Radio, Switch,
  SelectInput, MultiSelectInput, DatePicker, CurrencyInput,
  NumberInput, MobileInput, InputMask, Autocomplete, TagsInput,
  Rating, Slider, ColorPicker, FileUpload, Signature, RichTextEditor,
  ListCheckbox, SegmentedControl, ToggleButton,
  Button, SmartButton, DialogButton,
  Modal, Drawer, SmartDialog, ConfirmDialog, Tooltip, Popover,
  Badge, Avatar, Typography, SmartError,
  Table, DynamicForm, DynamicField, SchemaBuilder, Fieldset,
  Toolbar, ToolbarButton,
  Icon,
} from '@/components/ui';

// COMMON
import { PermissionGate } from '@/components/common/PermissionGate';
import { PageHeader } from '@/components/common/PageHeader';
import { LookupSelect } from '@/components/common/LookupSelect';

// GLOBAL
import { useAuthStore } from '@/stores/auth.store';
import apiClient from '@/services/api-client';

// TYPES
import type { ContactItem } from '../types/contact.types';
import type { ApiResponse } from '@/types/api-response';
```

---

# SECTION 8: UI COMPONENT QUICK MAP

```
TEXT INPUT     → <Input label="..." />
EMAIL          → <Input label="Email" type="email" />
PASSWORD       → <Input label="Password" type="password" />
DROPDOWN       → <SelectInput label="Status" options={[...]} />
MULTI-SELECT   → <MultiSelectInput label="Tags" options={[...]} />
DATE           → <DatePicker label="Date" />
CURRENCY       → <CurrencyInput label="Amount" currency="INR" />
PHONE          → <MobileInput label="Phone" defaultCountry="IN" />
NUMBER         → <NumberInput label="Qty" min={1} />
MASK           → <InputMask label="GST" mask="99AAAAA9999A9A9" />
CHECKBOX       → <Checkbox label="Remember me" />
SWITCH         → <Switch label="Active" />
RATING         → <Rating label="Priority" max={5} />
FILE UPLOAD    → <FileUpload label="Document" />
BUTTON         → <Button variant="primary">Add</Button>
ICON           → <Icon name="mail" size={18} />
TABLE          → <Table columns={cols} data={data} />
BADGE          → <Badge variant="success">Active</Badge>
MODAL          → <Modal title="Confirm">...</Modal>
FORM GROUP     → <Fieldset label="Personal">...</Fieldset>
LOOKUP         → <LookupSelect masterCode="INDUSTRY_TYPE" label="Industry" />
```

---

# END OF STRICT RULES DOCUMENT
# Last Updated: 2026-02-28
# Version: 1.0
