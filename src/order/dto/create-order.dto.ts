import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsPositive, IsUUID, Min } from "class-validator";
import { orders_status } from '../entities/order.entity'

export class CreateOrderDto {
    
    @IsUUID() 
    @IsNotEmpty()
    id_customer!: string

    @IsUUID() 
    @IsNotEmpty()
    id_employee!: string

    @IsNumber() 
    @IsPositive()
    @Min(0)
    @IsNotEmpty()
    total_amount!: number

    @IsEnum(orders_status) 
    @IsNotEmpty()
    status!: orders_status
}
