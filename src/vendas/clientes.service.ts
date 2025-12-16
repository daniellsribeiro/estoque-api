import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Customer } from '../produtos/entities/customer.entity';
import { CreateCustomerDto } from '../produtos/dto/create-customer.dto';
import { Sale } from './entities/sale.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: EntityRepository<Customer>,
    @InjectRepository(Sale)
    private readonly saleRepo: EntityRepository<Sale>,
  ) {}

  async listCustomers(filters: { nome?: string; page?: string; limit?: string } = {}) {
    const page = Math.max(parseInt(filters.page || '1', 10) || 1, 1);
    const limitParsed = parseInt(filters.limit || '20', 10);
    const perPage = Math.min(Math.max(limitParsed || 20, 5), 100);
    const offset = (page - 1) * perPage;

    // Raw query to avoid virtual property errors when ordering by sales_count
    const knex = this.customerRepo.getKnex();
    const query = knex
      .select('c.*')
      .select(
        knex.raw('(select count(*) from vendas v where v.cliente_id = c.id) as sales_count'),
      )
      .from({ c: 'clientes' });

    if (filters.nome) {
      query.whereRaw('lower(c.nome) like ?', [`%${filters.nome.toLowerCase()}%`]);
    }

    const rows = await query
      .orderByRaw('sales_count DESC, c.created_at DESC')
      .limit(perPage)
      .offset(offset);

    return rows as any[];
  }

  async createCustomer(dto: CreateCustomerDto, userId?: string) {
    const customer = this.customerRepo.create({
      ...dto,
      createdById: userId,
      updatedById: userId,
    });
    await this.customerRepo.getEntityManager().persistAndFlush(customer);
    return customer;
  }

  async listCustomerSales(customerId: string) {
    const sales = await this.saleRepo.find(
      { cliente: customerId },
      { populate: ['tipoPagamento', 'cliente'], orderBy: { data: 'DESC' } },
    );
    return sales;
  }
}
