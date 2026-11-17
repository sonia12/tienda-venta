import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { User } from '../auth/entities/user.entity';

@Controller('supplier')

export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @Auth(ValidRoles.Admin, ValidRoles.Owner)
  create(@Body() createSupplierDto: CreateSupplierDto, @GetUser() user:User) {
    return this.supplierService.create(createSupplierDto, user);
  }

  @Get()
  @Auth(ValidRoles.Admin, ValidRoles.Owner, ValidRoles.Employee)
  findAll(@Query() paginationDto:PaginationDto, @GetUser() user:User) {
    return this.supplierService.findAll(paginationDto,user);
  }


  @Get(':term')
  @Auth(ValidRoles.Admin,ValidRoles.Owner, ValidRoles.Employee)
  findOne(@Param('term') term: string, @GetUser() user:User) {
    
    return this.supplierService.findOne(term, user);
  }


  @Patch(':id')
  @Auth(ValidRoles.Admin, ValidRoles.Owner)
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateSupplierDto: UpdateSupplierDto, @GetUser() user:User) {
    return this.supplierService.update(id, updateSupplierDto, user);
  }

  
}
