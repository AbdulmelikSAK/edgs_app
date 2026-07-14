export declare class CreateQuoteDto {
    quoteNumber: string;
    clientId: string;
    missionId?: string;
    status?: string;
    date?: string;
    lines: string;
    totalHT: number;
    vatRate?: number;
    notes?: string;
}
