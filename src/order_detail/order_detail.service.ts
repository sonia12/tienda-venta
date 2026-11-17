import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order_detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Order, orders_status } from '../order/entities/order.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'validator';
import { User } from '../auth/entities/user.entity';

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

  //calcular total
  
 private async TotalAmount(id_order: string) {
    const order = await this.orderRepository.findOne({
      where: { id: id_order },
      relations:{detailOrder: true},
    });
    if(!order){
      throw new NotFoundException(`No se encontró la orden con el id ${id_order}`)
    }
      
       let total = 0
    
    if(order.detailOrder && Array.isArray(order.detailOrder)){
      for (const item of order.detailOrder) {
        const discount = item.discount || 0;
        const subtotal = (item.unit_price * item.quantity) - discount;
        total += subtotal;
      }
    }
    await this.orderRepository.update(id_order, { total_amount: total })

  }

  async create(orderId:string, createOrderDetailDto: CreateOrderDetailDto ) {

    // buscamos el producto
    const product = await this.productRepository.findOneBy({id:createOrderDetailDto.id_product})
    if(!product){
      throw new NotFoundException('no se encontro el id del producto')
    }

    // buscamos la orden
    const order = await this.orderRepository.findOneBy({id: orderId})

    if(!order){
    throw new NotFoundException('no se encontro el id de la orden')
    }

    // validamos que la orden este en pending
    if(order.status ===orders_status.COMPLETE){
      throw new BadRequestException('no se puede añadir mas detalles orden completada')
    }

    if(order.status ===orders_status.CANCEL){
      throw new BadRequestException('no se puede añadir mas detalles orden cancelada')
    }


    // validamos la cantidad y el stock
    const  quantity  = createOrderDetailDto.quantity ?? 1

    if (product.unit_stock < quantity) {
      throw new BadRequestException(`Stock insuficiente. Stock actual disponible: ${product.unit_stock}`);
    }

    const createOrderDetail = this.OrderDetailRepository.create({
      quantity,
      unit_price: product.unit_price, // <-- Congela el precio
      unit_cost: product.unit_cost,   // <-- Congela el costo
      id_product: createOrderDetailDto.id_product, 
      id_order: orderId,
    })
     const orderDetail = await this.OrderDetailRepository.save(createOrderDetail)

     await this.productRepository.decrement(
      { id: product.id },     // Buscamos el producto por su id
      'unit_stock',           // Columna que queremos disminuir
      quantity                // Cantidad que se va a restar
    );

     // total orden
     await this.TotalAmount(orderId)

     const { unit_cost, prodOrder_datail, orderOrder_detail, ...employeeResponse } = orderDetail as any
     return employeeResponse
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
    const updateDetail= await this.OrderDetailRepository.save(orderDetailUpdate)

    if(updateDetail.id_order){
      await this.TotalAmount(updateDetail.id_order)
    }


    return updateDetail
  }

  async remove(id: string) {
   const orderDetailRemove = await this.OrderDetailRepository.findOne({
      where: {id}
    })
    if(!orderDetailRemove){
      throw new NotFoundException(`no existe el orderDetail con id ${id}`)
    }

    const orderId = orderDetailRemove.id_order  
    const order = await this.orderRepository.findOneBy({ id: orderId });

    if (!order) {
      throw new NotFoundException('No se encontró la orden asociada a este detalle');
    }

    if (order.status === orders_status.COMPLETE) {
      throw new BadRequestException('No se pueden eliminar detalles de una orden que ya ha sido completada.');
    }

    if (order.status === orders_status.CANCEL) {
      throw new BadRequestException('No se pueden eliminar detalles de una orden que ya ha sido cancelada.');
    }

    //order detail que se elimina se incrementa al stock
    await this.productRepository.increment(
      { id: orderDetailRemove.id_product },
      'unit_stock',
      orderDetailRemove.quantity
    );
    await this.OrderDetailRepository.delete(id)

    if(orderId){
      await this.TotalAmount(orderId)
    }
    
    

    return {
      message: 'orderDetail eliminada correctamente'
  }; 
}

}
