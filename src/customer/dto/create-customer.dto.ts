import { IsOptional, IsString, MinLength } from "class-validator"

export class CreateCustomerDto {

    @IsString()
    @MinLength(1)
    name!: string

    @IsString()
    @MinLength(1)
    @IsOptional()
    phone?: string
}
