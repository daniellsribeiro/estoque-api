import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { PurchasePayment } from '../compras/entities/purchase-payment.entity';
import { CreateCardAccountDto } from './dto/create-card-account.dto';
import { CreateCardInvoicePaymentDto } from './dto/create-card-invoice-payment.dto';
import { CreateCardPaymentRuleDto } from './dto/create-card-payment-rule.dto';
import { CreatePaymentTypeDto } from './dto/create-payment-type.dto';
import { CardAccount } from './entities/card-account.entity';
import { CardInvoicePayment } from './entities/card-invoice-payment.entity';
import { CardPaymentRule } from './entities/card-payment-rule.entity';
import { Expense } from './entities/expense.entity';
import { ExpenseItem } from './entities/expense-item.entity';
import { ExpensePayment } from './entities/expense-payment.entity';
import { PaymentType } from './entities/payment-type.entity';
import { Recebimento } from './entities/recebimento.entity';
import { Sale } from '../vendas/entities/sale.entity';
import { CreateRecebimentoDto } from './dto/create-recebimento.dto';
import { UpdateRecebimentoDto } from './dto/update-recebimento.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Supplier } from '../produtos/entities/supplier.entity';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(PaymentType)
    private readonly paymentTypeRepo: EntityRepository<PaymentType>,
    @InjectRepository(CardAccount)
    private readonly cardAccountRepo: EntityRepository<CardAccount>,
    @InjectRepository(CardPaymentRule)
    private readonly cardRuleRepo: EntityRepository<CardPaymentRule>,
    @InjectRepository(CardInvoicePayment)
    private readonly cardInvoicePaymentRepo: EntityRepository<CardInvoicePayment>,
    @InjectRepository(PurchasePayment)
    private readonly purchasePaymentRepo: EntityRepository<PurchasePayment>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: EntityRepository<Supplier>,
    @InjectRepository(Expense)
    private readonly expenseRepo: EntityRepository<Expense>,
    @InjectRepository(ExpenseItem)
    private readonly expenseItemRepo: EntityRepository<ExpenseItem>,
    @InjectRepository(ExpensePayment)
  private readonly expensePaymentRepo: EntityRepository<ExpensePayment>,
    @InjectRepository(Recebimento)
    private readonly recebimentoRepo: EntityRepository<Recebimento>,
    @InjectRepository(Sale)
    private readonly saleRepo: EntityRepository<Sale>,
  ) {}

  async createPaymentType(dto: CreatePaymentTypeDto, userId?: string) {
    const paymentType = this.paymentTypeRepo.create({
      descricao: dto.descricao,
      ativo: dto.ativo ?? true,
      createdById: userId,
      updatedById: userId,
    });
    await this.paymentTypeRepo.getEntityManager().persistAndFlush(paymentType);
    return paymentType;
  }

  async listPaymentTypes() {
    return this.paymentTypeRepo.findAll();
  }

  async createCardAccount(dto: CreateCardAccountDto, userId?: string) {
    const cardAccount = this.cardAccountRepo.create({
      ...dto,
      createdById: userId,
      updatedById: userId,
      ativo: dto.ativo ?? true,
    });
    await this.cardAccountRepo.getEntityManager().persistAndFlush(cardAccount);
    return cardAccount;
  }

  async updateCardAccount(id: string, dto: CreateCardAccountDto, userId?: string) {
    const card = await this.cardAccountRepo.findOne({ id });
    if (!card) {
      throw new NotFoundException('Cartão/conta não encontrado');
    }
    card.nome = dto.nome ?? card.nome;
    card.banco = dto.banco ?? card.banco;
    card.bandeira = dto.bandeira ?? card.bandeira;
    card.diaFechamento = dto.diaFechamento ?? card.diaFechamento;
    card.diaVencimento = dto.diaVencimento ?? card.diaVencimento;
    card.pixChave = dto.pixChave ?? card.pixChave;
    card.ativo = dto.ativo ?? card.ativo;
    card.updatedById = userId;
    await this.cardAccountRepo.getEntityManager().persistAndFlush(card);
    return card;
  }

  async listCardAccounts() {
    return this.cardAccountRepo.findAll();
  }

  async saveCardRule(dto: CreateCardPaymentRuleDto, userId?: string) {
    const card = await this.cardAccountRepo.findOne({ id: dto.cartaoId });
    if (!card) {
      throw new NotFoundException('Cartão/conta não encontrado');
    }
    let rule = await this.cardRuleRepo.findOne({ cartao: card, tipo: dto.tipo });
    if (!rule) {
      rule = this.cardRuleRepo.create({
        cartao: card,
        tipo: dto.tipo,
        taxaPercentual: dto.taxaPercentual ?? 0,
        taxaFixa: dto.taxaFixa ?? 0,
        adicionalParcela: dto.adicionalParcela ?? 0,
        prazoRecebimentoDias: dto.prazoRecebimentoDias ?? 0,
        prazoEscalonadoPadrao: dto.prazoEscalonadoPadrao ?? false,
        createdById: userId,
        updatedById: userId,
      });
    }
    rule.taxaPercentual = dto.taxaPercentual ?? 0;
    rule.taxaFixa = dto.taxaFixa ?? 0;
    rule.adicionalParcela = dto.adicionalParcela ?? 0;
    rule.prazoRecebimentoDias = dto.prazoRecebimentoDias ?? 0;
    rule.prazoEscalonadoPadrao = dto.prazoEscalonadoPadrao ?? false;
    rule.updatedById = userId;
    await this.cardRuleRepo.getEntityManager().persistAndFlush(rule);
    return rule;
  }

  async listCardRules(cardId: string) {
    const card = await this.cardAccountRepo.findOne({ id: cardId });
    if (!card) {
      throw new NotFoundException('Cartão/conta não encontrado');
    }
    return this.cardRuleRepo.find({ cartao: card });
  }

  private buildOffsets(parcelas: number, rule?: CardPaymentRule, overrideEscalonado?: boolean, overridePrazo?: number) {
    const useEscalonado = overrideEscalonado ?? rule?.prazoEscalonadoPadrao ?? false;
    const prazoFixo = overridePrazo ?? rule?.prazoRecebimentoDias ?? 0;

    if (!useEscalonado) {
      // Quando não for escalonado, todas as parcelas recebem o mesmo prazo.
      return Array(parcelas).fill(prazoFixo);
    }

    // Escalonado: 1ª em 31 dias, demais a cada 30 dias.
    const offsets: number[] = [];
    for (let i = 0; i < parcelas; i++) {
      offsets.push(i === 0 ? 31 : 31 + i * 30);
    }
    return offsets;
  }

  async createRecebimentos(dto: CreateRecebimentoDto, userId?: string) {
    const em = this.recebimentoRepo.getEntityManager();
    const parcelas = dto.parcelas ?? 1;
    const sale = dto.vendaId ? await this.saleRepo.findOne({ id: dto.vendaId }) : undefined;
    const card = dto.cartaoContaId ? await this.cardAccountRepo.findOne({ id: dto.cartaoContaId }) : undefined;
    const tipoPag = dto.tipoPagamentoId ? await this.paymentTypeRepo.findOne({ id: dto.tipoPagamentoId }) : undefined;
    const dataVenda = this.parseDateOnly(dto.dataVenda);
    const dataRecebimento = dto.dataRecebimento ? this.parseDateOnly(dto.dataRecebimento) : undefined;

    const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const parseRange = (tipo: string) => {
      const nums = (tipo.match(/\d+/g) || []).map((n) => Number(n)).filter((n) => !Number.isNaN(n));
      if (nums.length === 1) return { min: nums[0], max: nums[0] };
      if (nums.length >= 2) return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) };
      if (normalize(tipo).includes('vista') || normalize(tipo).includes('av')) return { min: 1, max: 1 };
      return null;
    };

    const { offsets, rule } = await this.resolveRuleAndOffsets({
      parcelas,
      card: card ?? undefined,
      tipoPag: tipoPag ?? undefined,
      regraId: dto.regraId,
      usarEscalonadoPadrao: dto.usarEscalonadoPadrao,
      prazoRecebimentoDias: dto.prazoRecebimentoDias,
    });
    const efetivas = offsets.length || parcelas;
    const valorParcela = Number(dto.valorTotal) / efetivas;

    const recebimentos: Recebimento[] = [];
    for (let i = 0; i < efetivas; i++) {
      const taxaPerc = (rule?.taxaPercentual ?? 0) + (rule?.adicionalParcela ?? 0);
      const taxaValorPerc = (valorParcela * taxaPerc) / 100;
      const taxaFixa = rule?.taxaFixa ?? 0;
      const valorTaxa = taxaValorPerc + taxaFixa;
      const valorLiquido = valorParcela - valorTaxa;
      const offset = offsets[i] ?? 0;
      let dataPrevista: Date | null = null;
      if (dataRecebimento) {
        dataPrevista = new Date(dataRecebimento);
        dataPrevista.setDate(dataPrevista.getDate() + offset);
      }

      const rec = this.recebimentoRepo.create({
        venda: sale,
        tipoPagamento: tipoPag,
        cartaoConta: card,
        parcelaNumero: i + 1,
        valorBruto: valorParcela,
        valorTaxa,
        valorLiquido,
        dataPrevista,
        status: 'previsto',
        createdById: userId,
        updatedById: userId,
      });
      em.persist(rec);
      recebimentos.push(rec);
    }
    await em.flush();
    return recebimentos;
  }

  async computeOffsetsPreview(params: {
    parcelas: number;
    tipoPagamentoId?: string;
    cartaoContaId?: string;
    regraId?: string;
    usarEscalonadoPadrao?: boolean;
    prazoRecebimentoDias?: number;
  }): Promise<number[]> {
    const card = params.cartaoContaId ? await this.cardAccountRepo.findOne({ id: params.cartaoContaId }) : undefined;
    const tipoPag = params.tipoPagamentoId ? await this.paymentTypeRepo.findOne({ id: params.tipoPagamentoId }) : undefined;
    const { offsets } = await this.resolveRuleAndOffsets({
      parcelas: params.parcelas,
      card: card ?? undefined,
      tipoPag: tipoPag ?? undefined,
      regraId: params.regraId,
      usarEscalonadoPadrao: params.usarEscalonadoPadrao,
      prazoRecebimentoDias: params.prazoRecebimentoDias,
    });
    return offsets;
  }

  private async resolveRuleAndOffsets(params: {
    parcelas: number;
    card?: CardAccount;
    tipoPag?: PaymentType;
    regraId?: string;
    usarEscalonadoPadrao?: boolean;
    prazoRecebimentoDias?: number;
  }): Promise<{ offsets: number[]; rule?: CardPaymentRule; useEscalonado: boolean }> {
    const { parcelas, card, tipoPag } = params;
    const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const parseRange = (tipo: string) => {
      const nums = (tipo.match(/\d+/g) || []).map((n) => Number(n)).filter((n) => !Number.isNaN(n));
      if (nums.length === 1) return { min: nums[0], max: nums[0] };
      if (nums.length >= 2) return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) };
      if (normalize(tipo).includes('vista') || normalize(tipo).includes('av')) return { min: 1, max: 1 };
      return null;
    };

    const tipoNorm = tipoPag ? normalize(tipoPag.descricao || '') : '';
    const isPix = tipoNorm.includes('pix');
    const isDeb = tipoNorm.includes('deb');
    const isCred = tipoNorm.includes('cred');

    let rule = params.regraId ? await this.cardRuleRepo.findOne({ id: params.regraId }) : undefined;
    if (!rule && card) {
      const regras = await this.cardRuleRepo.find({ cartao: card });
      const compat = regras.filter((r) => {
        const tNorm = normalize(r.tipo || '');
        if (isCred) return tNorm.includes('cred');
        if (isDeb) return tNorm.includes('deb');
        if (isPix) return tNorm.includes('pix');
        return true;
      });
      const fallbackSameType = regras.filter((r) => {
        const tNorm = normalize(r.tipo || '');
        if (isCred) return tNorm.includes('cred');
        if (isDeb) return tNorm.includes('deb');
        if (isPix) return tNorm.includes('pix');
        return false;
      });
      const lista = compat.length ? compat : fallbackSameType;
      const exact = lista.find((r) => {
        const range = parseRange(r.tipo || '');
        if (!range) return false;
        return parcelas >= range.min && parcelas <= range.max;
      });
      rule = exact ?? lista[0];
    }

    const useEscalonado = params.usarEscalonadoPadrao ?? rule?.prazoEscalonadoPadrao ?? false;
    const efetivas = parcelas;
    const offsets = isPix
      ? Array(efetivas).fill(0)
      : this.buildOffsets(efetivas, rule ?? undefined, useEscalonado, params.prazoRecebimentoDias);

    return { offsets, rule: rule ?? undefined, useEscalonado };
  }

  private parseDateOnly(dateStr: string) {
    const parsed = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Data invΓêÆlida');
    }
    return parsed;
  }

  async listRecebimentos() {
    const recs = await this.recebimentoRepo.findAll();
    return recs.map((r) => this.serializeRecebimento(r));
  }

  async updateRecebimento(id: string, dto: UpdateRecebimentoDto, userId?: string) {
    const rec = await this.recebimentoRepo.findOne({ id });
    if (!rec) {
      throw new NotFoundException('Recebimento não encontrado');
    }
    if (dto.status) {
      rec.status = dto.status;
    }
    if (dto.dataRecebida) {
      rec.dataRecebida = new Date(dto.dataRecebida);
    }
    rec.updatedById = userId;
    await this.recebimentoRepo.getEntityManager().persistAndFlush(rec);
    return this.serializeRecebimento(rec);
  }

  async caixaResumo() {
    const all = await this.recebimentoRepo.findAll();
    const entradasRecebidas = all
      .filter((r) => r.status === 'recebido')
      .reduce((sum, r) => sum + Number(r.valorLiquido), 0);
    const entradasPrevistas = all
      .filter((r) => r.status === 'previsto')
      .reduce((sum, r) => sum + Number(r.valorLiquido), 0);
    return {
      entradasRecebidas,
      entradasPrevistas,
      saldoProjetado: entradasRecebidas + entradasPrevistas,
      quantidadePrevista: all.filter((r) => r.status === 'previsto').length,
      quantidadeRecebida: all.filter((r) => r.status === 'recebido').length,
    };
  }

  private serializeRecebimento(rec: Recebimento) {
    const payload: any = { ...rec };
    if (!rec.dataRecebida || !rec.dataPrevista) {
      delete payload.dataPrevista;
    }
    return payload;
  }

  private getMonthRange(monthReference: string) {
    const [yearStr, monthStr] = monthReference.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return { start, end };
  }

  async registerCardInvoicePayment(
    dto: CreateCardInvoicePaymentDto,
    userId?: string,
  ) {
    const card = await this.cardAccountRepo.findOne({ id: dto.cartaoContaId });
    if (!card) {
      throw new NotFoundException('Cartão/conta não encontrado');
    }

    const payment = this.cardInvoicePaymentRepo.create({
      cartaoConta: card,
      mesReferencia: dto.mesReferencia,
      dataPagamentoReal: new Date(dto.dataPagamentoReal),
      createdById: userId,
      updatedById: userId,
    });

    const { start, end } = this.getMonthRange(dto.mesReferencia);
    const parcelas = await this.purchasePaymentRepo.find({
      cartaoConta: card,
      dataVencimento: { $gte: start, $lte: end },
    });

    parcelas.forEach((parcela) => {
      parcela.statusPagamento = 'paga';
      parcela.dataPagamento = payment.dataPagamentoReal;
      parcela.updatedById = userId;
      this.purchasePaymentRepo.getEntityManager().persist(parcela);
    });

    const em = this.cardInvoicePaymentRepo.getEntityManager();
    em.persist(payment);
    await em.flush();

    return payment;
  }

  async listExpenses() {
    return this.expenseRepo.findAll({ populate: ['tipoPagamento', 'cartaoConta', 'fornecedor'] });
  }

  async getExpense(id: string) {
    const gasto = await this.expenseRepo.findOne(
      { id },
      { populate: ['tipoPagamento', 'cartaoConta', 'fornecedor', 'itens', 'pagamentos', 'pagamentos.cartaoConta'] },
    );
    if (!gasto) throw new NotFoundException('Gasto n\u00e3o encontrado');
    return gasto;
  }

  async createExpense(dto: CreateExpenseDto, userId?: string) {
    const tipoPagamento = await this.paymentTypeRepo.findOne({ id: dto.tipoPagamentoId });
    if (!tipoPagamento) throw new NotFoundException('Tipo de pagamento n\u00e3o encontrado');

    const fornecedor = dto.fornecedorId ? await this.supplierRepo.findOne({ id: dto.fornecedorId }) : undefined;
    if (dto.fornecedorId && !fornecedor) {
      throw new NotFoundException('Fornecedor n\u00e3o encontrado');
    }

    const cartao = dto.cartaoContaId ? await this.cardAccountRepo.findOne({ id: dto.cartaoContaId }) : undefined;
    const desc = (tipoPagamento.descricao || '').toLowerCase();
    const descNorm = desc.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isCredito = desc.includes('cred') || descNorm.includes('credito');
    const cardRequired = isCredito || desc.includes('pix') || descNorm.includes('debito');
    if (cardRequired && !cartao) {
      throw new NotFoundException('Cart\u00e3o/conta n\u00e3o encontrado para este pagamento');
    }

    const em = this.expenseRepo.getEntityManager();
    const gasto = this.expenseRepo.create({
      data: new Date(dto.data),
      tipoPagamento,
      cartaoConta: cardRequired ? cartao : undefined,
      fornecedor,
      parcelas: dto.parcelas ?? 1,
      totalCompra: dto.totalCompra,
      status: cardRequired && !isCredito ? 'pago' : 'pendente',
      observacoes: dto.observacoes,
      descricao: dto.descricao,
      createdById: userId,
      updatedById: userId,
    });
    em.persist(gasto);

    dto.itens.forEach((it) => {
      const item = this.expenseItemRepo.create({
        gasto,
        descricaoItem: it.descricao || 'Item',
        qtde: it.qtde,
        valorUnit: it.valorUnit,
        valorTotal: it.qtde * it.valorUnit,
        createdById: userId,
        updatedById: userId,
      });
      em.persist(item);
    });

    const parcelas = isCredito ? dto.parcelas ?? 1 : 1;
    const valorParcela = dto.totalCompra / parcelas;
    const baseDate = new Date(dto.data);

    const computeVencimento = (parcelaIndex: number) => {
      if (!cartao || !cartao.diaVencimento) {
        const venc = new Date(baseDate);
        venc.setMonth(venc.getMonth() + parcelaIndex);
        return venc;
      }
      const vencDia = cartao.diaVencimento;
      const fechamento = cartao.diaFechamento ?? 0;
      let ano = baseDate.getFullYear();
      let mes = baseDate.getMonth();
      const compraAposFechamento = baseDate.getDate() > fechamento;
      if (compraAposFechamento) {
        mes += 1;
        if (mes > 11) {
          mes = 0;
          ano += 1;
        }
      }
      mes += parcelaIndex;
      while (mes > 11) {
        mes -= 12;
        ano += 1;
      }
      return new Date(ano, mes, vencDia);
    };

    for (let i = 0; i < parcelas; i++) {
      const vencimento = cardRequired ? computeVencimento(i) : baseDate;
      const statusPagamento = cardRequired ? 'pendente' : 'paga';
      const pagamento = this.expensePaymentRepo.create({
        gasto,
        nParcela: i + 1,
        dataVencimento: vencimento,
        dataPagamento: statusPagamento === 'paga' ? baseDate : undefined,
        valorParcela,
        valorCompra: dto.totalCompra,
        statusPagamento,
        tipoPagamento,
        cartaoConta: cardRequired ? cartao : undefined,
        createdById: userId,
        updatedById: userId,
      });
      em.persist(pagamento);
    }

    await em.flush();
    return gasto;
  }

  async listExpensePayments() {
    return this.expensePaymentRepo.findAll({ populate: ['gasto', 'cartaoConta', 'tipoPagamento'] });
  }
}
