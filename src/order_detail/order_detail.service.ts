import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order_detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Order } from '../order/entities/order.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'validator';

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
    

  findAll(paginationDto:PaginationDto) {
    const {limit = 10, offset = 0}= paginationDto
    return this.OrderDetailRepository.find({
      take: limit,
      skip: offset,
      relations:{prodOrder_datail:true, orderOrder_detail:true}
    })
  }

  async findOne(id: string) {
    const orderDetail = await this.OrderDetailRepository.findOne({
      where: {id},
      relations:{prodOrder_datail: true, orderOrder_detail: true }
    })
    if(!orderDetail){
      throw new NotFoundException (`el order detail id $(id) no existe`)
    }
    return orderDetail
    
    
  } 

  async update(id: string, updateOrderDetailDto: UpdateOrderDetailDto) {
    const orderDetailUpdate = await this.OrderDetailRepository.preload({
      id:id, ...updateOrderDetailDto
    })
    if(!orderDetailUpdate){
      throw new NotFoundException(`no se encontro el order detail con el id ${id}`)
    }

    if(updateOrderDetailDto.id_product){
      const product = await this.productRepository.findOne({
        where: {id:updateOrderDetailDto.id_product}
      })
      if(!product){
        throw new NotFoundException(`No existe el product con el id ${updateOrderDetailDto.id_product}`);
      }
      orderDetailUpdate.prodOrder_datail = product
    }

    if(updateOrderDetailDto.id_order){
      const order = await this.orderRepository.findOne({
        where:{id:updateOrderDetailDto.id_order}
      })
      if(!order){
        throw new NotFoundException(`No existe el order con el id ${updateOrderDetailDto.id_order}`)
      }
      orderDetailUpdate.orderOrder_detail = order

    }
    return await this.OrderDetailRepository.save(orderDetailUpdate)
  }

  async remove(id: string) {
   const orderDetailRemove = await this.OrderDetailRepository.findOne({
      where: {id}
    })
    if(!orderDetailRemove){
      throw new NotFoundException(`no existe el orderDetail con id ${id}`)
    }
    await this.OrderDetailRepository.delete(id);

    return {
      message: 'orderDetail eliminada correctamente'
  }; 
  }
}
