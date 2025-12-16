import { Body, Controller, Get, Param, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSalePaymentDto } from './dto/update-sale-payment.dto';
import { MarkSalePaidDto } from './dto/mark-sale-paid.dto';
import { VendasService } from './vendas.service';
import { SaleFilterDto } from './dto/sale-filter.dto';

@Controller('vendas')
@UseGuards(JwtAuthGuard)
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Get()
  listSales(@Query() query: SaleFilterDto): Promise<any> {
    return this.vendasService.listSales(query);
  }

  @Get(':id')
  getSale(@Param('id') id: string): Promise<any> {
    return this.vendasService.getSale(id);
  }

  @Post()
  createSale(@Body() dto: CreateSaleDto, @CurrentUser() user: any): Promise<any> {
    return this.vendasService.createSale(dto, user?.id);
  }

  @Patch(':id/pagar')
  markPaid(@Param('id') id: string, @Body() dto: MarkSalePaidDto, @CurrentUser() user: any) {
    return this.vendasService.markSalePaid(id, dto, user?.id);
  }

  @Patch(':id/cancelar')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vendasService.cancelSale(id, user?.id);
  }

  @Patch(':id/pagamento')
  updatePayment(@Param('id') id: string, @Body() dto: UpdateSalePaymentDto, @CurrentUser() user: any) {
    return this.vendasService.updateSalePayment(id, dto, user?.id);
  }
}
