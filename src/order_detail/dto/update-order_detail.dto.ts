import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDetailDto } from './create-order_detail.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateOrderDetailDto extends PartialType(CreateOrderDetailDto) {
    
}
    