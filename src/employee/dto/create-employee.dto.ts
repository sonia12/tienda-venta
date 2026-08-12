import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateEmployeeDto {

    @IsString()
    @MinLength(1)
    name!: string

    @IsString()
    @MinLength(1)
    @IsOptional()
    lastnaame!: string

    @IsString()
    @MinLength(1)
    title!: string


    @IsString()
    @MinLength(1)
    @IsOptional()
    adress!: string

    @IsString()
    @MinLength(1)
    phone!: string

    @IsInt()
    @IsPositive()
    @IsOptional()
    report_to!: number

}
