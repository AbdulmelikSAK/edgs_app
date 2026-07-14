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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const billing_service_1 = require("./billing.service");
const create_quote_dto_1 = require("./dto/create-quote.dto");
const create_invoice_dto_1 = require("./dto/create-invoice.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let BillingController = class BillingController {
    billingService;
    constructor(billingService) {
        this.billingService = billingService;
    }
    createQuote(dto) {
        return this.billingService.createQuote(dto);
    }
    findAllQuotes() {
        return this.billingService.findAllQuotes();
    }
    findOneQuote(id) {
        return this.billingService.findOneQuote(id);
    }
    updateQuote(id, dto) {
        return this.billingService.updateQuote(id, dto);
    }
    removeQuote(id) {
        return this.billingService.removeQuote(id);
    }
    createInvoice(dto) {
        return this.billingService.createInvoice(dto);
    }
    findAllInvoices() {
        return this.billingService.findAllInvoices();
    }
    findOneInvoice(id) {
        return this.billingService.findOneInvoice(id);
    }
    updateInvoice(id, dto) {
        return this.billingService.updateInvoice(id, dto);
    }
    removeInvoice(id) {
        return this.billingService.removeInvoice(id);
    }
    convertQuote(id, body) {
        return this.billingService.convertQuoteToInvoice(id, body.invoiceNumber);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Post)('quotes'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un devis' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_quote_dto_1.CreateQuoteDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "createQuote", null);
__decorate([
    (0, common_1.Get)('quotes'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste de tous les devis' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "findAllQuotes", null);
__decorate([
    (0, common_1.Get)('quotes/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détails d’un devis' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "findOneQuote", null);
__decorate([
    (0, common_1.Put)('quotes/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un devis' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "updateQuote", null);
__decorate([
    (0, common_1.Delete)('quotes/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un devis' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "removeQuote", null);
__decorate([
    (0, common_1.Post)('invoices'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une facture' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invoice_dto_1.CreateInvoiceDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Get)('invoices'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste de toutes les factures' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "findAllInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détails d’une facture' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "findOneInvoice", null);
__decorate([
    (0, common_1.Put)('invoices/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une facture' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "updateInvoice", null);
__decorate([
    (0, common_1.Delete)('invoices/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une facture' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "removeInvoice", null);
__decorate([
    (0, common_1.Post)('quotes/:id/convert'),
    (0, swagger_1.ApiOperation)({ summary: 'Convertir un devis accepté en facture' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "convertQuote", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)('billing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map