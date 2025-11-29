import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PaymentType } from '../financeiro/entities/payment-type.entity';
import { Product } from '../produtos/entities/product.entity';
import { Customer } from '../produtos/entities/customer.entity';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { StockReduction } from './entities/stock-reduction.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Sale,
      SaleItem,
      StockReduction,
      Product,
      Customer,
      PaymentType,
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [MikroOrmModule],
})
export class VendasModule {}
