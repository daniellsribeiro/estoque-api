import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PaymentType } from '../financeiro/entities/payment-type.entity';
import { Recebimento } from '../financeiro/entities/recebimento.entity';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { CardAccount } from '../financeiro/entities/card-account.entity';
import { Product } from '../produtos/entities/product.entity';
import { ProductStock } from '../produtos/entities/product-stock.entity';
import { ProductStockHistory } from '../produtos/entities/product-stock-history.entity';
import { Customer } from '../produtos/entities/customer.entity';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { StockReduction } from './entities/stock-reduction.entity';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { VendasController } from './vendas.controller';
import { VendasService } from './vendas.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Sale,
      SaleItem,
      StockReduction,
      Product,
      Customer,
      PaymentType,
      ProductStock,
      ProductStockHistory,
      Recebimento,
      CardAccount,
    ]),
    FinanceiroModule,
  ],
  controllers: [ClientesController, VendasController],
  providers: [ClientesService, VendasService],
  exports: [MikroOrmModule],
})
export class VendasModule {}
