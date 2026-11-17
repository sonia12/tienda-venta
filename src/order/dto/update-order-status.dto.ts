import { IsEnum, IsNotEmpty } from "class-validator";
import { orders_status } from "../entities/order.entity";

export class UpdateOrderStatusDto{

    @IsEnum(orders_status) 
    @IsNotEmpty()
    status!: orders_status

}

    