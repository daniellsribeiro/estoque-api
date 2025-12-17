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
import { DevolverVendaDto } from './dto/devolver-venda.dto';
import { CancelarVendaDto } from './dto/cancelar-venda.dto';
import { SaleFilterDto } from './dto/sale-filter.dto';

@Injectable()
export class VendasService {
  constructor(
    @InjectRepository(Sale) private readonly saleRepo: EntityRepository<Sale>,
    @InjectRepository(SaleItem) private readonly saleItemRepo: EntityRepository<SaleItem>,
    @InjectRepository(Product) private readonly productRepo: EntityRepository<Product>,
    @InjectRepository(ProductStock) private readonly stockRepo: EntityRepository<ProductStock>,
    @InjectRepository(ProductStockHistory) private readonly stockHistoryRepo: EntityRepository<ProductStockHistory>,
    @InjectRepository(Customer) private readonly customerRepo: EntityRepository<Customer>,
    @InjectRepository(PaymentType) private readonly paymentTypeRepo: EntityRepository<PaymentType>,
    @InjectRepository(CardAccount) private readonly cardAccountRepo: EntityRepository<CardAccount>,
    @InjectRepository(Recebimento) private readonly recebimentoRepo: EntityRepository<Recebimento>,
    private readonly financeiroService: FinanceiroService,
  ) {}

  private sumRecebimentosLiquido(recs: Recebimento[]) {
    return recs.reduce((sum, r) => sum + Number(r.valorLiquido ?? r.valorBruto ?? 0), 0);
  }

  private parseDate(value?: string) {
    if (!value) return undefined;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return undefined;
    return d;
  }

  async listSales(filters: SaleFilterDto = {}): Promise<any[]> {
    const qb = this.saleRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.cliente', 'c')
      .leftJoinAndSelect('s.tipoPagamento', 'tp');

    const ini = this.parseDate(filters.dataInicio);
    const fim = this.parseDate(filters.dataFim);
    if (ini) qb.andWhere('s.data >= ?', [ini]);
    if (fim) {
      const fimExclusivo = new Date(fim);
      fimExclusivo.setDate(fimExclusivo.getDate() + 1);
      qb.andWhere('s.data < ?', [fimExclusivo]);
    }
    if (filters.clienteNome) qb.andWhere('lower(c.nome) like ?', [`%${filters.clienteNome.toLowerCase()}%`]);
    const tipoId = (filters as any).tipoPagamentoId || (filters as any).tipoPagamento;
    if (tipoId) qb.andWhere('tp.id = ?', [tipoId]);
    if (filters.status) qb.andWhere('lower(s.status) = ?', [filters.status.toLowerCase()]);

    qb.orderBy({ 's.data': 'DESC', 's.createdAt': 'DESC' });

    const sales = await qb.getResultList();
    const ids = sales.map((s) => s.id);
    if (ids.length === 0) return sales;

    const recs = await this.recebimentoRepo.find(
      { venda: { $in: ids } },
      { orderBy: { parcelaNumero: 'DESC' }, populate: ['venda'] },
    );
    const lastBySale = new Map<string, Recebimento>();
    for (const r of recs) {
      const saleId = (r.venda as any)?.id ?? (r as any).venda?.id;
      if (saleId && !lastBySale.has(saleId)) lastBySale.set(saleId, r);
    }
    sales.forEach((s) => {
      const last = lastBySale.get(s.id);
      if (last) s.status = this.computeStatusFromRecebimentos([last], s.status);
    });
    return sales;
  }

  async getSale(id: string): Promise<any> {
    const sale = await this.saleRepo.findOne(
      { id },
      {
        populate: ['cliente', 'tipoPagamento', 'itens', 'itens.item', 'itens.item.tipo', 'itens.item.cor', 'itens.item.material'],
      },
    );
    if (!sale) throw new NotFoundException('Venda não encontrada');
    const recebimentos = await this.recebimentoRepo.find(
      { venda: sale },
      { populate: ['tipoPagamento', 'cartaoConta'], orderBy: { parcelaNumero: 'ASC' } },
    );
    const status = this.computeStatusFromRecebimentos(recebimentos, sale.status);
    const recebimentosView = recebimentos.map((r) => {
      const payload: any = { ...r };
      if (!r.dataRecebida || !r.dataPrevista) delete payload.dataPrevista;
      payload.dataRecebida = r.dataRecebida ?? null;
      return payload;
    });
    return { ...sale, status, recebimentos: recebimentosView };
  }

