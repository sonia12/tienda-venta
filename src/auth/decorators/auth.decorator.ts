import { applyDecorators, UseGuards } from "@nestjs/common";
import { ValidRoles } from "../enums/valid-roles.enum";
import { AuthGuard } from "@nestjs/passport";
import { UserRoleGuard } from "../guards/user-role/user-role.guard";
import { RolesProtected } from "./roles-protected/roles-protected.decorator";

export function Auth(...roles: ValidRoles[]) {

  return applyDecorators(
    RolesProtected(...roles),
    UseGuards( AuthGuard(), UserRoleGuard ),
  );

}