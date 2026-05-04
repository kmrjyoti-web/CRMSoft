export const GST_STATE_CODES = [
  { code: '01', name: 'Jammu & Kashmir', isoCode: 'JK' },
  { code: '02', name: 'Himachal Pradesh', isoCode: 'HP' },
  { code: '03', name: 'Punjab', isoCode: 'PB' },
  { code: '04', name: 'Chandigarh', isoCode: 'CH' },
  { code: '05', name: 'Uttarakhand', isoCode: 'UK' },
  { code: '06', name: 'Haryana', isoCode: 'HR' },
  { code: '07', name: 'Delhi', isoCode: 'DL' },
  { code: '08', name: 'Rajasthan', isoCode: 'RJ' },
  { code: '09', name: 'Uttar Pradesh', isoCode: 'UP' },
  { code: '10', name: 'Bihar', isoCode: 'BR' },
  { code: '11', name: 'Sikkim', isoCode: 'SK' },
  { code: '12', name: 'Arunachal Pradesh', isoCode: 'AR' },
  { code: '13', name: 'Nagaland', isoCode: 'NL' },
  { code: '14', name: 'Manipur', isoCode: 'MN' },
  { code: '15', name: 'Mizoram', isoCode: 'MZ' },
  { code: '16', name: 'Tripura', isoCode: 'TR' },
  { code: '17', name: 'Meghalaya', isoCode: 'ML' },
  { code: '18', name: 'Assam', isoCode: 'AS' },
  { code: '19', name: 'West Bengal', isoCode: 'WB' },
  { code: '20', name: 'Jharkhand', isoCode: 'JH' },
  { code: '21', name: 'Odisha', isoCode: 'OR' },
  { code: '22', name: 'Chhattisgarh', isoCode: 'CG' },
  { code: '23', name: 'Madhya Pradesh', isoCode: 'MP' },
  { code: '24', name: 'Gujarat', isoCode: 'GJ' },
  { code: '25', name: 'Daman & Diu', isoCode: 'DD' },
  { code: '26', name: 'Dadra & Nagar Haveli', isoCode: 'DN' },
  { code: '27', name: 'Maharashtra', isoCode: 'MH' },
  { code: '29', name: 'Karnataka', isoCode: 'KA' },
  { code: '30', name: 'Goa', isoCode: 'GA' },
  { code: '31', name: 'Lakshadweep', isoCode: 'LD' },
  { code: '32', name: 'Kerala', isoCode: 'KL' },
  { code: '33', name: 'Tamil Nadu', isoCode: 'TN' },
  { code: '34', name: 'Puducherry', isoCode: 'PY' },
  { code: '35', name: 'Andaman & Nicobar', isoCode: 'AN' },
  { code: '36', name: 'Telangana', isoCode: 'TS' },
  { code: '37', name: 'Andhra Pradesh', isoCode: 'AD' },
  { code: '38', name: 'Ladakh', isoCode: 'LA' },
  { code: '97', name: 'Other Territory', isoCode: 'OT' },
];

export function getGSTCodeByIso(isoCode: string): string | undefined {
  return GST_STATE_CODES.find((g) => g.isoCode === isoCode)?.code;
}

export function getGSTCodeByName(stateName: string): string | undefined {
  return GST_STATE_CODES.find(
    (g) => g.name.toLowerCase() === stateName.toLowerCase(),
  )?.code;
}
