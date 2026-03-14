'use client';

import toast from 'react-hot-toast';
import { Icon } from '@/components/ui';
import {
  InlineEditField,
  InlineSelectField,
  InlineToggleField,
  InlineTextareaField,
  DayPicker,
} from '@/components/shared/InlineEdit';
import { ProfileSection } from './ProfileSection';
import { LocationFields } from './LocationFields';
import { useCompanyProfile, useUpdateCompanyProfile } from '../hooks/useCompanyProfile';

// ── Constants ──────────────────────────────────────────────────────────────

const COMPANY_TYPES = [
  { value: 'PROPRIETORSHIP', label: 'Proprietorship' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'LLP', label: 'LLP' },
  { value: 'PRIVATE_LIMITED', label: 'Private Limited' },
  { value: 'PUBLIC_LIMITED', label: 'Public Limited' },
  { value: 'HUF', label: 'HUF' },
  { value: 'TRUST', label: 'Trust / Society' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'OTHER', label: 'Other' },
];

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' },
  { value: '3', label: 'March' }, { value: '4', label: 'April' },
  { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' },
  { value: '9', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

const TAX_TYPES = [
  { value: 'GST', label: 'GST Registered' },
  { value: 'COMPOSITION', label: 'Composition Scheme' },
  { value: 'UNREGISTERED', label: 'Unregistered' },
  { value: 'EXEMPT', label: 'Exempt' },
  { value: 'VAT', label: 'VAT' },
];

const WORKING_PATTERNS = [
  { value: 'STANDARD', label: 'Mon–Sat (Standard)' },
  { value: 'FIVE_DAY', label: 'Mon–Fri (5-day)' },
  { value: 'CUSTOM', label: 'Custom' },
];

const ACCOUNTING_METHODS = [
  { value: 'ACCRUAL', label: 'Accrual (when earned)' },
  { value: 'CASH', label: 'Cash (when received)' },
];

const BALANCING_METHODS = [
  { value: 'BILL_BY_BILL', label: 'Bill By Bill' },
  { value: 'ON_ACCOUNT', label: 'On Account' },
];

const NUMBER_FORMATS = [
  { value: 'INDIAN', label: '₹1,00,000 (Indian)' },
  { value: 'INTERNATIONAL', label: '₹100,000 (International)' },
];

const INVENTORY_METHODS = [
  { value: 'FIFO', label: 'FIFO (First In, First Out)' },
  { value: 'LIFO', label: 'LIFO (Last In, First Out)' },
  { value: 'WEIGHTED_AVERAGE', label: 'Weighted Average Cost' },
  { value: 'SPECIFIC_IDENTIFICATION', label: 'Specific Identification' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (Indian)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
];

const MSME_TYPES = [
  { value: 'MICRO', label: 'Micro' },
  { value: 'SMALL', label: 'Small' },
  { value: 'MEDIUM', label: 'Medium' },
];

// ── Component ──────────────────────────────────────────────────────────────

export function CompanyProfile() {
  const { data: profile, isLoading } = useCompanyProfile();
  const mutation = useUpdateCompanyProfile();

  const save = async (data: Record<string, any>) => {
    try {
      await mutation.mutateAsync(data);
      toast.success('Saved');
    } catch {
      toast.error('Failed to save');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <div style={{ fontSize: 14, color: '#6b7280' }}>Loading company profile…</div>
      </div>
    );
  }

  const p = profile as any ?? {};

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── HEADER: Logo + Company Name ── */}
      <div style={{
        background: 'white', borderRadius: 12, border: '1px solid #e5e7eb',
        padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        {/* Logo */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 12, overflow: 'hidden',
            border: '2px dashed #e5e7eb', background: '#f9fafb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {p.logoUrl ? (
              <img src={p.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <Icon name="building-2" size={32} color="#d1d5db" />
            )}
          </div>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 12,
            background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s', cursor: 'pointer',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
          >
            <span style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>📷 Change</span>
          </div>
        </div>

        {/* Name + trade name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <InlineEditField
            label="Company Name"
            value={p.companyName}
            onSave={(v) => save({ companyName: v })}
            className="text-2xl font-bold"
            placeholder="Enter company name"
          />
          <div style={{ marginTop: 8 }}>
            <InlineEditField
              label="Trade Name"
              value={p.tradeName}
              onSave={(v) => save({ tradeName: v })}
              placeholder="Trading name (if different)"
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <InlineEditField
              label="Tagline"
              value={p.tagline}
              onSave={(v) => save({ tagline: v })}
              placeholder="Company tagline or slogan"
            />
          </div>
        </div>

        {/* Company Type */}
        <div style={{ flexShrink: 0, minWidth: 160 }}>
          <InlineSelectField
            label="Company Type"
            value={p.companyType}
            options={COMPANY_TYPES}
            onSave={(v) => save({ companyType: v })}
            placeholder="Select type"
          />
        </div>
      </div>

      {/* ── General Information ── */}
      <ProfileSection title="General Information" icon="building">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InlineEditField label="Legal Name" value={p.legalName} onSave={(v) => save({ legalName: v })} placeholder="Registered legal name" />
          <InlineEditField label="Industry" value={p.industry} onSave={(v) => save({ industry: v })} placeholder="e.g. Software, Retail, Pharma" />
          <InlineEditField label="Company Size" value={p.companySize} onSave={(v) => save({ companySize: v })} placeholder="e.g. 1-10, 11-50, 51-200" />
          <InlineEditField label="Founded Year" value={p.foundedYear} type="number" onSave={(v) => save({ foundedYear: parseInt(v) })} placeholder="e.g. 2010" />
          <InlineEditField label="Website" value={p.website} type="url" onSave={(v) => save({ website: v })} placeholder="https://yourcompany.com" />
        </div>
      </ProfileSection>

      {/* ── Contact Info ── */}
      <ProfileSection title="Contact Information" icon="phone">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InlineEditField label="Phone" value={p.phone} type="tel" onSave={(v) => save({ phone: v })} placeholder="+91 98765 43210" />
          <InlineEditField label="Alt Phone" value={p.alternatePhone} type="tel" onSave={(v) => save({ alternatePhone: v })} placeholder="Alternate phone" />
          <InlineEditField label="Primary Email" value={p.email} type="email" onSave={(v) => save({ email: v })} placeholder="info@company.com" />
          <InlineEditField label="Support Email" value={p.supportEmail} type="email" onSave={(v) => save({ supportEmail: v })} placeholder="support@company.com" />
          <InlineEditField label="Billing Email" value={p.billingEmail} type="email" onSave={(v) => save({ billingEmail: v })} placeholder="billing@company.com" />
        </div>
      </ProfileSection>

      {/* ── Address ── */}
      <ProfileSection title="Address" icon="map-pin">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <InlineEditField label="Address Line 1" value={p.addressLine1} onSave={(v) => save({ addressLine1: v })} placeholder="Street, area" />
          <InlineEditField label="Address Line 2" value={p.addressLine2} onSave={(v) => save({ addressLine2: v })} placeholder="Suite, floor, building" />
        </div>
        <LocationFields profile={p} onUpdate={(data) => save(data)} />
      </ProfileSection>

      {/* ── Registered Address ── */}
      <ProfileSection title="Registered Address" icon="file-text" defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InlineEditField label="Address Line 1" value={p.regAddressLine1} onSave={(v) => save({ regAddressLine1: v })} />
          <InlineEditField label="Address Line 2" value={p.regAddressLine2} onSave={(v) => save({ regAddressLine2: v })} />
          <InlineEditField label="City" value={p.regCity} onSave={(v) => save({ regCity: v })} />
          <InlineEditField label="State" value={p.regState} onSave={(v) => save({ regState: v })} />
          <InlineEditField label="Country" value={p.regCountry} onSave={(v) => save({ regCountry: v })} />
          <InlineEditField label="Pincode" value={p.regPincode} onSave={(v) => save({ regPincode: v })} />
        </div>
      </ProfileSection>

      {/* ── Tax & GST ── */}
      <ProfileSection title="Tax & GST" icon="receipt">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InlineEditField label="GSTIN" value={p.gstNumber} onSave={(v) => save({ gstNumber: v })} placeholder="27AAACR1234A1ZM" />
          <InlineEditField label="PAN Number" value={p.panNumber} onSave={(v) => save({ panNumber: v })} placeholder="AAACR1234A" />
          <InlineEditField label="TAN Number" value={p.tanNumber} onSave={(v) => save({ tanNumber: v })} placeholder="MUMB12345A" />
          <InlineEditField label="CIN Number" value={p.cinNumber} onSave={(v) => save({ cinNumber: v })} placeholder="U12345MH2010PTC123456" />
          <InlineEditField label="MSME Number" value={p.msmeNumber} onSave={(v) => save({ msmeNumber: v })} />
          <InlineSelectField label="MSME Type" value={p.msmeType} options={MSME_TYPES} onSave={(v) => save({ msmeType: v })} />
          <InlineEditField label="IEC (Import/Export Code)" value={p.importExportCode} onSave={(v) => save({ importExportCode: v })} />
          <InlineSelectField label="Tax Type" value={p.taxType} options={TAX_TYPES} onSave={(v) => save({ taxType: v })} />
          <InlineToggleField label="Composition Scheme" value={p.compositionScheme} onSave={(v) => save({ compositionScheme: v })} description="GST Composition Scheme applicable" />
          <InlineToggleField label="Reverse Charge Mechanism" value={p.reverseChargeMechanism} onSave={(v) => save({ reverseChargeMechanism: v })} description="RCM applicable" />
        </div>
      </ProfileSection>

      {/* ── Financial Year ── */}
      <ProfileSection title="Financial Year" icon="calendar">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <InlineSelectField
            label="FY Starts (Month)"
            value={String(p.financialYearStart ?? '4')}
            options={MONTHS}
            onSave={(v) => save({ financialYearStart: parseInt(v) })}
          />
          <InlineSelectField
            label="FY Ends (Month)"
            value={String(p.financialYearEnd ?? '3')}
            options={MONTHS}
            onSave={(v) => save({ financialYearEnd: parseInt(v) })}
          />
          <InlineEditField
            label="Current FY"
            value={p.currentFinancialYear}
            onSave={(v) => save({ currentFinancialYear: v })}
            placeholder="e.g. 2025-26"
          />
        </div>
      </ProfileSection>

      {/* ── Working Pattern ── */}
      <ProfileSection title="Working Pattern" icon="clock">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InlineSelectField label="Pattern" value={p.workingPattern} options={WORKING_PATTERNS} onSave={(v) => save({ workingPattern: v })} />
          <div />
          <div style={{ gridColumn: '1 / -1' }}>
            <DayPicker label="Working Days" value={p.workingDays ?? ['MON','TUE','WED','THU','FRI','SAT']} onSave={(v) => save({ workingDays: v })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <DayPicker label="Week Off" value={p.weekOff ?? ['SUN']} onSave={(v) => save({ weekOff: v })} />
          </div>
          <InlineEditField label="Start Time" value={p.workingHoursStart} type="time" onSave={(v) => save({ workingHoursStart: v })} placeholder="09:00" />
          <InlineEditField label="End Time" value={p.workingHoursEnd} type="time" onSave={(v) => save({ workingHoursEnd: v })} placeholder="18:00" />
        </div>
      </ProfileSection>

      {/* ── Accounting Pattern ── */}
      <ProfileSection title="Accounting Pattern" icon="calculator">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InlineSelectField label="Accounting Method" value={p.accountingMethod} options={ACCOUNTING_METHODS} onSave={(v) => save({ accountingMethod: v })} />
          <InlineSelectField label="Balancing Method" value={p.balancingMethod} options={BALANCING_METHODS} onSave={(v) => save({ balancingMethod: v })} />
          <InlineSelectField label="Number Format" value={p.numberFormat} options={NUMBER_FORMATS} onSave={(v) => save({ numberFormat: v })} />
          <InlineEditField label="Decimal Places (0–4)" value={p.decimalPlaces ?? 2} type="number" onSave={(v) => save({ decimalPlaces: parseInt(v) })} />
          <InlineEditField label="Currency Code" value={p.currencyCode} onSave={(v) => save({ currencyCode: v })} placeholder="INR" />
          <InlineEditField label="Currency Symbol" value={p.currencySymbol} onSave={(v) => save({ currencySymbol: v })} placeholder="₹" />
        </div>
      </ProfileSection>

      {/* ── Inventory Pattern ── */}
      <ProfileSection title="Inventory Pattern" icon="package">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InlineSelectField label="Valuation Method" value={p.inventoryMethod} options={INVENTORY_METHODS} onSave={(v) => save({ inventoryMethod: v })} />
          <div />
          <InlineToggleField label="Negative Stock Allowed" value={p.negativeStockAllowed} onSave={(v) => save({ negativeStockAllowed: v })} description="Allow stock to go below zero" />
          <InlineToggleField label="Auto Stock Deduction" value={p.autoStockDeduction ?? true} onSave={(v) => save({ autoStockDeduction: v })} description="Deduct stock on invoice" />
          <InlineToggleField label="Batch Tracking" value={p.batchTracking} onSave={(v) => save({ batchTracking: v })} description="Track items by batch number" />
          <InlineToggleField label="Serial Tracking" value={p.serialTracking ?? true} onSave={(v) => save({ serialTracking: v })} description="Track items by serial number" />
          <InlineToggleField label="Expiry Tracking" value={p.expiryTracking} onSave={(v) => save({ expiryTracking: v })} description="Track product expiry dates" />
        </div>
      </ProfileSection>

      {/* ── Document Numbering ── */}
      <ProfileSection title="Document Numbering" icon="hash">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <InlineEditField label="Invoice Prefix" value={p.invoicePrefix} onSave={(v) => save({ invoicePrefix: v })} placeholder="INV-" />
          <InlineEditField label="Invoice Start No" value={p.invoiceStartNumber ?? 1} type="number" onSave={(v) => save({ invoiceStartNumber: parseInt(v) })} />
          <div />
          <InlineEditField label="Purchase Prefix" value={p.purchasePrefix} onSave={(v) => save({ purchasePrefix: v })} placeholder="PI-" />
          <InlineEditField label="Purchase Start No" value={p.purchaseStartNumber ?? 1} type="number" onSave={(v) => save({ purchaseStartNumber: parseInt(v) })} />
          <div />
          <InlineEditField label="Quotation Prefix" value={p.quotationPrefix} onSave={(v) => save({ quotationPrefix: v })} placeholder="QT-" />
          <InlineEditField label="Quotation Start No" value={p.quotationStartNumber ?? 1} type="number" onSave={(v) => save({ quotationStartNumber: parseInt(v) })} />
          <div />
        </div>
      </ProfileSection>

      {/* ── Bank Details ── */}
      <ProfileSection title="Bank Details" icon="landmark">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InlineEditField label="Bank Name" value={p.bankName} onSave={(v) => save({ bankName: v })} placeholder="HDFC Bank" />
          <InlineEditField label="Account Number" value={p.accountNumber} onSave={(v) => save({ accountNumber: v })} />
          <InlineEditField label="IFSC Code" value={p.ifscCode} onSave={(v) => save({ ifscCode: v })} placeholder="HDFC0001234" />
          <InlineEditField label="Branch" value={p.bankBranch} onSave={(v) => save({ bankBranch: v })} placeholder="Main Branch" />
          <InlineSelectField
            label="Account Type"
            value={p.accountType}
            options={[{ value: 'CURRENT', label: 'Current Account' }, { value: 'SAVINGS', label: 'Savings Account' }]}
            onSave={(v) => save({ accountType: v })}
          />
          <InlineEditField label="UPI ID" value={p.upiId} onSave={(v) => save({ upiId: v })} placeholder="yourcompany@upi" />
        </div>
      </ProfileSection>

      {/* ── Social Links ── */}
      <ProfileSection title="Social Links" icon="share-2" defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InlineEditField label="LinkedIn" value={p.linkedinUrl} type="url" onSave={(v) => save({ linkedinUrl: v })} placeholder="https://linkedin.com/company/…" />
          <InlineEditField label="Facebook" value={p.facebookUrl} type="url" onSave={(v) => save({ facebookUrl: v })} placeholder="https://facebook.com/…" />
          <InlineEditField label="Twitter / X" value={p.twitterUrl} type="url" onSave={(v) => save({ twitterUrl: v })} placeholder="https://twitter.com/…" />
          <InlineEditField label="Instagram" value={p.instagramUrl} type="url" onSave={(v) => save({ instagramUrl: v })} placeholder="https://instagram.com/…" />
          <InlineEditField label="YouTube" value={p.youtubeUrl} type="url" onSave={(v) => save({ youtubeUrl: v })} placeholder="https://youtube.com/@…" />
        </div>
      </ProfileSection>

      {/* ── Default Terms ── */}
      <ProfileSection title="Default Terms & Notes" icon="file-text" defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <InlineTextareaField
            label="Default Invoice Terms"
            value={p.defaultTerms}
            onSave={(v) => save({ defaultTerms: v })}
            rows={4}
            placeholder="Enter default terms and conditions for invoices…"
          />
          <InlineTextareaField
            label="Default Notes"
            value={p.defaultNotes}
            onSave={(v) => save({ defaultNotes: v })}
            rows={3}
            placeholder="Default notes shown on documents…"
          />
        </div>
      </ProfileSection>

      {/* ── Locale ── */}
      <ProfileSection title="Locale & Format" icon="globe" defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InlineEditField label="Timezone" value={p.timezone} onSave={(v) => save({ timezone: v })} placeholder="Asia/Kolkata" />
          <InlineEditField label="Locale" value={p.locale} onSave={(v) => save({ locale: v })} placeholder="en-IN" />
          <InlineSelectField label="Date Format" value={p.dateFormat} options={DATE_FORMATS} onSave={(v) => save({ dateFormat: v })} />
          <InlineSelectField
            label="Time Format"
            value={p.timeFormat}
            options={[{ value: '12h', label: '12 Hour (AM/PM)' }, { value: '24h', label: '24 Hour' }]}
            onSave={(v) => save({ timeFormat: v })}
          />
        </div>
      </ProfileSection>

    </div>
  );
}
