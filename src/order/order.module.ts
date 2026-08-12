import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Employee } from '../employee/entities/employee.entity';

@Module({

  imports:[TypeOrmModule.forFeature([Order, Customer, Employee])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
