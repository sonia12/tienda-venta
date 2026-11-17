import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';

import { AuthModule } from '../auth/auth.module';
import { Product } from '../product/entities/product.entity';

@Module({

  imports:[TypeOrmModule.forFeature([Order, Customer,  Product]), AuthModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
