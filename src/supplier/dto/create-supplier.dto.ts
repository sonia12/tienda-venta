import { IsOptional, IsString, MinLength } from "class-validator"

export class CreateSupplierDto {
    @IsString()
    @MinLength(1)
    name!: string

    @IsOptional()
    @IsString()
    @MinLength(1)
    address!: string

    @IsOptional()
    @IsString()
    @MinLength(1)
    city!: string

    @IsString()
    @MinLength(1)
    phone!: string
}
