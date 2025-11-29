import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PaymentType } from '../financeiro/entities/payment-type.entity';
import { Product } from '../produtos/entities/product.entity';
import { Supplier } from '../produtos/entities/supplier.entity';
import { CardAccount } from '../financeiro/entities/card-account.entity';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { PurchasePayment } from './entities/purchase-payment.entity';
import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Purchase,
      PurchaseItem,
      PurchasePayment,
      Supplier,
      PaymentType,
      Product,
      CardAccount,
    ]),
  ],
  controllers: [ComprasController],
  providers: [ComprasService],
  exports: [MikroOrmModule, ComprasService],
})
export class ComprasModule {}
