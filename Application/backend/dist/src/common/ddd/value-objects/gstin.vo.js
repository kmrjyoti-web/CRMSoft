"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSTIN = void 0;
const value_object_1 = require("../value-object");
const result_1 = require("../../result/result");
const STATE_CODES = {
    '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
    '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
    '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
    '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
    '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
    '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
    '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
    '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
    '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra', '28': 'Andhra Pradesh',
    '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep',
    '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
    '35': 'Andaman & Nicobar', '36': 'Telangana', '37': 'Andhra Pradesh (New)',
    '97': 'Other Territory', '99': 'Centre Jurisdiction',
};
class GSTIN extends value_object_1.ValueObject {
    constructor(props) {
        super(props);
    }
    static create(value) {
        if (!value) {
            return result_1.Result.fail('GSTIN_001');
        }
        const normalized = value.trim().toUpperCase();
        if (!GSTIN.PATTERN.test(normalized)) {
            return result_1.Result.fail('GSTIN_002', { gstin: value });
        }
        return result_1.Result.ok(new GSTIN({ value: normalized }));
    }
    get value() {
        return this.props.value;
    }
    get stateCode() {
        return this.props.value.substring(0, 2);
    }
    get stateName() {
        return STATE_CODES[this.stateCode] ?? 'Unknown';
    }
    get pan() {
        return this.props.value.substring(2, 12);
    }
    get entityNumber() {
        return this.props.value.substring(12, 13);
    }
}
exports.GSTIN = GSTIN;
GSTIN.PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
//# sourceMappingURL=gstin.vo.js.map