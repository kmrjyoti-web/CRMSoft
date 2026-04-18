export interface GstStateCode {
    code: string;
    name: string;
    iso: string;
}
export declare const GST_STATE_CODES: GstStateCode[];
export declare function getGstCodeForState(isoCode: string): string | undefined;
