'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function ProductListDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="database" size={14} className="text-blue-600" />
          </span>
          Prisma Model (key fields)
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model Product {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, name, code, slug</p>
          <p className="ml-4 text-gray-500">parentId? → parent/children (hierarchy)</p>
          <p className="ml-4 text-gray-500">isMaster Boolean</p>
          <p className="ml-4 text-gray-500">image?, images Json?, brochureUrl?, videoUrl?</p>
          <p className="ml-4 text-gray-500">mrp, salePrice, purchasePrice, costPrice (Decimal)</p>
          <p className="ml-4 text-gray-500">taxType (GST|IGST|EXEMPT), hsnCode?, gstRate?, cessRate?</p>
          <p className="ml-4 text-gray-500">primaryUnit (UnitType enum), secondaryUnit?, conversionFactor</p>
          <p className="ml-4 text-gray-500">packingSize?, packingUnit?, barcode?, batchTracking</p>
          <p className="ml-4 text-gray-500">brandId? → Brand, manufacturerId? → Manufacturer</p>
          <p className="ml-4 text-gray-500">status (ACTIVE|INACTIVE|DRAFT|DISCONTINUED)</p>
          <p className="ml-4 text-gray-500">tags String[], configJson Json?</p>
          <p className="ml-4 text-gray-500">prices[], taxDetails[], unitConversions[], filters[]</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="globe" size={14} className="text-green-600" />
          </span>
          API Endpoints
        </h3>
        <div className="space-y-1.5">
          {[
            { method: 'POST', path: '/api/v1/products', desc: 'Create (CQRS: CreateProductCommand)' },
            { method: 'GET', path: '/api/v1/products', desc: 'List (paginated, 12+ filter params)' },
            { method: 'GET', path: '/api/v1/products/tree', desc: 'Product hierarchy tree' },
            { method: 'GET', path: '/api/v1/products/search?q=', desc: 'Quick search (limit 20)' },
            { method: 'GET', path: '/api/v1/products/:id', desc: 'Detail (CQRS: GetProductByIdQuery)' },
            { method: 'PUT', path: '/api/v1/products/:id', desc: 'Update (UpdateProductCommand)' },
            { method: 'POST', path: '/api/v1/products/:id/deactivate', desc: 'Deactivate + children' },
            { method: 'GET', path: '/api/v1/products/:id/pricing', desc: 'Pricing by price type' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : 'warning'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
            <Icon name="layers" size={14} className="text-purple-600" />
          </span>
          Frontend Architecture
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="text-gray-500">app/(main)/products/products/page.tsx</p>
          <p className="ml-4 text-blue-700">└── ProductList.tsx</p>
          <p className="ml-8 text-gray-500">├── TableFull (tableKey=&quot;products&quot;)</p>
          <p className="ml-8 text-gray-500">├── useEntityPanel → ProductForm</p>
          <p className="ml-8 text-gray-500">└── useDeactivateProduct (POST deactivate)</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>productService</Code> in products.service.ts</p>
          <p className="text-gray-500">Query key: <Code>[&quot;products&quot;, params]</Code></p>
          <p className="text-gray-500">ProductForm loads <Code>useBrandsList</Code> and <Code>useManufacturersList</Code> for dropdowns</p>
        </div>
      </section>

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
            <span>Uses <strong>CQRS pattern</strong> (CommandBus/QueryBus) — unlike Brands/Manufacturers</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Deactivate uses <Code>POST /products/:id/deactivate</Code> (not DELETE)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Related modules: ProductPricing, ProductTax, ProductUnits, ProductFilter</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Price fields are <Code>Decimal(12,2)</Code> — cast with <Code>Number()</Code> on frontend</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
