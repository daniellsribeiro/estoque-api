import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PurchasePayment } from '../compras/entities/purchase-payment.entity';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';
import { CardAccount } from './entities/card-account.entity';
import { CardInvoicePayment } from './entities/card-invoice-payment.entity';
import { ExpenseItem } from './entities/expense-item.entity';
import { ExpensePayment } from './entities/expense-payment.entity';
import { Expense } from './entities/expense.entity';
import { PaymentType } from './entities/payment-type.entity';
import { CardPaymentRule } from './entities/card-payment-rule.entity';
import { Recebimento } from './entities/recebimento.entity';
import { Sale } from '../vendas/entities/sale.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      PaymentType,
      CardAccount,
      CardPaymentRule,
      CardInvoicePayment,
      Expense,
      ExpenseItem,
      ExpensePayment,
      PurchasePayment,
      Recebimento,
      Sale,
    ]),
  ],
  controllers: [FinanceiroController],
  providers: [FinanceiroService],
  exports: [MikroOrmModule, FinanceiroService],
})
export class FinanceiroModule {}
