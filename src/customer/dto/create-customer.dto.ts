import { IsEmail, IsOptional, IsString, MinLength } from "class-validator"

export class CreateCustomerDto {

    @IsString()
    @MinLength(1)
    @IsOptional()
    name?: string

    @IsOptional()
    @IsEmail({}, { message: 'El formato de correo no es válido' })
    email?: string;

    @IsString()
    @MinLength(1)
    @IsOptional()
    phone?: string

    @IsString()
    @IsOptional()
    @MinLength(5, { message: 'El CI debe tener al menos 5 caracteres' })
    ci?: string
}
