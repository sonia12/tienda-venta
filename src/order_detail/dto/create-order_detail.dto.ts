import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsUUID, Min } from "class-validator"

export class CreateOrderDetailDto {
    
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    unit_price!:number

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    unit_cost!: number

    @IsInt()
    @IsPositive()
    @Min(1)
    @IsNotEmpty()
    quantity!: number
    
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    discount?: number

    @IsUUID()
    @IsNotEmpty()
    id_product!: string

    @IsUUID()
    @IsNotEmpty()
    id_order!: string
}
