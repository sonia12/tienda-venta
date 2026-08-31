import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
        @IsString()
        @MinLength(1)
        @IsOptional()
        name?: string
    
         @IsNumber()
         @IsPositive()
         @IsOptional()
         unit_cost?: number
        
         @IsNumber()
         @IsPositive()
         @IsOptional()
         unit_price?: number
        
         @IsInt()
         @IsPositive()
         @IsOptional()
         unit_stock?: number
        
         @IsInt()
         @IsPositive()
         @IsOptional()
         quantity_per_unit?: number
        
         @IsInt()
         @IsPositive()
         @IsOptional()
         id_category?: number
        
         @IsInt()
         @IsPositive()
         @IsOptional()
         id_supplier?: number

    
}
