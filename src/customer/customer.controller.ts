import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { User } from '../auth/entities/user.entity';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @Auth(ValidRoles.Employee)
  create(@Body() createCustomerDto: CreateCustomerDto, @GetUser() user:User) {
    return this.customerService.create(createCustomerDto, user);
  }

  @Get()
  @Auth(ValidRoles.Employee, ValidRoles.Admin, ValidRoles.Owner)
  findAll(@Query() paginationDto:PaginationDto, @GetUser() user: User) {
    return this.customerService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth(ValidRoles.Admin, ValidRoles.Owner, ValidRoles.Employee)
  findOne(@Param('term') term: string, @GetUser() user:User) {
    return this.customerService.findOne(term, user);
  }


  @Patch(':id')
  @Auth(ValidRoles.Employee)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCustomerDto: UpdateCustomerDto, @GetUser() user:User) {
    return this.customerService.update(id, updateCustomerDto, user);
  }

 
}
