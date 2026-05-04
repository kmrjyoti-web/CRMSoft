"use client";
import { Icon } from "@/components/ui";
import type { OfferConditions } from "../types/marketplace.types";

interface OfferConditionBuilderProps {
  value: OfferConditions;
  onChange: (conditions: OfferConditions) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function OfferConditionBuilder({ value, onChange }: OfferConditionBuilderProps) {
  const update = (key: keyof OfferConditions, patch: Record<string, unknown>) => {
    onChange({ ...value, [key]: { ...((value[key] as Record<string, unknown>) ?? {}), ...patch } });
  };

  return (
    <div className="space-y-4">
      {/* Geographic */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
          <Icon name="map-pin" size={14} color="#6366f1" />
          <span className="text-sm font-semibold text-gray-700">Geographic</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">Cities (comma separated)</label>
            <input
              type="text"
              value={value.geographic?.cities?.join(', ') ?? ''}
              onChange={(e) =>
                update('geographic', { cities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
              }
              placeholder="Mumbai, Pune, Delhi"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">States (comma separated)</label>
            <input
              type="text"
              value={value.geographic?.states?.join(', ') ?? ''}
              onChange={(e) =>
                update('geographic', { states: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
              }
              placeholder="Maharashtra, Gujarat"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>
      </div>

      {/* Customer Group */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
          <Icon name="users" size={14} color="#10b981" />
          <span className="text-sm font-semibold text-gray-700">Customer Group</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">Grades (comma separated)</label>
            <input
              type="text"
              value={value.customerGroup?.grades?.join(', ') ?? ''}
              onChange={(e) =>
                update('customerGroup', { grades: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
              }
              placeholder="A, B, C"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.customerGroup?.verifiedOnly ?? false}
              onChange={(e) => update('customerGroup', { verifiedOnly: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Verified customers only</span>
          </label>
        </div>
      </div>

      {/* Order Based */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
          <Icon name="shopping-cart" size={14} color="#f59e0b" />
          <span className="text-sm font-semibold text-gray-700">Order Based</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">First N Orders</label>
            <input
              type="number"
              value={value.orderBased?.firstN ?? ''}
              onChange={(e) => update('orderBased', { firstN: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="100"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">Min Order Qty</label>
            <input
              type="number"
              value={value.orderBased?.minOrderQty ?? ''}
              onChange={(e) =>
                update('orderBased', { minOrderQty: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="5"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
        </div>
      </div>

      {/* Time Based */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
          <Icon name="clock" size={14} color="#ec4899" />
          <span className="text-sm font-semibold text-gray-700">Time Based</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Type</label>
              <select
                value={value.timeBased?.type ?? 'ONE_TIME'}
                onChange={(e) => update('timeBased', { type: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
              >
                <option value="ONE_TIME">One Time</option>
                <option value="RECURRING">Recurring</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Reset Time (IST)</label>
              <input
                type="time"
                value={value.timeBased?.resetTime ?? '00:00'}
                onChange={(e) => update('timeBased', { resetTime: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>
          </div>

          {/* Active Days */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1.5">Active Days</label>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map((day, idx) => {
                const active = value.timeBased?.activeDays?.includes(idx) ?? false;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const current = value.timeBased?.activeDays ?? [];
                      const next = active ? current.filter((d) => d !== idx) : [...current, idx];
                      update('timeBased', { activeDays: next });
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
