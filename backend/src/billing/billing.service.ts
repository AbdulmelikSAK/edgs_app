import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from '../database/entities/quote.entity';
import { Invoice } from '../database/entities/invoice.entity';
import { Client } from '../database/entities/client.entity';
import { Mission } from '../database/entities/mission.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepo: Repository<Quote>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(Mission)
    private readonly missionRepo: Repository<Mission>,
  ) {}

  // --- QUOTES ---
  async createQuote(dto: CreateQuoteDto): Promise<Quote> {
    const client = await this.clientRepo.findOne({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Client non trouvé');

    const mission = dto.missionId
      ? await this.missionRepo.findOne({ where: { id: dto.missionId } })
      : null;

    const quote = this.quoteRepo.create({
      quoteNumber: dto.quoteNumber,
      client,
      mission: mission ?? undefined,
      status: dto.status ?? 'Brouillon',
      date: dto.date ? new Date(dto.date) : new Date(),
      lines: dto.lines,
      totalHT: dto.totalHT,
      vatRate: dto.vatRate ?? 20,
      notes: dto.notes,
    });

    return this.quoteRepo.save(quote);
  }

  async findAllQuotes(): Promise<Quote[]> {
    return this.quoteRepo.find({
      relations: { client: true, mission: true },
      order: { quoteNumber: 'DESC' },
    });
  }

  async findOneQuote(id: string): Promise<Quote> {
    const quote = await this.quoteRepo.findOne({
      where: { id },
      relations: { client: true, mission: true },
    });
    if (!quote) throw new NotFoundException(`Devis ${id} non trouvé`);
    return quote;
  }

  async updateQuote(id: string, dto: Partial<CreateQuoteDto>): Promise<Quote> {
    const quote = await this.findOneQuote(id);

    if (dto.clientId) {
      const client = await this.clientRepo.findOne({ where: { id: dto.clientId } });
      if (!client) throw new NotFoundException('Client non trouvé');
      quote.client = client;
    }

    if (dto.missionId !== undefined) {
      if (dto.missionId === null) {
        quote.mission = null as any;
      } else {
        const mission = await this.missionRepo.findOne({ where: { id: dto.missionId } });
        quote.mission = mission!;
      }
    }

    if (dto.quoteNumber !== undefined) quote.quoteNumber = dto.quoteNumber;
    if (dto.status !== undefined) quote.status = dto.status;
    if (dto.date !== undefined) quote.date = dto.date ? new Date(dto.date) : new Date();
    if (dto.lines !== undefined) quote.lines = dto.lines;
    if (dto.totalHT !== undefined) quote.totalHT = dto.totalHT;
    if (dto.vatRate !== undefined) quote.vatRate = dto.vatRate;
    if (dto.notes !== undefined) quote.notes = dto.notes;

    return this.quoteRepo.save(quote);
  }

  async removeQuote(id: string): Promise<void> {
    const quote = await this.findOneQuote(id);
    await this.quoteRepo.remove(quote);
  }

  // --- INVOICES ---
  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const client = await this.clientRepo.findOne({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Client non trouvé');

    const quote = dto.quoteId
      ? await this.quoteRepo.findOne({ where: { id: dto.quoteId } })
      : null;

    const invoice = this.invoiceRepo.create({
      invoiceNumber: dto.invoiceNumber,
      client,
      quote: quote ?? undefined,
      status: dto.status ?? 'Brouillon',
      date: dto.date ? new Date(dto.date) : new Date(),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      lines: dto.lines,
      totalHT: dto.totalHT,
      vatRate: dto.vatRate ?? 20,
      notes: dto.notes,
    });

    return this.invoiceRepo.save(invoice);
  }

  async findAllInvoices(): Promise<Invoice[]> {
    return this.invoiceRepo.find({
      relations: { client: true, quote: true },
      order: { invoiceNumber: 'DESC' },
    });
  }

  async findOneInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: { client: true, quote: true },
    });
    if (!invoice) throw new NotFoundException(`Facture ${id} non trouvée`);
    return invoice;
  }

  async updateInvoice(id: string, dto: Partial<CreateInvoiceDto>): Promise<Invoice> {
    const invoice = await this.findOneInvoice(id);

    if (dto.clientId) {
      const client = await this.clientRepo.findOne({ where: { id: dto.clientId } });
      if (!client) throw new NotFoundException('Client non trouvé');
      invoice.client = client;
    }

    if (dto.invoiceNumber !== undefined) invoice.invoiceNumber = dto.invoiceNumber;
    if (dto.status !== undefined) invoice.status = dto.status;
    if (dto.date !== undefined) invoice.date = dto.date ? new Date(dto.date) : new Date();
    if (dto.dueDate !== undefined) invoice.dueDate = dto.dueDate ? new Date(dto.dueDate) : (undefined as any);
    if (dto.lines !== undefined) invoice.lines = dto.lines;
    if (dto.totalHT !== undefined) invoice.totalHT = dto.totalHT;
    if (dto.vatRate !== undefined) invoice.vatRate = dto.vatRate;
    if (dto.notes !== undefined) invoice.notes = dto.notes;

    return this.invoiceRepo.save(invoice);
  }

  async removeInvoice(id: string): Promise<void> {
    const invoice = await this.findOneInvoice(id);
    await this.invoiceRepo.remove(invoice);
  }

  // --- CONVERSION ---
  async convertQuoteToInvoice(quoteId: string, invoiceNumber: string): Promise<Invoice> {
    const quote = await this.findOneQuote(quoteId);
    if (quote.status === 'Facturé') {
      throw new Error('Ce devis a déjà été facturé.');
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days due date

    const invoice = this.invoiceRepo.create({
      invoiceNumber,
      client: quote.client,
      quote,
      status: 'Envoyé',
      date: new Date(),
      dueDate,
      lines: quote.lines,
      totalHT: quote.totalHT,
      vatRate: quote.vatRate,
      notes: quote.notes,
    });

    const saved = await this.invoiceRepo.save(invoice);

    quote.status = 'Facturé';
    await this.quoteRepo.save(quote);

    return saved;
  }
}
