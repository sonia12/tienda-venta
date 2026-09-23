import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateEmployeeDto {

    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string

    @IsString()
    @MinLength(1)
    @MaxLength(100)
    lastname!: string

    @IsString()
    @MinLength(1)
    @MaxLength(500)
    @IsOptional()
    title!: string

    @IsString()
    @MinLength(1)
    @MaxLength(100)
    @IsOptional()
    address?: string

    @IsString()
    @MinLength(1)
    @MaxLength(15)
    @IsOptional()
    phone!: string

    
    @IsUUID()
    @IsOptional()
    report_to?: string

}
