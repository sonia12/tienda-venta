import { Transform } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import { ValidRoles } from "../enums/valid-roles.enum";


export class CreateSetupAdminDto{
    
    @IsString()
    @IsEmail()
    @Transform(({ value }) => value?.trim().toLowerCase())
    email!: string
    
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and a number'})
    password!: string
    
    @IsString()
    @MinLength(1)
    @Transform(({ value }) => value?.trim().toLowerCase())
    fullname!: string
    
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    @IsOptional()
    address?: string
        
    @IsString()
    @MinLength(1)
    @MaxLength(15)
    @IsOptional()
    phone?: string
        
   
        
    
}