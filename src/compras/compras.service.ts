import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { CardAccount } from '../financeiro/entities/card-account.entity';
import { PaymentType } from '../financeiro/entities/payment-type.entity';
import { Product } from '../produtos/entities/product.entity';
import { Supplier } from '../produtos/entities/supplier.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchasePaymentDto } from './dto/update-purchase-payment.dto';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { PurchasePayment } from './entities/purchase-payment.entity';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepo: EntityRepository<Purchase>,
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemRepo: EntityRepository<PurchaseItem>,
    @InjectRepository(PurchasePayment)
    private readonly purchasePaymentRepo: EntityRepository<PurchasePayment>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: EntityRepository<Supplier>,
    @InjectRepository(Product)
    private readonly productRepo: EntityRepository<Product>,
    @InjectRepository(PaymentType)
    private readonly paymentTypeRepo: EntityRepository<PaymentType>,
    @InjectRepository(CardAccount)
    private readonly cardAccountRepo: EntityRepository<CardAccount>,
  ) {}

  async listPurchases() {
    return this.purchaseRepo.findAll({
      populate: ['fornecedor', 'tipoPagamento', 'pagamentos'],
    });
  }

  async createPurchase(dto: CreatePurchaseDto, userId?: string) {
    const fornecedor = await this.supplierRepo.findOne({ id: dto.fornecedorId });
    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }
    const tipoPagamento = await this.paymentTypeRepo.findOne({ id: dto.tipoPagamentoId });
    if (!tipoPagamento) {
      throw new NotFoundException('Tipo de pagamento não encontrado');
    }
    const cartao = dto.cartaoContaId ? await this.cardAccountRepo.findOne({ id: dto.cartaoContaId }) : undefined;
    if (dto.cartaoContaId && !cartao) {
      throw new NotFoundException('Cartão/conta não encontrado');
    }

    const compra = this.purchaseRepo.create({
      data: new Date(dto.data),
      fornecedor,
      tipoPagamento,
      parcelas: dto.parcelas ?? 1,
      frete: dto.frete ?? 0,
      totalCompra: 0,
      status: 'pendente',
      observacoes: dto.observacoes,
      createdById: userId,
      updatedById: userId,
    });

    let total = dto.frete ?? 0;
    dto.itens.forEach((it) => {
      total += it.qtde * it.valorUnit;
    });

    const em = this.purchaseRepo.getEntityManager();
    compra.totalCompra = total;
    em.persist(compra);

    dto.itens.forEach((it) => {
      const item = this.purchaseItemRepo.create({
        compra,
        item: { id: it.produtoId } as any as Product,
        qtde: it.qtde,
        valorUnit: it.valorUnit,
        valorTotal: it.qtde * it.valorUnit,
        createdById: userId,
        updatedById: userId,
      });
      em.persist(item);
    });

    const parcelas = dto.parcelas && dto.parcelas > 0 ? dto.parcelas : 1;
    const valorParcela = total / parcelas;
    const baseDate = new Date(dto.data);

    for (let i = 0; i < parcelas; i++) {
      const vencimento = new Date(baseDate);
      vencimento.setMonth(vencimento.getMonth() + i);
      const pagamento = this.purchasePaymentRepo.create({
        compra,
        nParcela: i + 1,
        dataVencimento: vencimento,
        valorParcela,
        statusPagamento: 'pendente',
        tipoPagamento,
        cartaoConta: cartao,
        createdById: userId,
        updatedById: userId,
      });
      em.persist(pagamento);
    }

    await em.flush();
    return compra;
  }

  async listPayments() {
    return this.purchasePaymentRepo.findAll({
      populate: ['compra', 'tipoPagamento', 'cartaoConta'],
    });
  }

  async updatePaymentStatus(id: string, dto: UpdatePurchasePaymentDto, userId?: string) {
    const payment = await this.purchasePaymentRepo.findOne({ id }, { populate: ['compra'] });
    if (!payment) {
      throw new NotFoundException('Parcela não encontrada');
    }
    payment.statusPagamento = dto.statusPagamento;
    payment.dataPagamento = dto.dataPagamento ? new Date(dto.dataPagamento) : payment.dataPagamento;
    payment.updatedById = userId;
    await this.purchasePaymentRepo.getEntityManager().persistAndFlush(payment);
    return payment;
  }
}
