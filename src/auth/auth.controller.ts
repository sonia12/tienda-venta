import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ParseUUIDPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTo } from './dto/create-user.dto';

import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user-decorator';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RolesProtected } from './decorators/roles-protected/roles-protected.decorator';
import { ValidRoles } from './enums/valid-roles.enum';
import { Auth } from './decorators/auth.decorator';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateSetupAdminDto,  } from './dto/create-setup-admin.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto ){
    return this.authService.login(loginUserDto)
  }


  @Post('setup')
  async setupInitialAdmin(@Body() createSetupAdminDto: CreateSetupAdminDto) {
    return this.authService.createInitialAdmin(createSetupAdminDto);
  }

  @Post('admin')
  @Auth( ValidRoles.Owner)
  createAdmin(@Body() createuserDto: CreateUserDTo, @GetUser() user:User ){
    return this.authService.create(createuserDto, user)
  }

  @Post('employee')
  @Auth(ValidRoles.Admin, ValidRoles.Owner)
  createEmp(@Body() createEmployeeDto: CreateEmployeeDto,@GetUser() user:User ){
    return this.authService.createEmployee(createEmployeeDto, user)
  }


  


  @Get()
  @Auth(ValidRoles.Owner, ValidRoles.Admin)
  findAll(@Query() paginationDto:PaginationDto, @GetUser() user:User) {
    return this.authService.findAll(paginationDto, user);
    }
  
  

  @Patch(':id')
  @Auth(ValidRoles.Admin)
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
      return this.authService.update(id, updateUserDto);
    }
  
    //desactive user
  @Patch(':id/desactivate')
  @Auth(ValidRoles.Admin, ValidRoles.Owner) // Solo pueden entrar Admins y Owners
    deactivateUser(
      @Param('id') id: string,
      @GetUser() requestingUser: User, // Usuario autenticado que hace la petición
      ) {
      return this.authService.desactiveUser(id, requestingUser);
}

//activate user
  @Patch(':id/activate')
  @Auth(ValidRoles.Admin, ValidRoles.Owner)
    activateUser(
      @Param('id') id: string,
      @GetUser() requestingUser: User,
      ) {
      return this.authService.activateUser(id, requestingUser);
}

  


}
