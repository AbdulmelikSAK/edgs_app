"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const quote_entity_1 = require("../database/entities/quote.entity");
const invoice_entity_1 = require("../database/entities/invoice.entity");
const client_entity_1 = require("../database/entities/client.entity");
const mission_entity_1 = require("../database/entities/mission.entity");
let BillingService = class BillingService {
    quoteRepo;
    invoiceRepo;
    clientRepo;
    missionRepo;
    constructor(quoteRepo, invoiceRepo, clientRepo, missionRepo) {
        this.quoteRepo = quoteRepo;
        this.invoiceRepo = invoiceRepo;
        this.clientRepo = clientRepo;
        this.missionRepo = missionRepo;
    }
    async createQuote(dto) {
        const client = await this.clientRepo.findOne({ where: { id: dto.clientId } });
        if (!client)
            throw new common_1.NotFoundException('Client non trouvé');
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
    async findAllQuotes() {
        return this.quoteRepo.find({
            relations: { client: true, mission: true },
            order: { quoteNumber: 'DESC' },
        });
    }
    async findOneQuote(id) {
        const quote = await this.quoteRepo.findOne({
            where: { id },
            relations: { client: true, mission: true },
        });
        if (!quote)
            throw new common_1.NotFoundException(`Devis ${id} non trouvé`);
        return quote;
    }
    async updateQuote(id, dto) {
        const quote = await this.findOneQuote(id);
        if (dto.clientId) {
            const client = await this.clientRepo.findOne({ where: { id: dto.clientId } });
            if (!client)
                throw new common_1.NotFoundException('Client non trouvé');
            quote.client = client;
        }
        if (dto.missionId !== undefined) {
            if (dto.missionId === null) {
                quote.mission = null;
            }
            else {
                const mission = await this.missionRepo.findOne({ where: { id: dto.missionId } });
                quote.mission = mission;
            }
        }
        if (dto.quoteNumber !== undefined)
            quote.quoteNumber = dto.quoteNumber;
        if (dto.status !== undefined)
            quote.status = dto.status;
        if (dto.date !== undefined)
            quote.date = dto.date ? new Date(dto.date) : new Date();
        if (dto.lines !== undefined)
            quote.lines = dto.lines;
        if (dto.totalHT !== undefined)
            quote.totalHT = dto.totalHT;
        if (dto.vatRate !== undefined)
            quote.vatRate = dto.vatRate;
        if (dto.notes !== undefined)
            quote.notes = dto.notes;
        return this.quoteRepo.save(quote);
    }
    async removeQuote(id) {
        const quote = await this.findOneQuote(id);
        await this.quoteRepo.remove(quote);
    }
    async createInvoice(dto) {
        const client = await this.clientRepo.findOne({ where: { id: dto.clientId } });
        if (!client)
            throw new common_1.NotFoundException('Client non trouvé');
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
    async findAllInvoices() {
        return this.invoiceRepo.find({
            relations: { client: true, quote: true },
            order: { invoiceNumber: 'DESC' },
        });
    }
    async findOneInvoice(id) {
        const invoice = await this.invoiceRepo.findOne({
            where: { id },
            relations: { client: true, quote: true },
        });
        if (!invoice)
            throw new common_1.NotFoundException(`Facture ${id} non trouvée`);
        return invoice;
    }
    async updateInvoice(id, dto) {
        const invoice = await this.findOneInvoice(id);
        if (dto.clientId) {
            const client = await this.clientRepo.findOne({ where: { id: dto.clientId } });
            if (!client)
                throw new common_1.NotFoundException('Client non trouvé');
            invoice.client = client;
        }
        if (dto.invoiceNumber !== undefined)
            invoice.invoiceNumber = dto.invoiceNumber;
        if (dto.status !== undefined)
            invoice.status = dto.status;
        if (dto.date !== undefined)
            invoice.date = dto.date ? new Date(dto.date) : new Date();
        if (dto.dueDate !== undefined)
            invoice.dueDate = dto.dueDate ? new Date(dto.dueDate) : undefined;
        if (dto.lines !== undefined)
            invoice.lines = dto.lines;
        if (dto.totalHT !== undefined)
            invoice.totalHT = dto.totalHT;
        if (dto.vatRate !== undefined)
            invoice.vatRate = dto.vatRate;
        if (dto.notes !== undefined)
            invoice.notes = dto.notes;
        return this.invoiceRepo.save(invoice);
    }
    async removeInvoice(id) {
        const invoice = await this.findOneInvoice(id);
        await this.invoiceRepo.remove(invoice);
    }
    async convertQuoteToInvoice(quoteId, invoiceNumber) {
        const quote = await this.findOneQuote(quoteId);
        if (quote.status === 'Facturé') {
            throw new Error('Ce devis a déjà été facturé.');
        }
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
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
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quote_entity_1.Quote)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(2, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __param(3, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BillingService);
//# sourceMappingURL=billing.service.js.map