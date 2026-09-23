import { IsNotEmpty, IsOptional, IsString, Length, MinLength } from "class-validator"

export class CreateSupplierDto {
    @IsString()
    @Length(1,100)
    @IsNotEmpty()
    name!: string

    @IsOptional()
    @IsString()
    @Length(1,200)
    address?: string

    @IsOptional()
    @IsString()
    @Length(1,50)
    city?: string

    @IsString()
    @Length(1,15)
    phone!: string
}
