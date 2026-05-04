'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function SettingsDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      {/* ── Users ──────────────────────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="database" size={14} className="text-blue-600" />
          </span>
          Users &mdash; Model &amp; API
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model User {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, firstName, lastName, email, phone?</p>
          <p className="ml-4 text-gray-500">userType: ADMIN | MANAGER | EXECUTIVE</p>
          <p className="ml-4 text-gray-500">status: ACTIVE | INACTIVE, roleId &rarr; Role</p>
          <p className="ml-4 text-gray-500">createdAt, updatedAt, deletedAt?</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
        <div className="mt-3 space-y-1.5">
          {[
            { method: 'GET', path: '/api/v1/users', desc: 'List (paginated, filter by role/status/userType)' },
            { method: 'GET', path: '/api/v1/users/:id', desc: 'Detail with role relation' },
            { method: 'POST', path: '/api/v1/users', desc: 'Create (firstName, lastName, email, roleId)' },
            { method: 'PUT', path: '/api/v1/users/:id', desc: 'Update user fields' },
            { method: 'POST', path: '/api/v1/users/:id/activate', desc: 'Set status = ACTIVE' },
            { method: 'POST', path: '/api/v1/users/:id/deactivate', desc: 'Set status = INACTIVE' },
            { method: 'POST', path: '/api/v1/users/:id/soft-delete', desc: 'Move to recycle bin (sets deletedAt)' },
            { method: 'POST', path: '/api/v1/users/:id/restore', desc: 'Restore from recycle bin' },
            { method: 'DELETE', path: '/api/v1/users/:id/permanent', desc: 'Permanent hard delete' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'PUT' ? 'warning' : 'danger'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Roles ──────────────────────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="shield" size={14} className="text-green-600" />
          </span>
          Roles &mdash; Model &amp; API
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model Role {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, name, displayName, description?</p>
          <p className="ml-4 text-gray-500">isSystem Boolean, permissions[] &rarr; Permission</p>
          <p className="ml-4 text-gray-500">users[] &rarr; User</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
        <div className="mt-3 space-y-1.5">
          {[
            { method: 'GET', path: '/api/v1/roles', desc: 'List all roles' },
            { method: 'GET', path: '/api/v1/roles/:id', desc: 'Detail with permissions[]' },
            { method: 'POST', path: '/api/v1/roles', desc: 'Create (name, displayName, description)' },
            { method: 'PUT', path: '/api/v1/roles/:id', desc: 'Update role fields' },
            { method: 'DELETE', path: '/api/v1/roles/:id', desc: 'Delete role (fails if users assigned)' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'PUT' ? 'warning' : 'danger'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Permissions ────────────────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Icon name="lock" size={14} className="text-amber-600" />
          </span>
          Permissions &mdash; API
        </h3>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/api/v1/permissions', desc: 'List all permission definitions' },
            { method: 'GET', path: '/api/v1/permissions/matrix', desc: 'Role-permission matrix (Record<roleId, permissionId[]>)' },
            { method: 'PUT', path: '/roles/:roleId/permissions', desc: 'Update permissions for a role (permissionIds[])' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'PUT' ? 'warning' : 'danger'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lookups ────────────────────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
            <Icon name="list" size={14} className="text-purple-600" />
          </span>
          Lookups &mdash; Model &amp; API
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model Lookup {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, category (unique code), displayName</p>
          <p className="ml-4 text-gray-500">isSystem Boolean, isActive Boolean</p>
          <p className="ml-4 text-gray-500">values[] &rarr; LookupValue (value, label, sortOrder, isActive)</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
        <div className="mt-3 space-y-1.5">
          {[
            { method: 'GET', path: '/api/v1/lookups', desc: 'List categories (activeOnly param)' },
            { method: 'GET', path: '/api/v1/lookups/:id', desc: 'Detail with values[]' },
            { method: 'POST', path: '/api/v1/lookups', desc: 'Create category' },
            { method: 'PUT', path: '/api/v1/lookups/:id', desc: 'Update category' },
            { method: 'POST', path: '/api/v1/lookups/:id/deactivate', desc: 'Deactivate category' },
            { method: 'POST', path: '/api/v1/lookups/:id/values', desc: 'Add value to category' },
            { method: 'PUT', path: '/api/v1/lookups/values/:valueId', desc: 'Update a value' },
            { method: 'POST', path: '/api/v1/lookups/values/:valueId/deactivate', desc: 'Deactivate a value' },
            { method: 'POST', path: '/api/v1/lookups/:id/values/reorder', desc: 'Reorder values (orderedIds[])' },
            { method: 'POST', path: '/api/v1/lookups/reset-defaults', desc: 'Restore system lookups from seed data' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'PUT' ? 'warning' : 'danger'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Menu Editor ────────────────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
            <Icon name="menu" size={14} className="text-indigo-600" />
          </span>
          Menu Editor &mdash; API
        </h3>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/api/v1/menus/tree', desc: 'Full menu tree (nested children)' },
            { method: 'GET', path: '/api/v1/menus/:id', desc: 'Single menu item' },
            { method: 'POST', path: '/api/v1/menus', desc: 'Create menu item (label, icon, href, parentId?)' },
            { method: 'PUT', path: '/api/v1/menus/:id', desc: 'Update menu item' },
            { method: 'POST', path: '/api/v1/menus/:id/deactivate', desc: 'Deactivate menu item' },
            { method: 'POST', path: '/api/v1/menus/reorder', desc: 'Reorder menu items (drag-and-drop)' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'PUT' ? 'warning' : 'danger'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Frontend Architecture ──────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100">
            <Icon name="layers" size={14} className="text-cyan-600" />
          </span>
          Frontend Architecture
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="text-gray-500">app/(main)/settings/users/page.tsx</p>
          <p className="ml-4 text-blue-700">&rarr; UserList.tsx (TableFull, tableKey=&quot;users&quot;)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; useEntityPanel &rarr; UserForm (sidebar)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Switch toggle for activate/deactivate</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; BulkActionsBar + BulkDeleteDialog</p>
          <p className="text-gray-500 mt-2">app/(main)/settings/roles/page.tsx &rarr; RoleList.tsx</p>
          <p className="text-gray-500">app/(main)/settings/permissions/page.tsx &rarr; PermissionMatrix.tsx</p>
          <p className="text-gray-500">app/(main)/settings/lookups/page.tsx &rarr; LookupList.tsx</p>
          <p className="text-gray-500">app/(main)/settings/menus/page.tsx &rarr; MenuEditor.tsx</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Services: <Code>usersService</Code>, <Code>rolesService</Code>, <Code>permissionsService</Code>, <Code>lookupsService</Code>, <Code>menusAdminService</Code></p>
          <p className="text-gray-500">User hooks: <Code>useUsersList</Code>, <Code>useCreateUser</Code>, <Code>useUpdateUser</Code>, <Code>useSoftDeleteUser</Code>, <Code>useActivateUser</Code>, <Code>useDeactivateUser</Code></p>
          <p className="text-gray-500">Role hooks: <Code>useRolesList</Code>, <Code>useCreateRole</Code>, <Code>useUpdateRole</Code>, <Code>useDeleteRole</Code></p>
          <p className="text-gray-500">User columns: name, email, phone, role, userType, status (Switch), createdAt</p>
        </div>
      </section>

      {/* ── Key Patterns ───────────────────────────────────── */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
            <Icon name="alert-triangle" size={14} className="text-red-600" />
          </span>
          Key Patterns
        </h3>
        <ul className="space-y-2 text-xs">
          <li className="flex items-start gap-2">
            <Icon name="alert-triangle" size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span>User status toggle uses <Code>POST /users/:id/activate</Code> and <Code>/deactivate</Code> (not PATCH)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Soft delete sets <Code>deletedAt</Code> and invalidates both <Code>[&quot;users&quot;]</Code> and <Code>[&quot;recycle-bin&quot;]</Code> query keys</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Permissions use a matrix view: roles as columns, permissions as rows with checkbox toggles</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Lookups: 25 system categories seeded from <Code>lookup-seed-data.ts</Code> &mdash; &ldquo;Reset Defaults&rdquo; restores all system values</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Menu Editor uses drag-and-drop reordering with nested parent-child tree structure</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>User list <Code>flattenUsers</Code> merges <Code>firstName + lastName</Code> into <Code>name</Code> and extracts <Code>role.displayName</Code></span>
          </li>
        </ul>
      </section>
    </div>
  );
}
