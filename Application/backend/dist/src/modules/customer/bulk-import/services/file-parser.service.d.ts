export interface ParsedFile {
    headers: string[];
    rows: Record<string, string>[];
    totalRows: number;
    sampleData: Record<string, string>[];
}
export declare class FileParserService {
    parse(buffer: Buffer, fileName: string, fileSize: number): Promise<ParsedFile>;
    private parseCsv;
    private parseExcelXlsx;
}
