import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ComprasService } from './compras.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchasePaymentDto } from './dto/update-purchase-payment.dto';

@Controller('compras')
@UseGuards(JwtAuthGuard)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Get()
  listPurchases() {
    return this.comprasService.listPurchases();
  }

  @Post()
  createPurchase(@Body() dto: CreatePurchaseDto, @CurrentUser() user: any) {
    return this.comprasService.createPurchase(dto, user?.id);
  }

  @Get('pagamentos')
  listPayments() {
    return this.comprasService.listPayments();
  }

  @Patch('pagamentos/:id')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePurchasePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.comprasService.updatePaymentStatus(id, dto, user?.id);
  }
}
