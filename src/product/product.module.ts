import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Supplier]), AuthModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
