import { IsInt, IsNumber, isNumber, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @IsString()
    @MinLength(1)
    name!: string

    @IsNumber()
    @IsPositive()
    unit_cost!: number

    @IsNumber()
    @IsPositive()
    unit_price!: number

    @IsInt()
    @IsPositive()
    unit_stock!: number

    @IsInt()
    @IsPositive()
    quantity_per_unit!: number

    @IsInt()
    @IsPositive()
    id_category!: number

    @IsInt()
    @IsPositive()
    id_supplier!: number


}
