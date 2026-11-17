import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { User } from '../auth/entities/user.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Auth(ValidRoles.Employee)
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user:User) {
    return this.orderService.create(createOrderDto, user);
  }

  @Get()
  @Auth(ValidRoles.Employee, ValidRoles.Admin, ValidRoles.Owner)
  findAll(@Query() paginationDto:PaginationDto, @GetUser() user:User) {

    return this.orderService.findAll(paginationDto, user);
  }

  @Get(':id')
  @Auth(ValidRoles.Employee, ValidRoles.Admin, ValidRoles.Owner)
  findOne(@Param('id') id: string, @GetUser() user: User) {

    
    return this.orderService.findOne(id, user);
  }

  

  @Patch(':id/status')
  @Auth(ValidRoles.Employee)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto, @GetUser() user:User) {
    return this.orderService.updateStatus(id, updateOrderStatusDto, user);
  }

  
}
