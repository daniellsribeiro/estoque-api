import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { CardAccount } from "../financeiro/entities/card-account.entity";
import { PaymentType } from "../financeiro/entities/payment-type.entity";
import { Product } from "../produtos/entities/product.entity";
import { ProductStock } from "../produtos/entities/product-stock.entity";
import { ProductStockHistory } from "../produtos/entities/product-stock-history.entity";
import { Supplier } from "../produtos/entities/supplier.entity";
import { CreatePurchaseDto } from "./dto/create-purchase.dto";
import { UpdatePurchasePaymentDto } from "./dto/update-purchase-payment.dto";
import { Purchase } from "./entities/purchase.entity";
import { PurchaseItem } from "./entities/purchase-item.entity";
import { PurchasePayment } from "./entities/purchase-payment.entity";

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
    @InjectRepository(ProductStock)
    private readonly stockRepo: EntityRepository<ProductStock>,
    @InjectRepository(ProductStockHistory)
    private readonly stockHistoryRepo: EntityRepository<ProductStockHistory>,
    @InjectRepository(PaymentType)
    private readonly paymentTypeRepo: EntityRepository<PaymentType>,
    @InjectRepository(CardAccount)
    private readonly cardAccountRepo: EntityRepository<CardAccount>,
  ) {}

  private parseDate(value?: string) {
    if (!value) return undefined;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return undefined;
    return d;
  }

  async listPurchases(filters: {
    dataInicio?: string;
    dataFim?: string;
    fornecedorId?: string;
    tipoPagamentoId?: string;
    tipoPagamento?: string;
    status?: string;
  } = {}) {
    const qb = this.purchaseRepo
      .createQueryBuilder("c")
      .leftJoinAndSelect("c.fornecedor", "f")
      .leftJoinAndSelect("c.tipoPagamento", "tp")
      .leftJoinAndSelect("c.cartaoConta", "cc");

    const ini = this.parseDate(filters.dataInicio);
    const fim = this.parseDate(filters.dataFim);
    if (ini) qb.andWhere("c.data >= ?", [ini]);
    if (fim) qb.andWhere("c.data <= ?", [fim]);
    if (filters.fornecedorId) qb.andWhere("f.id = ?", [filters.fornecedorId]);
    const tipoId = filters.tipoPagamentoId || filters.tipoPagamento;
    if (tipoId) qb.andWhere("tp.id = ?", [tipoId]);
    if (filters.status) qb.andWhere("lower(c.status) = ?", [filters.status.toLowerCase()]);

    qb.orderBy({ "c.data": "DESC", "c.createdAt": "DESC" });
    return qb.getResultList();
  }

  async getPurchase(id: string) {
    const compra = await this.purchaseRepo.findOne(
      { id },
      { populate: ["fornecedor", "tipoPagamento", "cartaoConta", "itens", "itens.item", "pagamentos"] },
    );
    if (!compra) {
      throw new NotFoundException("Compra não encontrada");
    }
    return compra;
  }

  async createPurchase(dto: CreatePurchaseDto, userId?: string) {
    const fornecedor = await this.supplierRepo.findOne({ id: dto.fornecedorId });
    if (!fornecedor) throw new NotFoundException("Fornecedor não encontrado");

    const tipoPagamento = await this.paymentTypeRepo.findOne({ id: dto.tipoPagamentoId });
    if (!tipoPagamento) throw new NotFoundException("Tipo de pagamento não encontrado");

    const cartao = dto.cartaoContaId ? await this.cardAccountRepo.findOne({ id: dto.cartaoContaId }) : undefined;
    if (dto.cartaoContaId && !cartao) throw new NotFoundException("Cartão/conta não encontrado");

    const tipoNome = tipoPagamento.descricao.toLowerCase();
    const isCredit = ["credito", "crédito"].includes(tipoNome);
    const isImmediate = ["pix", "dinheiro", "debito", "débito"].includes(tipoNome);
    // dinheiro não exige cartão; débito/pix/crédito exigem
    const cardRequired = isCredit || ["pix", "debito", "débito"].includes(tipoNome);
    if (cardRequired && !cartao) {
      throw new BadRequestException("É necessário informar o cartão/conta para esta forma de pagamento.");
    }

    const compra = this.purchaseRepo.create({
      data: new Date(dto.data),
      fornecedor,
      tipoPagamento,
      cartaoConta: cartao,
      parcelas: dto.parcelas ?? 1,
      totalCompra: dto.totalCompra,
      status: "pendente",
      observacoes: dto.observacoes,
      createdById: userId,
      updatedById: userId,
    });

    const total = dto.totalCompra;
    const em = this.purchaseRepo.getEntityManager();
    compra.totalCompra = total;
    em.persist(compra);

    for (const it of dto.itens) {
      const product = await this.productRepo.findOne({ id: it.produtoId }, { populate: ["estoque"] });
      if (!product) {
        throw new NotFoundException("Produto n�o encontrado");
      }

      let estoque = product.estoque;
      if (!estoque) {
        estoque = this.stockRepo.create({
          produto: product,
          quantidadeAtual: 0,
          createdById: userId,
          updatedById: userId,
        });
        product.estoque = estoque;
        em.persist(estoque);
      }

      const quantidadeAnterior = estoque.quantidadeAtual ?? 0;
      const quantidadeNova = quantidadeAnterior + it.qtde;
      estoque.quantidadeAtual = quantidadeNova;
      estoque.updatedById = userId;
      em.persist(estoque);

      const history = this.stockHistoryRepo.create({
        produto: product,
        quantidadeAnterior,
        quantidadeNova,
        quantidadeAdicionada: it.qtde,
        quantidadeSubtraida: 0,
        motivo: "COMPRA",
        referencia: compra.id,
        compraId: compra.id,
        vendaId: undefined,
        dataMudanca: new Date(),
        createdById: userId,
      });
      em.persist(history);

      const item = this.purchaseItemRepo.create({
        compra,
        item: product,
        qtde: it.qtde,
        valorUnit: it.valorUnit,
        valorTotal: it.qtde * it.valorUnit,
        createdById: userId,
        updatedById: userId,
      });
      em.persist(item);
    }

    const parcelas = isImmediate ? 1 : dto.parcelas && dto.parcelas > 0 ? dto.parcelas : 1;
    const valorParcela = total / parcelas;
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
      const vencimento = isImmediate ? undefined : computeVencimento(i);
      const status = isImmediate ? "paga" : "pendente";
      const pagamento = this.purchasePaymentRepo.create({
        compra,
        nParcela: i + 1,
        dataVencimento: vencimento,
        dataPagamento: isImmediate ? baseDate : undefined,
        valorParcela,
        valorCompra: total,
        statusPagamento: status,
        tipoPagamento,
        cartaoConta: cardRequired ? cartao : undefined,
        createdById: userId,
        updatedById: userId,
      });
      em.persist(pagamento);
    }

    compra.status = isImmediate ? "paga" : "pendente";
    await em.flush();
    return compra;
  }

  async listPayments(filters: {
    dataInicio?: string;
    dataFim?: string;
    fornecedorId?: string;
    tipoPagamentoId?: string;
    tipoPagamento?: string;
    status?: string;
    compraId?: string;
  } = {}) {
    const qb = this.purchasePaymentRepo
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.compra", "c")
      .leftJoinAndSelect("p.tipoPagamento", "tp")
      .leftJoinAndSelect("p.cartaoConta", "cc")
      .leftJoinAndSelect("c.fornecedor", "f")
      .leftJoinAndSelect("c.tipoPagamento", "ctp");

    if (filters.compraId) qb.andWhere("c.id = ?", [filters.compraId]);
    const ini = this.parseDate(filters.dataInicio);
    const fim = this.parseDate(filters.dataFim);
    if (ini) qb.andWhere("c.data >= ?", [ini]);
    if (fim) qb.andWhere("c.data <= ?", [fim]);
    if (filters.fornecedorId) qb.andWhere("f.id = ?", [filters.fornecedorId]);
    const tipoId = filters.tipoPagamentoId || filters.tipoPagamento;
    if (tipoId) qb.andWhere("ctp.id = ?", [tipoId]);
    if (filters.status) qb.andWhere("lower(c.status) = ?", [filters.status.toLowerCase()]);

    qb.orderBy({ "c.data": "DESC", "p.nParcela": "ASC" });
    return qb.getResultList();
  }

  async updatePaymentStatus(id: string, dto: UpdatePurchasePaymentDto, userId?: string) {
    const payment = await this.purchasePaymentRepo.findOne({ id }, { populate: ["compra"] });
    if (!payment) throw new NotFoundException("Parcela não encontrada");
    payment.statusPagamento = dto.statusPagamento;
    payment.dataPagamento = dto.dataPagamento ? new Date(dto.dataPagamento) : payment.dataPagamento;
    payment.updatedById = userId;
    await this.purchasePaymentRepo.getEntityManager().persistAndFlush(payment);
    return payment;
  }
}
