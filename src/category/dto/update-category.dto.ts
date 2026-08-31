import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class UpdateCategoryDto {
        @IsString()
        @MinLength(1)
        @IsOptional()
        name?: string
    
        @IsString()
        @MinLength(1)
        @IsOptional()
        description?: string 
}
