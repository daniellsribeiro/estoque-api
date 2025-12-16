import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinanceiroService } from './financeiro.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseFilterDto } from './dto/expense-filter.dto';

@Controller('gastos')
@UseGuards(JwtAuthGuard)
export class GastosController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Get()
  list(@Query() query: ExpenseFilterDto) {
    return this.financeiroService.listExpenses(query);
  }

  @Get('pagamentos')
  listPagamentos(@Query() query: ExpenseFilterDto) {
    return this.financeiroService.listExpensePayments(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.financeiroService.getExpense(id);
  }

  @Get(':id/pagamentos')
  getPayments(@Param('id') id: string) {
    return this.financeiroService.listExpensePayments({ gastoId: id });
  }

  @Post()
  create(@Body() dto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.financeiroService.createExpense(dto, user?.id);
  }
}
