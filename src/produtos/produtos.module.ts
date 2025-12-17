import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProductColor } from './entities/product-color.entity';
import { ProductDiscount } from './entities/product-discount.entity';
import { ProductMaterial } from './entities/product-material.entity';
import { ProductPriceHistory } from './entities/product-price-history.entity';
import { ProductPrice } from './entities/product-price.entity';
import { ProductSize } from './entities/product-size.entity';
import { ProductStockHistory } from './entities/product-stock-history.entity';
import { ProductStock } from './entities/product-stock.entity';
import { ProductType } from './entities/product-type.entity';
import { Product } from './entities/product.entity';
import { Supplier } from './entities/supplier.entity';
import { Customer } from './entities/customer.entity';
import { PurchaseItem } from '../compras/entities/purchase-item.entity';
import { Purchase } from '../compras/entities/purchase.entity';
import { SaleItem } from '../vendas/entities/sale-item.entity';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';
import { PreferencesModule } from '../preferences/preferences.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Product,
      ProductType,
      ProductColor,
      ProductMaterial,
      ProductSize,
      ProductStock,
      ProductStockHistory,
      ProductPrice,
      ProductPriceHistory,
      ProductDiscount,
      Supplier,
      Customer,
      PurchaseItem,
      Purchase,
      SaleItem,
    ]),
    PreferencesModule,
  ],
  controllers: [ProdutosController],
  providers: [ProdutosService],
  exports: [MikroOrmModule, ProdutosService],
})
export class ProdutosModule {}
