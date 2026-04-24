'use client';

import { Icon } from '@/components/ui';

export function ProductListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="package" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Products list is your full product catalog. Each product has pricing
          (MRP, sale price), tax details (HSN code, GST rate), brand/manufacturer
          links, and unit configuration. Products are used in quotations, invoices,
          and sales workflows.
        </p>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="activity" size={14} className="text-green-600" />
          </span>
          Typical Workflow
        </h3>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>First set up Brands and Manufacturers (they appear in product dropdowns)</li>
          <li>Click <strong>+ Create</strong> to add a product</li>
          <li>Enter name, SKU code, and select brand/manufacturer</li>
          <li>Set pricing: MRP, sale price, purchase price, cost price</li>
          <li>Configure tax: HSN code and GST rate</li>
          <li>Choose primary unit (Piece, Box, KG, etc.)</li>
          <li>Save — the product is available for quotations and invoices</li>
        </ol>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Icon name="info" size={14} className="text-amber-600" />
          </span>
          Tips
        </h3>
        <div className="space-y-2">
          <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <strong>HSN Code</strong> is required for GST compliance — it determines the tax category of the product.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Use <strong>tags</strong> to categorize products for quick filtering (e.g., &quot;electronics&quot;, &quot;consumable&quot;).
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            Products support a <strong>parent-child hierarchy</strong> — create a master product with variants as children.
          </div>
        </div>
      </section>
    </div>
  );
}
