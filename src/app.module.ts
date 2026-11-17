import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from './customer/customer.module';

import { OrderModule } from './order/order.module';
import { OrderDetailModule } from './order_detail/order_detail.module';
import { SupplierModule } from './supplier/supplier.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // para que config se global y lo podamos usar en todos 
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'sonia',
      password: '123456',
      database: 'tienda-db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    CustomerModule,
    
    OrderModule,
    OrderDetailModule,
    SupplierModule,
    ProductModule,
    CategoryModule,
    CommonModule,
    AuthModule,
    
  ],
  
})
export class AppModule {}
