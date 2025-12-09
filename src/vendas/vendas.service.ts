import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { Recebimento } from '../financeiro/entities/recebimento.entity';
import { PaymentType } from '../financeiro/entities/payment-type.entity';
import { CardAccount } from '../financeiro/entities/card-account.entity';
import { Product } from '../produtos/entities/product.entity';
import { ProductStock } from '../produtos/entities/product-stock.entity';
import { ProductStockHistory } from '../produtos/entities/product-stock-history.entity';
import { Customer } from '../produtos/entities/customer.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSalePaymentDto } from './dto/update-sale-payment.dto';
import { MarkSalePaidDto } from './dto/mark-sale-paid.dto';
import { SaleItem } from './entities/sale-item.entity';
import { Sale } from './entities/sale.entity';

@Injectable()
export class VendasService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepo: EntityRepository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepo: EntityRepository<SaleItem>,
    @InjectRepository(Product)
    private readonly productRepo: EntityRepository<Product>,
    @InjectRepository(ProductStock)
    private readonly stockRepo: EntityRepository<ProductStock>,
    @InjectRepository(ProductStockHistory)
    private readonly stockHistoryRepo: EntityRepository<ProductStockHistory>,
    @InjectRepository(Customer)
    private readonly customerRepo: EntityRepository<Customer>,
    @InjectRepository(PaymentType)
    private readonly paymentTypeRepo: EntityRepository<PaymentType>,
    @InjectRepository(CardAccount)
    private readonly cardAccountRepo: EntityRepository<CardAccount>,
    @InjectRepository(Recebimento)
    private readonly recebimentoRepo: EntityRepository<Recebimento>,
    private readonly financeiroService: FinanceiroService,
  ) {}

  async listSales(): Promise<any[]> {
    const sales = await this.saleRepo.findAll({
      populate: ['cliente', 'tipoPagamento'],
      orderBy: { data: 'DESC' },
    });
    const ids = sales.map((s) => s.id);
    if (ids.length === 0) return sales;
    const recs = await this.recebimentoRepo.find(
      { venda: { $in: ids } },
      { orderBy: { parcelaNumero: 'DESC' }, populate: ['venda'] },
    );
    const lastBySale = new Map<string, Recebimento>();
    for (const r of recs) {
      const saleId = (r.venda as any)?.id ?? (r as any).venda?.id;
      if (saleId && !lastBySale.has(saleId)) {
        lastBySale.set(saleId, r);
      }
    }
    sales.forEach((s) => {
      const last = lastBySale.get(s.id);
      if (last) {
        s.status = this.computeStatusFromRecebimentos([last], s.status);
      }
    });
    return sales;
  }

  async getSale(id: string): Promise<any> {
    const sale = await this.saleRepo.findOne(
      { id },
      {
        populate: [
          'cliente',
          'tipoPagamento',
          'itens',
          'itens.item',
          'itens.item.tipo',
          'itens.item.cor',
          'itens.item.material',
        ],
      },
    );
    if (!sale) {
      throw new NotFoundException('Venda nÇœo encontrada');
    }
    const recebimentos = await this.recebimentoRepo.find(
      { venda: sale },
      { populate: ['tipoPagamento', 'cartaoConta'], orderBy: { parcelaNumero: 'ASC' } },
    );
    const status = this.computeStatusFromRecebimentos(recebimentos, sale.status);
    return { ...sale, status, recebimentos };
  }

  private isCredit(descricao: string) {
    const name = descricao.toLowerCase();
    const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return name.includes('cred') || normalized.includes('credito');
  }

  private isImmediate(descricao: string) {
    const name = descricao.toLowerCase();
    const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return name.includes('dinheiro'); // apenas dinheiro considera imediato; pix/debito ficam pendentes até marcar pago
  }

  private computeStatusFromRecebimentos(recebs: Recebimento[], fallback: string) {
    if (!recebs || recebs.length === 0) return fallback;
    const sorted = [...recebs].sort((a, b) => (b.parcelaNumero ?? 0) - (a.parcelaNumero ?? 0));
    const last = sorted[0];
    if (!last) return fallback;
    if (last.status === 'cancelado') return 'cancelado';
    const hoje = new Date();
    const prevista = last.dataPrevista ? new Date(last.dataPrevista) : null;
    if (last.status === 'recebido') {
      if (prevista && !this.isDateReached(prevista, hoje)) return 'paga';
      return 'recebido';
    }
    if (last.status === 'previsto') {
      if (last.dataRecebida) {
        if (prevista && this.isDateReached(prevista, hoje)) return 'recebido';
        return 'paga';
      }
      return 'pendente';
    }
    return 'pendente';
  }

  private parseDateOnly(dateStr: string) {
    const parsed = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Data invÃ¡lida');
    }
    return parsed;
  }

  private isDateReached(prevista: Date, referencia: Date) {
    const p = new Date(prevista);
    const r = new Date(referencia);
    p.setHours(0, 0, 0, 0);
    r.setHours(0, 0, 0, 0);
    return r.getTime() >= p.getTime();
  }

  private normalizePagoParaRecebido(recs: Recebimento[], referencia: Date) {
    recs.forEach((r) => {
      if (r.status === 'previsto' && r.dataRecebida && r.dataPrevista && this.isDateReached(r.dataPrevista, referencia)) {
        r.status = 'recebido';
        if (!r.dataRecebida) r.dataRecebida = referencia;
      }
    });
  }

  async createSale(dto: CreateSaleDto, userId?: string): Promise<any> {
    if (!dto.itens || dto.itens.length === 0) {
      throw new BadRequestException('Inclua ao menos um item na venda');
    }
    if (dto.parcelas < 1) {
      throw new BadRequestException('NÇ§mero de parcelas invÇ­lido');
    }

    const cliente = await this.customerRepo.findOne({ id: dto.clienteId });
    if (!cliente) {
      throw new NotFoundException('Cliente nÇœo encontrado');
    }
    const tipoPagamento = await this.paymentTypeRepo.findOne({ id: dto.tipoPagamentoId });
    if (!tipoPagamento) {
      throw new NotFoundException('Tipo de pagamento nÇœo encontrado');
    }

    const desc = tipoPagamento.descricao?.toLowerCase() ?? '';
    const descNorm = desc.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cardRequired =
      this.isCredit(desc) ||
      desc.includes('pix') ||
      descNorm.includes('debito');
    if (cardRequired && !dto.cartaoContaId) {
      throw new BadRequestException('Selecione o cartÇœo/conta para esta forma de pagamento');
    }

    const em = this.saleRepo.getEntityManager();
    const dataVenda = this.parseDateOnly(dto.data);
    const sale = this.saleRepo.create({
      data: dataVenda,
      cliente,
      tipoPagamento,
      parcelas: dto.parcelas ?? 1,
      frete: dto.frete ?? 0,
      descontoTotal: dto.descontoTotal ?? 0,
      totalVenda: 0,
      status: 'pendente',
      observacoes: dto.observacoes,
      createdById: userId,
      updatedById: userId,
    });
    em.persist(sale);

    let totalItens = 0;
    for (const it of dto.itens) {
      const produto = await this.productRepo.findOne({ id: it.produtoId }, { populate: ['estoque'] });
      if (!produto) {
        throw new NotFoundException('Produto nÇœo encontrado');
      }
      if (it.qtde <= 0) {
        throw new BadRequestException('Quantidade deve ser maior que zero');
      }

      let estoque = produto.estoque;
      if (!estoque) {
        estoque = this.stockRepo.create({
          produto,
          quantidadeAtual: 0,
          createdById: userId,
          updatedById: userId,
        });
        produto.estoque = estoque;
        em.persist(estoque);
      }
      const disponivel = estoque.quantidadeAtual ?? 0;
      if (it.qtde > disponivel) {
        throw new BadRequestException(`Estoque insuficiente para o produto ${produto.nome}`);
      }

      const novaQuantidade = disponivel - it.qtde;
      estoque.quantidadeAtual = novaQuantidade;
      estoque.updatedById = userId;
      em.persist(estoque);

      const history = this.stockHistoryRepo.create({
        produto,
        quantidadeAnterior: disponivel,
        quantidadeNova: novaQuantidade,
        quantidadeAdicionada: 0,
        quantidadeSubtraida: it.qtde,
        motivo: 'VENDA',
        referencia: sale.id,
        vendaId: sale.id,
        dataMudanca: dataVenda,
        createdById: userId,
      });
      em.persist(history);

      const subtotal = it.qtde * it.precoUnit;
      totalItens += subtotal;

      const item = this.saleItemRepo.create({
        venda: sale,
        item: produto,
        qtde: it.qtde,
        precoUnit: it.precoUnit,
        subtotal,
        createdById: userId,
        updatedById: userId,
      });
      em.persist(item);
    }

    const frete = dto.frete ?? 0;
    const desconto = dto.descontoTotal ?? 0;
    const totalVenda = Math.max(0, totalItens + frete - desconto);
    const isImmediatePayment = this.isImmediate(tipoPagamento.descricao ?? '');
    sale.totalVenda = totalVenda;
    sale.status = dto.pagoAgora && isImmediatePayment ? 'paga' : 'pendente';

    await em.flush();

    const recebimentos = await this.financeiroService.createRecebimentos({
      vendaId: sale.id,
      tipoPagamentoId: dto.tipoPagamentoId,
      cartaoContaId: dto.cartaoContaId,
      regraId: dto.regraId,
      dataVenda: dto.data,
      parcelas: dto.parcelas,
      valorTotal: totalVenda,
      usarEscalonadoPadrao: dto.usarEscalonadoPadrao,
      prazoRecebimentoDias: dto.prazoRecebimentoDias,
    });

    if (dto.pagoAgora) {
      const dataPag = dto.dataPagamento ? this.parseDateOnly(dto.dataPagamento) : dataVenda;
      const hojeRef = new Date();
      recebimentos.forEach((rec) => {
        if (isImmediatePayment || (rec.dataPrevista && this.isDateReached(rec.dataPrevista, hojeRef))) {
          rec.status = 'recebido';
          rec.dataRecebida = dataPag;
          rec.dataPrevista = rec.dataPrevista ?? dataPag;
        } else {
          rec.status = 'previsto';
          rec.dataRecebida = dataPag;
        }
        rec.updatedById = userId;
        em.persist(rec);
      });
      await em.flush();
      this.normalizePagoParaRecebido(recebimentos, dataPag);
      await em.flush();
      sale.status = this.computeStatusFromRecebimentos(recebimentos, sale.status);
      await em.flush();
    }

    return this.getSale(sale.id);
  }

  async markSalePaid(id: string, dto: MarkSalePaidDto, userId?: string) {
    const sale = await this.saleRepo.findOne({ id }, { populate: ['itens', 'itens.item'] });
    if (!sale) throw new NotFoundException('Venda não encontrada');
    const recebimentos = await this.recebimentoRepo.find({ venda: sale });
    const dataPag = dto.dataPagamento ? new Date(dto.dataPagamento) : new Date();
    const hojeRef = new Date();
    recebimentos.forEach((r) => {
      if (r.dataPrevista && !this.isDateReached(r.dataPrevista, hojeRef)) {
        r.status = 'previsto';
        r.dataRecebida = dataPag;
      } else {
        r.status = 'recebido';
        r.dataRecebida = dataPag;
        if (!r.dataPrevista) r.dataPrevista = dataPag;
      }
      r.updatedById = userId;
      this.recebimentoRepo.getEntityManager().persist(r);
    });
    this.normalizePagoParaRecebido(recebimentos, dataPag);
    sale.status = this.computeStatusFromRecebimentos(recebimentos, sale.status);
    sale.updatedById = userId;
    await this.saleRepo.getEntityManager().persistAndFlush(sale);
    return this.getSale(id);
  }

