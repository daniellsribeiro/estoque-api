import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from 'mikro-orm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProdutosModule } from './produtos/produtos.module';
import { ComprasModule } from './compras/compras.module';
import { VendasModule } from './vendas/vendas.module';
import { FinanceiroModule } from './financeiro/financeiro.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    UsersModule,
    AuthModule,
    ProdutosModule,
    ComprasModule,
    VendasModule,
    FinanceiroModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
