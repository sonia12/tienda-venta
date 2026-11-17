import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min } from "class-validator";
import { orders_status } from '../entities/order.entity'

export class CreateOrderDto {
    
  @IsOptional()
  @IsString()
  ci?: string;

    
}
