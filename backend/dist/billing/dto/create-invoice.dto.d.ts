export declare class CreateInvoiceDto {
    invoiceNumber: string;
    quoteId?: string;
    clientId: string;
    status?: string;
    date?: string;
    dueDate?: string;
    lines: string;
    totalHT: number;
    vatRate?: number;
    notes?: string;
}
