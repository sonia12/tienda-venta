import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../../entities/user.entity';
import { META_ROLES } from '../../decorators/roles-protected/roles-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector   // reflector ayuda a ver la inf de la data
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles:string[]= this.reflector.getAllAndOverride<string[]>(META_ROLES, [context.getHandler(),context.getClass(),])   //agarrar valid rol

    
    if ( !validRoles ) return true;
    if ( validRoles.length === 0 ) return true;

     const req = context.switchToHttp().getRequest();
     const user = req.user as User;

     if ( !user ) 
      throw new BadRequestException('User not found');

    for (const role of user.roles) {
      if ( validRoles.includes( role ) ) {
        return true;
      }
    }

    throw new ForbiddenException(
      `UnAuthorized`
    );
    
    return true;
  }
}