  private isCredit(descricao: string) {
    const name = descricao.toLowerCase();
    const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return name.includes('cred') || normalized.includes('credito');
  }

  private isImmediate(descricao: string) {
    const name = descricao.toLowerCase();
    const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return name.includes('dinheiro') || name.includes('pix') || normalized.includes('pix');
  }

  private computeStatusFromRecebimentos(recebs: Recebimento[], fallback: string) {
    if (!recebs || recebs.length === 0) return fallback;
    const statusDoRec = (r: Recebimento) => {
      if ((r as any).status === 'devolucao') return 'devolucao';
      if (r.status === 'cancelado') return 'cancelado';
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const prevista = r.dataPrevista ? new Date(r.dataPrevista) : null;
      if (prevista) prevista.setHours(0, 0, 0, 0);
      const recebida = r.dataRecebida ? new Date(r.dataRecebida) : null;
      if (recebida) recebida.setHours(0, 0, 0, 0);
      if (!recebida) return 'pendente';
      if (prevista && hoje < prevista) return 'pago';
      return 'recebido';
    };

    const sorted = [...recebs].sort((a, b) => (b.parcelaNumero ?? 0) - (a.parcelaNumero ?? 0));
    const statuses = sorted.map(statusDoRec);
    if (statuses.every((s) => s === 'cancelado')) return 'cancelado';
    if (statuses.includes('devolucao')) return 'devolucao';
    if (statuses.every((s) => s === 'recebido')) return 'recebido';
    const lastStatus = statuses[0] ?? fallback;
    return lastStatus === 'recebido' ? 'pago' : lastStatus;
  }

