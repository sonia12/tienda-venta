import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsPositive, Min } from "class-validator";

export class IncrementStockDto {
    
  @IsInt({ message: 'La cantidad a sumar debe ser un número entero' })
  @Min(1, { message: 'Debe agregar al menos 1 unidad al stock' })
  @Type(() => Number)
  @IsNotEmpty()
  stockToAdd!: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  quantity_per_unit_add?: number

}