async cancelSale(id: string, userId?: string) {
    const sale = await this.saleRepo.findOne(
      { id },
      { populate: ['itens', 'itens.item', 'itens.item.estoque'] },
    );
    if (!sale) throw new NotFoundException('Venda nÇœo encontrada');
    if (sale.status === 'cancelada') {
      throw new BadRequestException('Venda jÇ­ cancelada');
    }

    const em = this.saleRepo.getEntityManager();
    for (const it of sale.itens) {
      const produto = it.item;
      let estoque = produto.estoque;
      if (!estoque) {
        estoque = this.stockRepo.create({
          produto,
          quantidadeAtual: 0,
          createdById: userId,
          updatedById: userId,
        });
        em.persist(estoque);
      }
      const anterior = estoque.quantidadeAtual ?? 0;
      const nova = anterior + it.qtde;
      estoque.quantidadeAtual = nova;
      estoque.updatedById = userId;
      em.persist(estoque);

      const hist = this.stockHistoryRepo.create({
        produto,
        quantidadeAnterior: anterior,
        quantidadeNova: nova,
        quantidadeAdicionada: it.qtde,
        quantidadeSubtraida: 0,
        motivo: 'CANCELAMENTO_VENDA',
        referencia: sale.id,
        vendaId: sale.id,
        dataMudanca: new Date(),
        createdById: userId,
      });
      em.persist(hist);
    }

    const recebimentos = await this.recebimentoRepo.find({ venda: sale });
    recebimentos.forEach((r) => {
      r.status = 'cancelado';
      r.updatedById = userId;
      this.recebimentoRepo.getEntityManager().persist(r);
    });

    sale.status = 'cancelada';
    sale.updatedById = userId;
    await em.flush();
    return this.getSale(id);
  }

  async updateSalePayment(id: string, dto: UpdateSalePaymentDto, userId?: string) {
    const sale = await this.saleRepo.findOne({ id }, { populate: ['itens', 'cliente', 'tipoPagamento'] });
    if (!sale) throw new NotFoundException('Venda nÇœo encontrada');
    if (sale.status === 'paga') {
      throw new BadRequestException('NÇœo Ç¸ possÇ­vel alterar pagamento de venda paga');
    }

    const tipoPagamento = await this.paymentTypeRepo.findOne({ id: dto.tipoPagamentoId });
    if (!tipoPagamento) throw new NotFoundException('Tipo de pagamento nÇœo encontrado');
    const cartao = dto.cartaoContaId ? await this.cardAccountRepo.findOne({ id: dto.cartaoContaId }) : undefined;
    const cardRequired = this.isCredit(tipoPagamento.descricao) || tipoPagamento.descricao.toLowerCase().includes('pix') || tipoPagamento.descricao.toLowerCase().includes('deb');
    if (cardRequired && !cartao) {
      throw new BadRequestException('Selecione um cartao/conta para este pagamento');
    }

    // Cancela recebimentos anteriores
    const recebimentos = await this.recebimentoRepo.find({ venda: sale });
    recebimentos.forEach((r) => {
      r.status = 'cancelado';
      r.updatedById = userId;
      this.recebimentoRepo.getEntityManager().persist(r);
    });

    const isImmediatePayment = this.isImmediate(tipoPagamento.descricao ?? '');
    sale.tipoPagamento = tipoPagamento;
    sale.parcelas = dto.parcelas;
    sale.status = dto.pagoAgora && isImmediatePayment ? 'paga' : 'pendente';
    sale.updatedById = userId;
    await this.saleRepo.getEntityManager().persistAndFlush(sale);

    const recebimentosNovos = await this.financeiroService.createRecebimentos({
      vendaId: sale.id,
      tipoPagamentoId: dto.tipoPagamentoId,
      cartaoContaId: dto.cartaoContaId,
      regraId: dto.regraId,
      dataVenda: sale.data.toISOString().slice(0, 10),
      parcelas: dto.parcelas,
      valorTotal: sale.totalVenda,
      usarEscalonadoPadrao: dto.usarEscalonadoPadrao,
      prazoRecebimentoDias: dto.prazoRecebimentoDias,
    });

    if (dto.pagoAgora) {
      const dataPag = dto.dataPagamento ? this.parseDateOnly(dto.dataPagamento) : new Date();
      const hojeRef = new Date();
      recebimentosNovos.forEach((rec) => {
        if (isImmediatePayment || (rec.dataPrevista && this.isDateReached(rec.dataPrevista, hojeRef))) {
          rec.status = 'recebido';
          rec.dataRecebida = dataPag;
          if (!rec.dataPrevista) rec.dataPrevista = dataPag;
        } else {
          rec.status = 'previsto';
          rec.dataRecebida = dataPag;
        }
        rec.updatedById = userId;
        this.recebimentoRepo.getEntityManager().persist(rec);
      });
      await this.recebimentoRepo.getEntityManager().flush();
      this.normalizePagoParaRecebido(recebimentosNovos, dataPag);
      await this.recebimentoRepo.getEntityManager().flush();
      sale.status = this.computeStatusFromRecebimentos(recebimentosNovos, sale.status);
      await this.saleRepo.getEntityManager().persistAndFlush(sale);
    }

    return this.getSale(id);
  }
}