  private parseDateOnly(dateStr: string) {
    const parsed = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Data invalida');
    }
    return parsed;
  }

  private parseDateWithTimeIfToday(dateStr: string) {
    const todayIso = new Date().toISOString().slice(0, 10);
    if (dateStr === todayIso) {
      return new Date();
    }
    return this.parseDateOnly(dateStr);
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
      if ((r.status === 'previsto' || r.status === 'pago') && r.dataRecebida && r.dataPrevista && this.isDateReached(r.dataPrevista, referencia)) {
        r.status = 'recebido';
        if (!r.dataRecebida) r.dataRecebida = referencia;
      }
    });
  }

  async createSale(dto: CreateSaleDto, userId?: string): Promise<any> {
    if (!dto.itens || dto.itens.length === 0) throw new BadRequestException('Inclua ao menos um item na venda');
    if (dto.parcelas < 1) throw new BadRequestException('Número de parcelas inválido');

    const cliente = await this.customerRepo.findOne({ id: dto.clienteId });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    const tipoPagamento = await this.paymentTypeRepo.findOne({ id: dto.tipoPagamentoId });
    if (!tipoPagamento) throw new NotFoundException('Tipo de pagamento não encontrado');

    const desc = tipoPagamento.descricao?.toLowerCase() ?? '';
    const descNorm = desc.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cardRequired = this.isCredit(desc) || desc.includes('pix') || descNorm.includes('debito');
    if (cardRequired && !dto.cartaoContaId) throw new BadRequestException('Selecione o cartão/conta para esta forma de pagamento');

    const em = this.saleRepo.getEntityManager();
    const dataVenda = this.parseDateWithTimeIfToday(dto.data);
    const sale = this.saleRepo.create({
      data: dataVenda,
      cliente,
      tipoPagamento,
      parcelas: dto.parcelas ?? 1,
      frete: dto.frete ?? 0,
      descontoTotal: dto.descontoTotal ?? 0,
      totalVenda: 0,
      valorLiquido: 0,
      status: 'pendente',
      observacoes: dto.observacoes,
      createdById: userId,
      updatedById: userId,
    });
    em.persist(sale);
    await em.flush();

    let totalItens = 0;
    for (const it of dto.itens) {
      const produto = await this.productRepo.findOne({ id: it.produtoId }, { populate: ['estoque'] });
      if (!produto) throw new NotFoundException('Produto não encontrado');
      if (it.qtde <= 0) throw new BadRequestException('Quantidade deve ser maior que zero');

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
      if (it.qtde > disponivel) throw new BadRequestException(`Estoque insuficiente para o produto ${produto.nome}`);

      const novaQuantidade = disponivel - it.qtde;
      estoque.quantidadeAtual = novaQuantidade;
      estoque.updatedById = userId;
      (estoque as any)._historyMeta = {
        motivo: 'VENDA',
        referencia: sale.id,
        vendaId: sale.id,
        dataMudanca: dataVenda,
        createdById: userId,
      };
      em.persist(estoque);

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
    sale.valorLiquido = totalVenda;
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
      dataRecebimento: dto.pagoAgora ? (dto.dataPagamento ?? dto.data) : undefined,
    });

    if (dto.pagoAgora && recebimentos.length) {
      const dataPag = dto.dataPagamento ? this.parseDateOnly(dto.dataPagamento) : dataVenda;
      const normalizeDate = (d: Date) => {
        const nd = new Date(d);
        nd.setHours(0, 0, 0, 0);
        return nd;
      };
      const hojeRef = new Date();
      const dataPagNorm = normalizeDate(dataPag);
      const offsets = await this.financeiroService.computeOffsetsPreview({
        parcelas: dto.parcelas ?? 1,
        tipoPagamentoId: dto.tipoPagamentoId,
        cartaoContaId: dto.cartaoContaId,
        regraId: dto.regraId,
        usarEscalonadoPadrao: dto.usarEscalonadoPadrao,
        prazoRecebimentoDias: dto.prazoRecebimentoDias,
      });

      recebimentos.forEach((rec, idx) => {
        const offset = offsets[idx] ?? offsets[0] ?? 0;
        const previstaFinal = normalizeDate(new Date(dataPagNorm.getTime()));
        previstaFinal.setDate(previstaFinal.getDate() + offset);
        rec.dataPrevista = previstaFinal;
        rec.dataRecebida = dataPagNorm;
        rec.status = isImmediatePayment || this.isDateReached(previstaFinal, hojeRef) ? 'recebido' : 'pago';
        rec.updatedById = userId;
        em.persist(rec);
      });
      await em.flush();
      this.normalizePagoParaRecebido(recebimentos, dataPagNorm);
      await em.flush();
      sale.status = this.computeStatusFromRecebimentos(recebimentos, sale.status);
      sale.valorLiquido = this.sumRecebimentosLiquido(recebimentos);
      await em.flush();
    } else {
      sale.valorLiquido = this.sumRecebimentosLiquido(recebimentos) || totalVenda;
      await em.flush();
    }

    return this.getSale(sale.id);
  }

  async markSalePaid(id: string, dto: MarkSalePaidDto, userId?: string) {
    const sale = await this.saleRepo.findOne({ id }, { populate: ['itens', 'itens.item', 'tipoPagamento'] });
    if (!sale) throw new NotFoundException('Venda não encontrada');
    const recebimentos = await this.recebimentoRepo.find({ venda: sale }, { populate: ['cartaoConta', 'tipoPagamento'] });
    const dataPagBase = dto.dataPagamento ? this.parseDateOnly(dto.dataPagamento) : new Date();
    const dataPag = this.parseDateOnly(dataPagBase.toISOString().slice(0, 10));
    const dataVenda = sale.data ? this.parseDateOnly(sale.data.toISOString().slice(0, 10)) : null;
    if (dataVenda && dataPag < dataVenda) throw new BadRequestException('Data de pagamento não pode ser anterior à data da venda');

    const normalizeDate = (d: Date) => {
      const nd = new Date(d);
      nd.setHours(0, 0, 0, 0);
      return nd;
    };
    const hojeRef = new Date();
    const dataPagNorm = normalizeDate(dataPag);
    const tipoDesc = sale.tipoPagamento?.descricao?.toLowerCase() ?? '';
    const isPix = tipoDesc.includes('pix');
    let recebimentosAlvo = recebimentos;
    if (isPix && recebimentosAlvo.length === 0) {
      recebimentosAlvo = await this.financeiroService.createRecebimentos({
        vendaId: sale.id,
        tipoPagamentoId: sale.tipoPagamento.id,
        cartaoContaId: undefined,
        regraId: undefined,
        dataVenda: dataPagNorm.toISOString().slice(0, 10),
        parcelas: sale.parcelas,
        valorTotal: sale.totalVenda,
        usarEscalonadoPadrao: false,
        prazoRecebimentoDias: 0,
        dataRecebimento: dataPagNorm.toISOString().slice(0, 10),
      });
    }

    const firstRec = recebimentosAlvo[0];
    const offsets = await this.financeiroService.computeOffsetsPreview({
      parcelas: sale.parcelas ?? 1,
      tipoPagamentoId: sale.tipoPagamento?.id,
      cartaoContaId: (firstRec as any)?.cartaoConta?.id,
      regraId: undefined,
      usarEscalonadoPadrao: undefined,
      prazoRecebimentoDias: undefined,
    });

    recebimentosAlvo.forEach((r, idx) => {
      const offset = offsets[idx] ?? offsets[0] ?? 0;
      const previstaAlvo = normalizeDate(new Date(dataPagNorm.getTime()));
      previstaAlvo.setDate(previstaAlvo.getDate() + offset);
      if (this.isDateReached(previstaAlvo, hojeRef) || isPix) r.status = 'recebido';
      else r.status = 'pago';
      r.dataPrevista = previstaAlvo;
      r.dataRecebida = dataPagNorm;
      r.updatedById = userId;
      this.recebimentoRepo.getEntityManager().persist(r);
    });
    this.normalizePagoParaRecebido(recebimentosAlvo, hojeRef);
    sale.status = isPix ? 'recebido' : this.computeStatusFromRecebimentos(recebimentosAlvo, sale.status);
    sale.valorLiquido = this.sumRecebimentosLiquido(recebimentosAlvo) || sale.totalVenda;
    sale.updatedById = userId;
    const em = this.saleRepo.getEntityManager();
    await em.persistAndFlush(sale);
    await this.recebimentoRepo.getEntityManager().flush();
    return this.getSale(id);
  }

  async cancelSale(id: string, dto: CancelarVendaDto, userId?: string) {
    if (!dto.dataCancelamento || !dto.motivoCancelamento?.trim()) {
      throw new BadRequestException('Informe data e motivo do cancelamento.');
    }
    const sale = await this.saleRepo.findOne({ id }, { populate: ['itens', 'itens.item', 'itens.item.estoque'] });
    if (!sale) throw new NotFoundException('Venda não encontrada');
    if (sale.status === 'cancelada') throw new BadRequestException('Venda já cancelada');

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
      (estoque as any)._historyMeta = {
        motivo: 'CANCELAMENTO_VENDA',
        referencia: sale.id,
        vendaId: sale.id,
        dataMudanca: this.parseDateWithTimeIfToday(dto.dataCancelamento),
        createdById: userId,
      };
      em.persist(estoque);
    }

    const recebimentos = await this.recebimentoRepo.find({ venda: sale });
    recebimentos.forEach((r) => {
      r.status = 'cancelado';
      r.updatedById = userId;
      this.recebimentoRepo.getEntityManager().persist(r);
    });

    sale.status = 'cancelada';
    sale.dataCancelamento = this.parseDateWithTimeIfToday(dto.dataCancelamento);
    sale.motivoCancelamento = dto.motivoCancelamento || null;
    sale.updatedById = userId;
    await em.flush();
    return this.getSale(id);
  }

  async devolverSale(id: string, dto: DevolverVendaDto, userId?: string) {
    const sale = await this.saleRepo.findOne({ id }, { populate: ['itens', 'itens.item', 'itens.item.estoque', 'tipoPagamento'] });
    if (!sale) throw new NotFoundException('Venda não encontrada');
    const statusLower = (sale.status || '').toLowerCase();
    if (!['paga', 'pago', 'recebido'].includes(statusLower)) {
      throw new BadRequestException('Devolução permitida apenas para vendas pagas ou recebidas');
    }

    const em = this.saleRepo.getEntityManager();
    const dataDev = dto.dataDevolucao ? this.parseDateWithTimeIfToday(dto.dataDevolucao) : new Date();

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

      const history = new ProductStockHistory();
      history.produto = produto;
      history.quantidadeAnterior = anterior;
      history.quantidadeNova = nova;
      const diff = nova - anterior;
      history.quantidadeAdicionada = diff > 0 ? diff : 0;
      history.quantidadeSubtraida = diff < 0 ? Math.abs(diff) : 0;
      history.motivo = 'DEVOLUCAO_VENDA';
      history.referencia = `Venda ${sale.id}`;
      history.vendaId = sale.id;
      history.dataMudanca = dataDev;
      history.createdById = userId;
      em.persist(history);
    }

    const recebimentos = await this.recebimentoRepo.find({ venda: sale });
    recebimentos.forEach((r) => {
      (r as any).status = 'devolucao';
      r.updatedById = userId;
      this.recebimentoRepo.getEntityManager().persist(r);
    });

    sale.status = 'devolucao';
    sale.dataDevolucao = dataDev;
    sale.motivoDevolucao = dto.motivo || null;
    sale.updatedById = userId;
    await em.flush();
    return this.getSale(id);
  }

  async updateSalePayment(id: string, dto: UpdateSalePaymentDto, userId?: string) {
    const sale = await this.saleRepo.findOne({ id }, { populate: ['itens', 'cliente', 'tipoPagamento'] });
    if (!sale) throw new NotFoundException('Venda não encontrada');
    if (sale.status === 'paga') throw new BadRequestException('Não é possível alterar pagamento de venda paga');

    const tipoPagamento = await this.paymentTypeRepo.findOne({ id: dto.tipoPagamentoId });
    if (!tipoPagamento) throw new NotFoundException('Tipo de pagamento não encontrado');
    const cartao = dto.cartaoContaId ? await this.cardAccountRepo.findOne({ id: dto.cartaoContaId }) : undefined;
    const cardRequired = this.isCredit(tipoPagamento.descricao) || tipoPagamento.descricao.toLowerCase().includes('pix') || tipoPagamento.descricao.toLowerCase().includes('deb');
    if (cardRequired && !cartao) throw new BadRequestException('Selecione um cartao/conta para este pagamento');

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
      dataRecebimento: dto.pagoAgora ? (dto.dataPagamento ?? sale.data.toISOString().slice(0, 10)) : undefined,
    });

    if (dto.pagoAgora) {
      const dataPag = dto.dataPagamento ? this.parseDateOnly(dto.dataPagamento) : new Date();
      const normalizeDate = (d: Date) => {
        const nd = new Date(d);
        nd.setHours(0, 0, 0, 0);
        return nd;
      };
      const hojeRef = new Date();
      const dataPagNorm = normalizeDate(dataPag);
      const offsets = await this.financeiroService.computeOffsetsPreview({
        parcelas: dto.parcelas ?? 1,
        tipoPagamentoId: dto.tipoPagamentoId,
        cartaoContaId: dto.cartaoContaId,
        regraId: dto.regraId,
        usarEscalonadoPadrao: dto.usarEscalonadoPadrao,
        prazoRecebimentoDias: dto.prazoRecebimentoDias,
      });
      recebimentosNovos.forEach((rec) => {
        const idx = (rec.parcelaNumero ?? 1) - 1;
        const offset = offsets[idx] ?? offsets[0] ?? 0;
        const previstaFinal = normalizeDate(new Date(dataPagNorm.getTime()));
        previstaFinal.setDate(previstaFinal.getDate() + offset);
        rec.dataPrevista = previstaFinal;
        rec.dataRecebida = dataPagNorm;
        rec.status = isImmediatePayment || this.isDateReached(previstaFinal, hojeRef) ? 'recebido' : 'pago';
        rec.updatedById = userId;
        this.recebimentoRepo.getEntityManager().persist(rec);
      });
      await this.recebimentoRepo.getEntityManager().flush();
      this.normalizePagoParaRecebido(recebimentosNovos, hojeRef);
      await this.recebimentoRepo.getEntityManager().flush();
      sale.status = this.computeStatusFromRecebimentos(recebimentosNovos, sale.status);
      sale.valorLiquido = this.sumRecebimentosLiquido(recebimentosNovos) || sale.totalVenda;
      await this.saleRepo.getEntityManager().persistAndFlush(sale);
    }
    sale.valorLiquido = this.sumRecebimentosLiquido(recebimentosNovos) || sale.totalVenda;
    await this.saleRepo.getEntityManager().persistAndFlush(sale);

    return this.getSale(id);
  }
}
