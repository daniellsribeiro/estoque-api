import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateCustomerDto } from '../produtos/dto/create-customer.dto';
import { ClientesService } from './clientes.service';
import { CustomerFilterDto } from './dto/customer-filter.dto';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  listCustomers(@Query() query: CustomerFilterDto) {
    return this.clientesService.listCustomers(query);
  }

  @Post()
  createCustomer(@Body() dto: CreateCustomerDto, @CurrentUser() user: any) {
    return this.clientesService.createCustomer(dto, user?.id);
  }

  @Get(':id/vendas')
  listCustomerSales(@Param('id') id: string) {
    return this.clientesService.listCustomerSales(id);
  }
}
