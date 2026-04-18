export declare class AmountInWordsService {
    private readonly ones;
    private readonly tens;
    convert(amount: number, currency?: string): string;
    private convertIndian;
    private convertWestern;
    private convertBelow100;
    private convertBelow1000;
}
