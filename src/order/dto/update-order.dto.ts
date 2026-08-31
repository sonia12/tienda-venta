import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateOrderDto {

        @IsInt()
        @IsPositive()
        @IsOptional()
        id_customer?: number
    
        @IsInt()
        @IsPositive()
        @IsOptional()
        id_employee?: number
}
