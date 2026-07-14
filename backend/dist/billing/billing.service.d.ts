import { Repository } from 'typeorm';
import { Quote } from '../database/entities/quote.entity';
import { Invoice } from '../database/entities/invoice.entity';
import { Client } from '../database/entities/client.entity';
import { Mission } from '../database/entities/mission.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
export declare class BillingService {
    private readonly quoteRepo;
    private readonly invoiceRepo;
    private readonly clientRepo;
    private readonly missionRepo;
    constructor(quoteRepo: Repository<Quote>, invoiceRepo: Repository<Invoice>, clientRepo: Repository<Client>, missionRepo: Repository<Mission>);
    createQuote(dto: CreateQuoteDto): Promise<Quote>;
    findAllQuotes(): Promise<Quote[]>;
    findOneQuote(id: string): Promise<Quote>;
    updateQuote(id: string, dto: Partial<CreateQuoteDto>): Promise<Quote>;
    removeQuote(id: string): Promise<void>;
    createInvoice(dto: CreateInvoiceDto): Promise<Invoice>;
    findAllInvoices(): Promise<Invoice[]>;
    findOneInvoice(id: string): Promise<Invoice>;
    updateInvoice(id: string, dto: Partial<CreateInvoiceDto>): Promise<Invoice>;
    removeInvoice(id: string): Promise<void>;
    convertQuoteToInvoice(quoteId: string, invoiceNumber: string): Promise<Invoice>;
}
