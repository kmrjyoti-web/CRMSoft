import * as react from 'react';

declare function validateGST(value: string): boolean;
interface GSTInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    showValidation?: boolean;
}
declare const GSTInput: react.ForwardRefExoticComponent<GSTInputProps & react.RefAttributes<HTMLInputElement>>;

declare function validatePAN(value: string): boolean;
interface PANInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    showValidation?: boolean;
}
declare const PANInput: react.ForwardRefExoticComponent<PANInputProps & react.RefAttributes<HTMLInputElement>>;

declare const INDIAN_STATES: readonly [{
    readonly code: "AP";
    readonly name: "Andhra Pradesh";
    readonly gstCode: "37";
}, {
    readonly code: "AR";
    readonly name: "Arunachal Pradesh";
    readonly gstCode: "12";
}, {
    readonly code: "AS";
    readonly name: "Assam";
    readonly gstCode: "18";
}, {
    readonly code: "BR";
    readonly name: "Bihar";
    readonly gstCode: "10";
}, {
    readonly code: "CG";
    readonly name: "Chhattisgarh";
    readonly gstCode: "22";
}, {
    readonly code: "GA";
    readonly name: "Goa";
    readonly gstCode: "30";
}, {
    readonly code: "GJ";
    readonly name: "Gujarat";
    readonly gstCode: "24";
}, {
    readonly code: "HR";
    readonly name: "Haryana";
    readonly gstCode: "06";
}, {
    readonly code: "HP";
    readonly name: "Himachal Pradesh";
    readonly gstCode: "02";
}, {
    readonly code: "JH";
    readonly name: "Jharkhand";
    readonly gstCode: "20";
}, {
    readonly code: "KA";
    readonly name: "Karnataka";
    readonly gstCode: "29";
}, {
    readonly code: "KL";
    readonly name: "Kerala";
    readonly gstCode: "32";
}, {
    readonly code: "MP";
    readonly name: "Madhya Pradesh";
    readonly gstCode: "23";
}, {
    readonly code: "MH";
    readonly name: "Maharashtra";
    readonly gstCode: "27";
}, {
    readonly code: "MN";
    readonly name: "Manipur";
    readonly gstCode: "14";
}, {
    readonly code: "ML";
    readonly name: "Meghalaya";
    readonly gstCode: "17";
}, {
    readonly code: "MZ";
    readonly name: "Mizoram";
    readonly gstCode: "15";
}, {
    readonly code: "NL";
    readonly name: "Nagaland";
    readonly gstCode: "13";
}, {
    readonly code: "OR";
    readonly name: "Odisha";
    readonly gstCode: "21";
}, {
    readonly code: "PB";
    readonly name: "Punjab";
    readonly gstCode: "03";
}, {
    readonly code: "RJ";
    readonly name: "Rajasthan";
    readonly gstCode: "08";
}, {
    readonly code: "SK";
    readonly name: "Sikkim";
    readonly gstCode: "11";
}, {
    readonly code: "TN";
    readonly name: "Tamil Nadu";
    readonly gstCode: "33";
}, {
    readonly code: "TG";
    readonly name: "Telangana";
    readonly gstCode: "36";
}, {
    readonly code: "TR";
    readonly name: "Tripura";
    readonly gstCode: "16";
}, {
    readonly code: "UP";
    readonly name: "Uttar Pradesh";
    readonly gstCode: "09";
}, {
    readonly code: "UK";
    readonly name: "Uttarakhand";
    readonly gstCode: "05";
}, {
    readonly code: "WB";
    readonly name: "West Bengal";
    readonly gstCode: "19";
}, {
    readonly code: "AN";
    readonly name: "Andaman & Nicobar Islands";
    readonly gstCode: "35";
}, {
    readonly code: "CH";
    readonly name: "Chandigarh";
    readonly gstCode: "04";
}, {
    readonly code: "DN";
    readonly name: "Dadra & Nagar Haveli and Daman & Diu";
    readonly gstCode: "26";
}, {
    readonly code: "DL";
    readonly name: "Delhi";
    readonly gstCode: "07";
}, {
    readonly code: "JK";
    readonly name: "Jammu & Kashmir";
    readonly gstCode: "01";
}, {
    readonly code: "LA";
    readonly name: "Ladakh";
    readonly gstCode: "38";
}, {
    readonly code: "LD";
    readonly name: "Lakshadweep";
    readonly gstCode: "31";
}, {
    readonly code: "PY";
    readonly name: "Puducherry";
    readonly gstCode: "34";
}];
type IndianStateCode = typeof INDIAN_STATES[number]['code'];

interface StateSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
    label?: string;
    value?: string;
    onChange?: (value: IndianStateCode | '') => void;
    error?: string;
    placeholder?: string;
    /** Show GST state code alongside state name */
    showGstCode?: boolean;
}
declare const StateSelect: react.ForwardRefExoticComponent<StateSelectProps & react.RefAttributes<HTMLSelectElement>>;

export { GSTInput, PANInput, StateSelect, validateGST, validatePAN };
