import { IsInt, IsNotEmpty, IsNumber, isNumber, IsPositive, IsString, IsUUID, Length, Min, MinLength } from "class-validator";

export class CreateProductDto {

    @IsString()
    @Length(1,100)
    @IsNotEmpty()
    name!: string

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    unit_cost!: number

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    unit_price!: number

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    @Min(0)
    unit_stock!: number

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    @Min(1)
    quantity_per_unit!: number

    @IsUUID() 
    @IsNotEmpty()
    id_category!: string

    @IsUUID() 
    @IsNotEmpty()
    id_supplier!: string


}
