import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // --- QUOTES ---
  @Post('quotes')
  @ApiOperation({ summary: 'Créer un devis' })
  createQuote(@Body() dto: CreateQuoteDto) {
    return this.billingService.createQuote(dto);
  }

  @Get('quotes')
  @ApiOperation({ summary: 'Liste de tous les devis' })
  findAllQuotes() {
    return this.billingService.findAllQuotes();
  }

  @Get('quotes/:id')
  @ApiOperation({ summary: 'Détails d’un devis' })
  findOneQuote(@Param('id') id: string) {
    return this.billingService.findOneQuote(id);
  }

  @Put('quotes/:id')
  @ApiOperation({ summary: 'Modifier un devis' })
  updateQuote(@Param('id') id: string, @Body() dto: Partial<CreateQuoteDto>) {
    return this.billingService.updateQuote(id, dto);
  }

  @Delete('quotes/:id')
  @ApiOperation({ summary: 'Supprimer un devis' })
  removeQuote(@Param('id') id: string) {
    return this.billingService.removeQuote(id);
  }

  // --- INVOICES ---
  @Post('invoices')
  @ApiOperation({ summary: 'Créer une facture' })
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.billingService.createInvoice(dto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Liste de toutes les factures' })
  findAllInvoices() {
    return this.billingService.findAllInvoices();
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Détails d’une facture' })
  findOneInvoice(@Param('id') id: string) {
    return this.billingService.findOneInvoice(id);
  }

  @Put('invoices/:id')
  @ApiOperation({ summary: 'Modifier une facture' })
  updateInvoice(@Param('id') id: string, @Body() dto: Partial<CreateInvoiceDto>) {
    return this.billingService.updateInvoice(id, dto);
  }

  @Delete('invoices/:id')
  @ApiOperation({ summary: 'Supprimer une facture' })
  removeInvoice(@Param('id') id: string) {
    return this.billingService.removeInvoice(id);
  }

  // --- CONVERSION ---
  @Post('quotes/:id/convert')
  @ApiOperation({ summary: 'Convertir un devis accepté en facture' })
  convertQuote(
    @Param('id') id: string,
    @Body() body: { invoiceNumber: string }
  ) {
    return this.billingService.convertQuoteToInvoice(id, body.invoiceNumber);
  }
}
