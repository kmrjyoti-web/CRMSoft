'use client';

import { Icon } from '@/components/ui';

export function PackageListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="archive" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Packages list manages packaging configurations for your products.
          Define different packaging types (box, strip, pack, carton) with
          codes that can be referenced when creating product entries.
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
          <li>Click <strong>+ Create</strong> to define a new package type</li>
          <li>Enter a name (e.g., &quot;Box of 10&quot;), code (e.g., &quot;BOX10&quot;), and type</li>
          <li>Add optional description for internal reference</li>
          <li>Save — packages can then be referenced in product configurations</li>
        </ol>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Icon name="info" size={14} className="text-amber-600" />
          </span>
          Tips
        </h3>
        <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Use the <strong>Type</strong> field for grouping similar packages (e.g., BOX, STRIP, BLISTER).
        </div>
      </section>
    </div>
  );
}
