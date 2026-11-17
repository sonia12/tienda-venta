import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class UpdateProductDto extends PartialType(
    OmitType(CreateProductDto,['unit_stock'] )) {
    
        @IsBoolean()
        @IsOptional()
        isActive?: boolean;
    
}
