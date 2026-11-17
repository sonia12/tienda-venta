import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDTo } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDTo) {


}
