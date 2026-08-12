import { IsInt, IsPositive } from "class-validator";

export class CreateOrderDto {
    
    @IsInt()
    @IsPositive()
    id_customer!: number

    @IsInt()
    @IsPositive()
    id_employee!: number
}
