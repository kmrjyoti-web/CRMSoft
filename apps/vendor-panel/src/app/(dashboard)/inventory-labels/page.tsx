'use client';

import { useState } from 'react';
import { useInventoryLabels, useUpsertInventoryLabel } from '@/hooks/use-inventory-labels';
import type { InventoryLabel } from '@/lib/api/inventory-labels';

function extractList(res: unknown): InventoryLabel[] {
  if (!res) return [];
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as InventoryLabel[];
  const inner = r.data as Record<string, unknown> | undefined;
  if (inner && Array.isArray(inner.data)) return inner.data as InventoryLabel[];
  return [];
}

export default function InventoryLabelsPage() {
  const { data: res, isLoading } = useInventoryLabels();
  const upsert = useUpsertInventoryLabel();
  const labels = extractList(res);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<InventoryLabel>>({});

  function startEdit(label: InventoryLabel) {
    setEditingId(label.id);
    setForm({ ...label });
  }

  async function handleSave() {
    if (!form.industryCode) return;
    await upsert.mutateAsync(form);
    setEditingId(null);
    setForm({});
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold">Inventory Labels</h1>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Configure field labels per industry. These labels customize the inventory UI for each tenant based on their industry.
      </p>

      {isLoading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : labels.length === 0 ? (
        <div className="bg-white rounded-lg border p-10 text-center text-gray-400">
          <p className="text-lg mb-1">No labels configured</p>
          <p className="text-sm">Seed the inventory labels to configure per-industry field names.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-semibold">Industry</th>
                <th className="text-left p-3 font-semibold">Serial Label</th>
                <th className="text-left p-3 font-semibold">Code 1</th>
                <th className="text-left p-3 font-semibold">Code 2</th>
                <th className="text-left p-3 font-semibold">Expiry</th>
                <th className="text-left p-3 font-semibold">Stock In</th>
                <th className="text-left p-3 font-semibold">Stock Out</th>
                <th className="text-left p-3 font-semibold">Location</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((label) => (
                <tr key={label.id} className="border-t hover:bg-gray-50">
                  {editingId === label.id ? (
                    <>
                      <td className="p-3 font-semibold">{label.industryCode}</td>
                      <td className="p-3">
                        <input
                          className="border rounded px-2 py-1 text-sm w-full"
                          value={form.serialNoLabel ?? ''}
                          onChange={(e) => setForm({ ...form, serialNoLabel: e.target.value })}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          className="border rounded px-2 py-1 text-sm w-full"
                          value={form.code1Label ?? ''}
                          onChange={(e) => setForm({ ...form, code1Label: e.target.value })}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          className="border rounded px-2 py-1 text-sm w-full"
                          value={form.code2Label ?? ''}
                          onChange={(e) => setForm({ ...form, code2Label: e.target.value })}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          className="border rounded px-2 py-1 text-sm w-full"
                          value={form.expiryLabel ?? ''}
                          onChange={(e) => setForm({ ...form, expiryLabel: e.target.value })}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          className="border rounded px-2 py-1 text-sm w-full"
                          value={form.stockInLabel ?? ''}
                          onChange={(e) => setForm({ ...form, stockInLabel: e.target.value })}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          className="border rounded px-2 py-1 text-sm w-full"
                          value={form.stockOutLabel ?? ''}
                          onChange={(e) => setForm({ ...form, stockOutLabel: e.target.value })}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          className="border rounded px-2 py-1 text-sm w-full"
                          value={form.locationLabel ?? ''}
                          onChange={(e) => setForm({ ...form, locationLabel: e.target.value })}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            onClick={handleSave}
                            disabled={upsert.isPending}
                          >
                            {upsert.isPending ? '...' : 'Save'}
                          </button>
                          <button
                            className="px-3 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
                            onClick={() => { setEditingId(null); setForm({}); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 font-semibold capitalize">{label.industryCode}</td>
                      <td className="p-3">{label.serialNoLabel}</td>
                      <td className="p-3 text-gray-500">{label.code1Label ?? '—'}</td>
                      <td className="p-3 text-gray-500">{label.code2Label ?? '—'}</td>
                      <td className="p-3 text-gray-500">{label.expiryLabel ?? '—'}</td>
                      <td className="p-3 text-gray-500">{label.stockInLabel ?? '—'}</td>
                      <td className="p-3 text-gray-500">{label.stockOutLabel ?? '—'}</td>
                      <td className="p-3 text-gray-500">{label.locationLabel ?? '—'}</td>
                      <td className="p-3">
                        <button
                          className="px-3 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
                          onClick={() => startEdit(label)}
                        >
                          Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
