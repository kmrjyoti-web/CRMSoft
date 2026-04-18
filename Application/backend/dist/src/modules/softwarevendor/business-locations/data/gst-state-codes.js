"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GST_STATE_CODES = void 0;
exports.getGstCodeForState = getGstCodeForState;
exports.GST_STATE_CODES = [
    { code: '01', name: 'Jammu & Kashmir', iso: 'JK' },
    { code: '02', name: 'Himachal Pradesh', iso: 'HP' },
    { code: '03', name: 'Punjab', iso: 'PB' },
    { code: '04', name: 'Chandigarh', iso: 'CH' },
    { code: '05', name: 'Uttarakhand', iso: 'UK' },
    { code: '06', name: 'Haryana', iso: 'HR' },
    { code: '07', name: 'Delhi', iso: 'DL' },
    { code: '08', name: 'Rajasthan', iso: 'RJ' },
    { code: '09', name: 'Uttar Pradesh', iso: 'UP' },
    { code: '10', name: 'Bihar', iso: 'BR' },
    { code: '11', name: 'Sikkim', iso: 'SK' },
    { code: '12', name: 'Arunachal Pradesh', iso: 'AR' },
    { code: '13', name: 'Nagaland', iso: 'NL' },
    { code: '14', name: 'Manipur', iso: 'MN' },
    { code: '15', name: 'Mizoram', iso: 'MZ' },
    { code: '16', name: 'Tripura', iso: 'TR' },
    { code: '17', name: 'Meghalaya', iso: 'ML' },
    { code: '18', name: 'Assam', iso: 'AS' },
    { code: '19', name: 'West Bengal', iso: 'WB' },
    { code: '20', name: 'Jharkhand', iso: 'JH' },
    { code: '21', name: 'Odisha', iso: 'OR' },
    { code: '22', name: 'Chhattisgarh', iso: 'CG' },
    { code: '23', name: 'Madhya Pradesh', iso: 'MP' },
    { code: '24', name: 'Gujarat', iso: 'GJ' },
    { code: '25', name: 'Daman & Diu', iso: 'DD' },
    { code: '26', name: 'Dadra & Nagar Haveli', iso: 'DN' },
    { code: '27', name: 'Maharashtra', iso: 'MH' },
    { code: '29', name: 'Karnataka', iso: 'KA' },
    { code: '30', name: 'Goa', iso: 'GA' },
    { code: '32', name: 'Kerala', iso: 'KL' },
    { code: '33', name: 'Tamil Nadu', iso: 'TN' },
    { code: '34', name: 'Puducherry', iso: 'PY' },
    { code: '36', name: 'Telangana', iso: 'TS' },
    { code: '37', name: 'Andhra Pradesh', iso: 'AD' },
    { code: '38', name: 'Ladakh', iso: 'LA' },
];
function getGstCodeForState(isoCode) {
    return exports.GST_STATE_CODES.find(g => g.iso === isoCode)?.code;
}
//# sourceMappingURL=gst-state-codes.js.map