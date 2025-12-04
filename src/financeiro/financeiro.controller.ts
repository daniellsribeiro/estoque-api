import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCardAccountDto } from './dto/create-card-account.dto';
import { CreateCardInvoicePaymentDto } from './dto/create-card-invoice-payment.dto';
import { CreateCardPaymentRuleDto } from './dto/create-card-payment-rule.dto';
import { CreatePaymentTypeDto } from './dto/create-payment-type.dto';
import { CreateRecebimentoDto } from './dto/create-recebimento.dto';
import { UpdateRecebimentoDto } from './dto/update-recebimento.dto';
import { FinanceiroService } from './financeiro.service';

@Controller('financeiro')
@UseGuards(JwtAuthGuard)
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post('tipos-pagamento')
  createPaymentType(
    @Body() dto: CreatePaymentTypeDto,
    @CurrentUser() user: any,
  ) {
    return this.financeiroService.createPaymentType(dto, user?.id);
  }

  @Get('tipos-pagamento')
  listPaymentTypes() {
    return this.financeiroService.listPaymentTypes();
  }

  @Post('cartoes-contas')
  createCardAccount(
    @Body() dto: CreateCardAccountDto,
    @CurrentUser() user: any,
  ) {
    return this.financeiroService.createCardAccount(dto, user?.id);
  }

  @Get('cartoes-contas')
  listCardAccounts() {
    return this.financeiroService.listCardAccounts();
  }

  @Patch('cartoes-contas/:id')
  updateCardAccount(
    @Param('id') id: string,
    @Body() dto: CreateCardAccountDto,
    @CurrentUser() user: any,
  ) {
    return this.financeiroService.updateCardAccount(id, dto, user?.id);
  }

  @Post('cartoes-contas/regras')
  saveCardRule(
    @Body() dto: CreateCardPaymentRuleDto,
    @CurrentUser() user: any,
  ) {
    return this.financeiroService.saveCardRule(dto, user?.id);
  }

  @Get('cartoes-contas/:id/regras')
  listCardRules(@Param('id') id: string) {
    return this.financeiroService.listCardRules(id);
  }

  @Post('cartoes-contas/pagamentos')
  registerCardInvoicePayment(
    @Body() dto: CreateCardInvoicePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.financeiroService.registerCardInvoicePayment(dto, user?.id);
  }

  @Post('recebimentos')
  createRecebimentos(
    @Body() dto: CreateRecebimentoDto,
    @CurrentUser() user: any,
  ) {
    return this.financeiroService.createRecebimentos(dto, user?.id);
  }

  @Get('recebimentos')
  listRecebimentos() {
    return this.financeiroService.listRecebimentos();
  }

  @Post('recebimentos/:id')
  updateRecebimento(
    @Param('id') id: string,
    @Body() dto: UpdateRecebimentoDto,
    @CurrentUser() user: any,
  ) {
    return this.financeiroService.updateRecebimento(id, dto, user?.id);
  }

  @Get('caixa')
  caixaResumo() {
    return this.financeiroService.caixaResumo();
  }
}
