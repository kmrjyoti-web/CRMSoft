#!/bin/bash
# Usage: pnpm gen:feature <name>
# Example: pnpm gen:feature contacts

NAME=$1
if [ -z "$NAME" ]; then
  echo "Usage: pnpm gen:feature <feature-name>"
  echo "   Example: pnpm gen:feature contacts"
  exit 1
fi

UPPER="$(tr '[:lower:]' '[:upper:]' <<< ${NAME:0:1})${NAME:1}"
BASE="src/features/$NAME"

if [ -d "$BASE" ]; then
  echo "Feature '$NAME' already exists"
  exit 1
fi

echo "Creating feature: $NAME"

mkdir -p "$BASE/components/__tests__"
mkdir -p "$BASE/hooks"
mkdir -p "$BASE/services/__tests__"
mkdir -p "$BASE/types"
mkdir -p "$BASE/utils"

# types
cat > "$BASE/types/${NAME}.types.ts" << EOF
export interface ${UPPER}Item {
  id: string;
  tenantId: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ${UPPER}ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ${UPPER}CreateData {
  // TODO: add fields
}

export interface ${UPPER}UpdateData {
  // TODO: add fields
}
EOF

# service
cat > "$BASE/services/${NAME}.service.ts" << EOF
import apiClient from '@/services/api-client';

import type { ${UPPER}Item, ${UPPER}ListParams, ${UPPER}CreateData, ${UPPER}UpdateData } from '../types/${NAME}.types';
import type { ApiResponse } from '@/types/api-response';

const BASE_URL = '/admin/${NAME}';

export const ${NAME}Service = {
  getAll: (params?: ${UPPER}ListParams) =>
    apiClient.get<ApiResponse<${UPPER}Item[]>>(BASE_URL, { params }).then(r => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<${UPPER}Item>>(\`\${BASE_URL}/\${id}\`).then(r => r.data),

  create: (payload: ${UPPER}CreateData) =>
    apiClient.post<ApiResponse<${UPPER}Item>>(BASE_URL, payload).then(r => r.data),

  update: (id: string, payload: ${UPPER}UpdateData) =>
    apiClient.patch<ApiResponse<${UPPER}Item>>(\`\${BASE_URL}/\${id}\`, payload).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(\`\${BASE_URL}/\${id}\`).then(r => r.data),
};
EOF

# hook
cat > "$BASE/hooks/use${UPPER}.ts" << EOF
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ${NAME}Service } from '../services/${NAME}.service';

import type { ${UPPER}ListParams, ${UPPER}CreateData, ${UPPER}UpdateData } from '../types/${NAME}.types';

const KEY = '${NAME}';

export function use${UPPER}List(params?: ${UPPER}ListParams) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => ${NAME}Service.getAll(params) });
}

export function use${UPPER}Detail(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => ${NAME}Service.getById(id), enabled: !!id });
}

export function useCreate${UPPER}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ${UPPER}CreateData) => ${NAME}Service.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdate${UPPER}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ${UPPER}UpdateData }) => ${NAME}Service.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDelete${UPPER}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ${NAME}Service.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
EOF

# component
cat > "$BASE/components/${UPPER}List.tsx" << EOF
'use client';

import { Button, Icon, Typography } from '@/components/ui';

import { use${UPPER}List } from '../hooks/use${UPPER}';

export function ${UPPER}List() {
  const { data, isLoading, error } = use${UPPER}List();

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading ${NAME}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Typography variant="heading" level={4}>${UPPER}</Typography>
        <Button variant="primary">
          <Icon name="plus" size={16} /> Add
        </Button>
      </div>
    </div>
  );
}
EOF

# component test
cat > "$BASE/components/__tests__/${UPPER}List.test.tsx" << EOF
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ${UPPER}List } from '../${UPPER}List';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('${UPPER}List', () => {
  it('renders', () => {
    const { container } = render(
      <QueryClientProvider client={qc}><${UPPER}List /></QueryClientProvider>
    );
    expect(container).toBeTruthy();
  });
});
EOF

# service test
cat > "$BASE/services/__tests__/${NAME}.service.test.ts" << EOF
import { ${NAME}Service } from '../${NAME}.service';

jest.mock('@/services/api-client', () => ({
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

describe('${NAME}Service', () => {
  it('has all CRUD methods', () => {
    expect(${NAME}Service.getAll).toBeDefined();
    expect(${NAME}Service.getById).toBeDefined();
    expect(${NAME}Service.create).toBeDefined();
    expect(${NAME}Service.update).toBeDefined();
    expect(${NAME}Service.delete).toBeDefined();
  });
});
EOF

echo ""
echo "Feature '$NAME' created!"
echo ""
find "$BASE" -type f | sort | sed 's/^/  /'
echo ""
echo "Next:"
echo "  1. Edit: $BASE/types/${NAME}.types.ts"
echo "  2. Build: $BASE/components/${UPPER}List.tsx"
echo "  3. Route: src/app/(protected)/${NAME}/page.tsx"
echo "  4. Test: pnpm test:features"
