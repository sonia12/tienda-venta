import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order_detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Order } from '../order/entities/order.entity';

@Injectable()
export class OrderDetailService {

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(OrderDetail)
    private OrderDetailRepository:Repository<OrderDetail>
  ){}
 

  async create(createOrderDetailDto: CreateOrderDetailDto) {
    const order = await this.orderRepository.findOneBy({id:createOrderDetailDto.id_order})

    if(!order){
    throw new NotFoundException('no se encontro el id de la orden')
    }
    const product = await this.productRepository.findOneBy({id:createOrderDetailDto.id_product})
    if(!product){
      throw new NotFoundException('no se encontro el id del producto')
    }
    const createOrderDetail = this.OrderDetailRepository.create({...createOrderDetailDto, prodOrder_datail:product, orderOrder_detail:order})
    return this.OrderDetailRepository.save(createOrderDetail)
  }
    

  findAll() {
    return this.OrderDetailRepository.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} orderDetail`;
  }

  update(id: number, updateOrderDetailDto: UpdateOrderDetailDto) {
    return `This action updates a #${id} orderDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderDetail`;
  }
}
