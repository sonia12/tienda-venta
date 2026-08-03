import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from './customer/customer.module';
import { EmployeeModule } from './employee/employee.module';
import { OrderModule } from './order/order.module';
import { OrderDetailModule } from './order_detail/order_detail.module';
import { SupplierModule } from './supplier/supplier.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'sonia',
      password: '123456',
      database: 'tienda-db',
      autoLoadEntities: true,
      synchronize: false,
    }),
    CustomerModule,
    EmployeeModule,
    OrderModule,
    OrderDetailModule,
    SupplierModule,
    ProductModule,
    CategoryModule,
    
  ],
  
})
export class AppModule {}
