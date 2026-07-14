import { BillingService } from './billing.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    createQuote(dto: CreateQuoteDto): Promise<import("../database/entities/quote.entity").Quote>;
    findAllQuotes(): Promise<import("../database/entities/quote.entity").Quote[]>;
    findOneQuote(id: string): Promise<import("../database/entities/quote.entity").Quote>;
    updateQuote(id: string, dto: Partial<CreateQuoteDto>): Promise<import("../database/entities/quote.entity").Quote>;
    removeQuote(id: string): Promise<void>;
    createInvoice(dto: CreateInvoiceDto): Promise<import("../database/entities/invoice.entity").Invoice>;
    findAllInvoices(): Promise<import("../database/entities/invoice.entity").Invoice[]>;
    findOneInvoice(id: string): Promise<import("../database/entities/invoice.entity").Invoice>;
    updateInvoice(id: string, dto: Partial<CreateInvoiceDto>): Promise<import("../database/entities/invoice.entity").Invoice>;
    removeInvoice(id: string): Promise<void>;
    convertQuote(id: string, body: {
        invoiceNumber: string;
    }): Promise<import("../database/entities/invoice.entity").Invoice>;
}
