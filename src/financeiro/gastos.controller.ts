import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinanceiroService } from './financeiro.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller('gastos')
@UseGuards(JwtAuthGuard)
export class GastosController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Get()
  list() {
    return this.financeiroService.listExpenses();
  }

  @Get('pagamentos')
  listPagamentos() {
    return this.financeiroService.listExpensePayments();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.financeiroService.getExpense(id);
  }

  @Post()
  create(@Body() dto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.financeiroService.createExpense(dto, user?.id);
  }
}
