import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { OrderDetailService } from './order_detail.service';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order_detail.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { User } from '../auth/entities/user.entity';

@Controller('order-detail')
export class OrderDetailController {
  constructor(private readonly orderDetailService: OrderDetailService) {}

  @Post(':orderId/details')
  @Auth(ValidRoles.Employee)
  create(
    @Param('orderId', ParseUUIDPipe) orderId:string, //a
    @Body() createOrderDetailDto: CreateOrderDetailDto
  ) {
    return this.orderDetailService.create(orderId, createOrderDetailDto);
  }

  

  @Patch(':id')
  @Auth(ValidRoles.Employee)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateOrderDetailDto: UpdateOrderDetailDto) {
    return this.orderDetailService.update(id, updateOrderDetailDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.Employee)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderDetailService.remove(id);
  }
}
