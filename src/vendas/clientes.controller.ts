import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateCustomerDto } from '../produtos/dto/create-customer.dto';
import { ClientesService } from './clientes.service';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  listCustomers() {
    return this.clientesService.listCustomers();
  }

  @Post()
  createCustomer(@Body() dto: CreateCustomerDto, @CurrentUser() user: any) {
    return this.clientesService.createCustomer(dto, user?.id);
  }
}
