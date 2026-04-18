export declare class DocumentImportService {
    private readonly logger;
    extractFromFile(file: {
        originalname: string;
        mimetype: string;
        buffer: Buffer;
        size: number;
    }): Promise<{
        title: string;
        content: string;
        contentType: string;
    }>;
    private extractFromPdf;
    private extractFromCsv;
    private parseCsvLine;
    private extractFromExcel;
    extractFromUrl(url: string): Promise<{
        title: string;
        content: string;
        contentType: string;
    }>;
    private htmlToText;
}
