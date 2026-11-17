import { Transform, Type } from "class-transformer"
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsUUID, Min } from "class-validator"

export class CreateOrderDetailDto {
    

    @IsOptional()
    @Transform(({ value }) => (value === undefined || value === null || value === '' ? 1 : value)) 
    @Type(() => Number)
    @IsInt({ message: 'La cantidad debe ser un número entero' })
    @Min(1, { message: 'La cantidad mínima debe ser 1' })
    quantity!: number
    
    @IsNumber()
    @IsOptional()
    discount?: number

    @IsUUID()
    @IsNotEmpty()
    id_product!: string

    
}
