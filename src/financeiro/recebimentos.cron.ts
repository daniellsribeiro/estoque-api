import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Recebimento } from './entities/recebimento.entity';
import { Sale } from '../vendas/entities/sale.entity';

@Injectable()
export class RecebimentosCron {
  constructor(
    @InjectRepository(Recebimento)
    private readonly recebimentoRepo: EntityRepository<Recebimento>,
    @InjectRepository(Sale)
    private readonly saleRepo: EntityRepository<Sale>,
  ) {}

  // Executa a cada hora; ajuste se precisar
  @Cron(CronExpression.EVERY_MINUTE)
  async atualizarRecebidosPorData() {
    const em = this.recebimentoRepo.getEntityManager().fork();
    const agora = new Date();
    const pagos = await em.find(Recebimento, { status: 'previsto', dataRecebida: { $ne: null } });
    const vendasAfetadas = new Set<string>();
    pagos.forEach((r) => {
      if (!r.dataPrevista) return;
      if (!this.isDateReached(r.dataPrevista, agora)) return;
      r.status = 'recebido';
      r.dataRecebida = r.dataRecebida ?? agora;
      em.persist(r);
      const vendaId = (r.venda as any)?.id ?? (r as any).venda?.id;
      if (vendaId) vendasAfetadas.add(vendaId);
    });
    await em.flush();

    if (vendasAfetadas.size > 0) {
      const vendas = await em.find(Sale, { id: { $in: Array.from(vendasAfetadas) } });
      for (const venda of vendas) {
        const recs = await em.find(Recebimento, { venda }, { orderBy: { parcelaNumero: 'DESC' } });
        const last = recs[0];
        if (!last) continue;
        let novoStatus = venda.status;
        if (last.status === 'cancelado') {
          novoStatus = 'cancelado';
        } else if (last.status === 'recebido') {
          novoStatus = 'recebido';
        } else if (last.status === 'previsto') {
          if (last.dataRecebida && last.dataPrevista && this.isDateReached(last.dataPrevista, agora)) {
            last.status = 'recebido';
            last.dataRecebida = last.dataRecebida ?? agora;
            em.persist(last);
            novoStatus = 'recebido';
          } else if (last.dataRecebida) {
            novoStatus = 'paga';
          } else {
            novoStatus = 'pendente';
          }
        } else {
          novoStatus = 'pendente';
        }
        if (novoStatus !== venda.status) {
          venda.status = novoStatus;
          em.persist(venda);
        }
      }
      await em.flush();
    }
  }

  private isDateReached(prevista: Date, referencia: Date) {
    const p = new Date(prevista);
    const r = new Date(referencia);
    p.setHours(0, 0, 0, 0);
    r.setHours(0, 0, 0, 0);
    return r.getTime() >= p.getTime();
  }
}
