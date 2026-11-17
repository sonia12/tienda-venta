import { Transform } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import { ValidRoles } from "../enums/valid-roles.enum";
import { CreateUserDTo } from "./create-user.dto";

export class CreateEmployeeDto extends CreateUserDTo{

}