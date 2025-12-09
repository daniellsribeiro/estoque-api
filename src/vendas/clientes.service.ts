import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Customer } from '../produtos/entities/customer.entity';
import { CreateCustomerDto } from '../produtos/dto/create-customer.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: EntityRepository<Customer>,
  ) {}

  async listCustomers() {
    return this.customerRepo.findAll();
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
}
