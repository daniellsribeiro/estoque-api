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
      taxaFixa: dto.taxaFixa ?? 0,
      taxaPercentual: dto.taxaPercentual ?? 0,
      taxaParcela: dto.taxaParcela ?? 0,
      descontoPercentual: dto.descontoPercentual ?? 0,
      parcelavel: dto.parcelavel ?? false,
      minParcelas: dto.minParcelas ?? 1,
      maxParcelas: dto.maxParcelas ?? dto.minParcelas ?? 1,
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
    const offsets: number[] = [];
    const useEscalonado = overrideEscalonado ?? rule?.prazoEscalonadoPadrao ?? false;
    const prazoFixo = overridePrazo ?? rule?.prazoRecebimentoDias ?? 0;
    for (let i = 0; i < parcelas; i++) {
      if (useEscalonado) {
        offsets.push(i === 0 ? 31 : 31 + i * 30);
      } else {
        offsets.push(prazoFixo);
      }
    }
    return offsets;
  }

  async createRecebimentos(dto: CreateRecebimentoDto, userId?: string) {
    const em = this.recebimentoRepo.getEntityManager();
    const parcelas = dto.parcelas ?? 1;
    const dataVenda = new Date(dto.dataVenda);
    const rule = dto.regraId ? await this.cardRuleRepo.findOne({ id: dto.regraId }) : undefined;
    const offsets = this.buildOffsets(parcelas, rule ?? undefined, dto.usarEscalonadoPadrao, dto.prazoRecebimentoDias);

    const valorParcela = Number(dto.valorTotal) / parcelas;
    const sale = dto.vendaId ? await this.saleRepo.findOne({ id: dto.vendaId }) : undefined;
    const card = dto.cartaoContaId ? await this.cardAccountRepo.findOne({ id: dto.cartaoContaId }) : undefined;
    const tipoPag = dto.tipoPagamentoId ? await this.paymentTypeRepo.findOne({ id: dto.tipoPagamentoId }) : undefined;

    const recebimentos: Recebimento[] = [];
    for (let i = 0; i < parcelas; i++) {
      const taxaPerc = (rule?.taxaPercentual ?? 0) + (rule?.adicionalParcela ?? 0);
      const taxaValorPerc = (valorParcela * taxaPerc) / 100;
      const taxaFixa = rule?.taxaFixa ?? 0;
      const valorTaxa = taxaValorPerc + taxaFixa;
      const valorLiquido = valorParcela - valorTaxa;
      const dataPrevista = new Date(dataVenda);
      dataPrevista.setDate(dataPrevista.getDate() + (offsets[i] ?? 0));

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

  async listRecebimentos() {
    return this.recebimentoRepo.findAll();
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
    return rec;
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
}
