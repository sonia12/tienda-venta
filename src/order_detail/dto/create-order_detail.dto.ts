import { IsInt, IsNumber, IsPositive, Min } from "class-validator"

export class CreateOrderDetailDto {
    
    @IsNumber()
    @IsPositive()
    unit_price!:number

    @IsNumber()
    @IsPositive()
    unit_cost!: number

    @IsInt()
    @IsPositive()
    quantity!: number
    
    @IsNumber()
    @Min(0)
    discount?: number

    @IsInt()
    @IsPositive()
    id_product!: number

    @IsInt()
    @IsPositive()
    id_order!: number
}
