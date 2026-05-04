"use client";
import { useState } from "react";
import { Button, Switch, Icon } from "@/components/ui";

interface MarketplaceSettingsState {
  autoApproveVerifiedReviews: boolean;
  defaultVisibility: 'PUBLIC' | 'GEO_TARGETED' | 'VERIFIED_ONLY' | 'MY_CONTACTS';
  featuredListingSlots: number;
}

export function MarketplaceSettingsPage() {
  const [settings, setSettings] = useState<MarketplaceSettingsState>({
    autoApproveVerifiedReviews: false,
    defaultVisibility: 'PUBLIC',
    featuredListingSlots: 5,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // POST to /api/v1/marketplace/settings in production
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">Marketplace Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">
        <div className="max-w-2xl space-y-5">
          {/* Auto-moderation */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="shield-check" size={16} color="#6366f1" />
              <h2 className="text-sm font-semibold text-gray-800">Auto-Moderation</h2>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Auto-approve verified purchase reviews
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Reviews from confirmed orders will be approved automatically
                </p>
              </div>
              <Switch
                checked={settings.autoApproveVerifiedReviews}
                onChange={(checked) => setSettings((prev) => ({ ...prev, autoApproveVerifiedReviews: checked }))}
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="eye" size={16} color="#3b82f6" />
              <h2 className="text-sm font-semibold text-gray-800">Default Visibility</h2>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">
                Default visibility for new listings
              </label>
              <select
                value={settings.defaultVisibility}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    defaultVisibility: e.target.value as MarketplaceSettingsState['defaultVisibility'],
                  }))
                }
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="PUBLIC">Public — visible to everyone</option>
                <option value="GEO_TARGETED">Geo-Targeted — by location</option>
                <option value="VERIFIED_ONLY">Verified Only — verified contacts</option>
                <option value="MY_CONTACTS">My Contacts — only my network</option>
              </select>
            </div>
          </div>

          {/* Featured slots */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="star" size={16} color="#f59e0b" />
              <h2 className="text-sm font-semibold text-gray-800">Featured Listing Slots</h2>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">
                Maximum number of featured listings shown at top
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.featuredListingSlots}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, featuredListingSlots: Number(e.target.value) }))
                }
                className="w-32 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={handleSave}>
              Save Settings
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <Icon name="check-circle" size={15} color="#10b981" />
                Settings saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
