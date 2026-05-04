'use client';

import { AddressFields } from '@/components/common/AddressFields';

// ── LocationFields ──────────────────────────────────────────────────────────
interface Props {
  profile: any;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function LocationFields({ profile, onUpdate }: Props) {
  return (
    <AddressFields
      countryCode={profile?.countryCode || 'IN'}
      stateCode={profile?.stateCode || ''}
      city={profile?.city || ''}
      pincode={profile?.pincode || ''}
      columns={2}
      onChange={(patch) => {
        const update: Record<string, unknown> = {};
        if (patch.countryCode !== undefined) update.countryCode = patch.countryCode;
        if (patch.country !== undefined) update.country = patch.country;
        if (patch.stateCode !== undefined) update.stateCode = patch.stateCode;
        if (patch.state !== undefined) update.state = patch.state;
        if (patch.gstStateCode !== undefined) update.gstStateCode = patch.gstStateCode;
        if (patch.city !== undefined) update.city = patch.city;
        if (patch.pincode !== undefined) update.pincode = patch.pincode;
        if (Object.keys(update).length > 0) onUpdate(update);
      }}
    />
  );
}
