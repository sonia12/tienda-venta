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

  // calcula stock
  private async adjustProductStock(productId: string, quantityDelta: number) {
    if (quantityDelta === 0) {
      return;
    }

    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException(`No se encontró el producto con el id ${productId}`);
    }

    if (quantityDelta > 0) {
      if (product.unit_stock < quantityDelta) {
        throw new BadRequestException(
          `Stock insuficiente. Stock actual disponible: ${product.unit_stock}`,
        );
      }

      await this.productRepository.decrement(
        { id: productId },
        'unit_stock',
        quantityDelta,
      );
    } else {
      await this.productRepository.increment(
        { id: productId },
        'unit_stock',
        Math.abs(quantityDelta),
      );
    }
  }

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

    await this.adjustProductStock(product.id, quantity);

    const createOrderDetail = this.OrderDetailRepository.create({
      quantity,
      unit_price: product.unit_price, // <-- Congela el precio
      unit_cost: product.unit_cost,   // <-- Congela el costo
      id_product: createOrderDetailDto.id_product, 
      id_order: orderId,
    })
     const orderDetail = await this.OrderDetailRepository.save(createOrderDetail)

    
     // total orden
     await this.TotalAmount(orderId)

     const { unit_cost, prodOrder_datail, orderOrder_detail, ...employeeResponse } = orderDetail as any
     return employeeResponse
  }
    

  

  async update(id: string, updateOrderDetailDto: UpdateOrderDetailDto) {
    // 1. Buscamos el detalle y su orden/producto asociados
  const existingDetail = await this.OrderDetailRepository.findOne({
    where: { id },
    relations: {
      orderOrder_detail: true,
      prodOrder_datail: true,
    },
  });

  if (!existingDetail) {
    throw new NotFoundException(`No se encontró el order detail con el id ${id}`);
  }

  // 2. Verificamos la orden asociada y que esté en estado PENDING
  const associatedOrder = existingDetail.orderOrder_detail;

  if (!associatedOrder) {
    throw new BadRequestException(
      'El detalle no tiene una orden asociada.',
    );
  }

  if (associatedOrder.status !== orders_status.PENDING) {
    throw new BadRequestException(
      'no se puede actualizar orden completada.',
    );
  }

  // 3. Bloqueamos cambios de producto (solo se permite actualizar la cantidad)
  if (
    updateOrderDetailDto.id_product &&
    updateOrderDetailDto.id_product !== existingDetail.id_product
  ) {
    throw new BadRequestException(
      'No se puede cambiar el producto desde este endpoint. Elimine el detalle y cree uno nuevo.',
    );
  }

    const newQuantity = updateOrderDetailDto.quantity ?? 1;
    const quantityDelta = newQuantity - existingDetail.quantity;


  

    

    await this.adjustProductStock(existingDetail.id_product, quantityDelta)

  // 4. Actualizamos quantity (por defecto 1 si no se envía), conservando producto y orden
  const orderDetailUpdate = await this.OrderDetailRepository.preload({
      id: existingDetail.id,
      quantity: newQuantity,
      id_product: existingDetail.id_product,
      prodOrder_datail: existingDetail.prodOrder_datail,
      id_order: existingDetail.id_order ?? associatedOrder.id,
      orderOrder_detail: associatedOrder,
  });

  // 5. Guardamos y recalculamos el total de la orden asociada
  const savedDetail = await this.OrderDetailRepository.save(orderDetailUpdate!);
  await this.TotalAmount(associatedOrder.id);

  // 6. Consultamos el detalle actualizado y formateamos la respuesta
  const updatedWithProduct = await this.OrderDetailRepository.findOne({
    where: { id: savedDetail.id },
    relations: { prodOrder_datail: true },
  });

  const {
    unit_cost,
    id_product,
    orderOrder_detail,
    prodOrder_datail,
    ...restDetail
  } = updatedWithProduct as any;

  return {
    ...restDetail,
    prodOrder_datail: {
      name: prodOrder_datail.name, 
    },
  };
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
    await this.adjustProductStock(
      orderDetailRemove.id_product,
      -orderDetailRemove.quantity,
      
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
