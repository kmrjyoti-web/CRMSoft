'use client';

import { Icon } from '@/components/ui';

export function UnitListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="hash" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Units page shows all available measurement units in the system
          (Piece, Box, Pack, KG, Litre, Meter, etc.). These units are used
          when configuring products — each product has a primary unit and
          optionally a secondary unit with a conversion factor.
        </p>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="activity" size={14} className="text-green-600" />
          </span>
          How Units Work
        </h3>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>Units are <strong>system-defined</strong> — they cannot be added or removed</li>
          <li>When creating a product, choose its <strong>Primary Unit</strong> (e.g., Piece)</li>
          <li>Optionally set a <strong>Secondary Unit</strong> with conversion factor (e.g., 1 Box = 12 Pieces)</li>
          <li>Unit conversions affect order quantities, packing, and inventory calculations</li>
        </ol>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Icon name="info" size={14} className="text-amber-600" />
          </span>
          Available Units
        </h3>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            'Piece', 'Box', 'Pack', 'Carton', 'Kilogram', 'Gram',
            'Litre', 'Millilitre', 'Meter', 'Centimeter', 'Square Foot',
            'Square Meter', 'Dozen', 'Set', 'Pair', 'Roll', 'Bundle',
          ].map((u) => (
            <div key={u} className="rounded border border-gray-100 bg-gray-50 px-2 py-1">{u}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
