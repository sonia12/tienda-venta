import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, orders_status} from './entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { User } from '../auth/entities/user.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Product } from '../product/entities/product.entity';
import { OrderDetail } from '../order_detail/entities/order_detail.entity';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

@Injectable()
export class OrderService {

  constructor(
    @InjectRepository(Order)
    private orderRepository:Repository<Order>,
    

    @InjectRepository(Customer)
    private customerRepository:Repository<Customer>,
    
    @InjectRepository(Product)
    private productRepository:Repository<Product>,

    private readonly dataSource: DataSource,
  )
  {}

  async create(createOrderDto: CreateOrderDto, user:User) {
      let customer :Customer | null = null
    
      if(createOrderDto.ci && createOrderDto.ci.trim() !== ''){
        customer = await this.customerRepository.findOneBy({ci: createOrderDto.ci})
        if(!customer){
          throw new NotFoundException('el cliente no se encontro')
        }
      }else {
        customer = await this.customerRepository.save(
        this.customerRepository.create({
          name: "cliente general",
          
        })
      )
      }
      
      
      const { ci, ...orderData } = createOrderDto;

    // 4. Creamos la orden de forma limpia y segura
    const newOrder = this.orderRepository.create({
      ...orderData, 
      custOrder: customer, 
      id_customer: customer.id, 
      user: user, 
      id_employee: user.id
    });

    const savedOrder = await this.orderRepository.save(newOrder);

    return {
      id: savedOrder.id,
      date: savedOrder.date,
      customer: {
        id: customer.id,
        name: customer.name
      },
      total_amount: savedOrder.total_amount,
      status: savedOrder.status,
      employee: {
        id: user.id,
        name: user.fullname
      }
    };
  }

  async findAll(paginationDto: PaginationDto, user: User) {
  const { limit = 10, offset = 0 } = paginationDto;

  const isOnlyEmployee = 
    user.roles.includes(ValidRoles.Employee) && 
    !user.roles.includes(ValidRoles.Admin) && 
    !user.roles.includes(ValidRoles.Owner);

  const orders = await this.orderRepository.find({
    take: limit,
    skip: offset,
    where: isOnlyEmployee ? { user: { id: user.id } } : {},
    relations: { user: true, detailOrder: true, custOrder: true }
  });

  if (isOnlyEmployee) {
    return orders.map(order => {
      const { user: _, id_employee, custOrder, id_customer, detailOrder: __, ...rest } = order as any;
      return {
        ...rest,
        customer: {name: custOrder.name ? custOrder.name : "Sin nombre"},
        employee: { id:user.id, name: user.fullname}
      };
    });
  }
  return orders.map(order => {
    const { user, custOrder, detailOrder: _, ...rest } = order as any;
    return { 
      ...rest,
      customer: custOrder ? { id: custOrder.id, name: custOrder.name } : { id: null, name: "Sin nombre" },
      employee: user ? { id: user.id, name: user.fullname } : { id: order.id_employee, name: "Desconocido" }
    };
  });
}

  async findOne(id: string, user: User) {
    const isOnlyEmployee = 
      user.roles.includes(ValidRoles.Employee) && 
      !user.roles.includes(ValidRoles.Admin) && 
      !user.roles.includes(ValidRoles.Owner);

    const order = await this.orderRepository.findOne({
      where: isOnlyEmployee ? { id, user: { id: user.id } } : { id },
      relations: { user: true, detailOrder: true, custOrder: true }
    });

    if (!order) {
      throw new NotFoundException(`El order id ${id} no existe o no tienes acceso`);
    }

    if (isOnlyEmployee) {
      const { user: _, id_employee, custOrder, id_customer, detailOrder, ...rest } = order as any;
      
      const sanitizedDetails = detailOrder ? detailOrder.map((detail: any) => {
        const { unit_cost, ...detailRest } = detail;
        return detailRest;
      }) : [];

      return {
        ...rest,
        customer: custOrder ? custOrder.name : "cliente general",
        employee: { id: user.id, name: user.fullname },
        detailOrder: sanitizedDetails
      };
    }

    const { user: orderUser, custOrder, detailOrder, ...rest } = order as any;

    const sanitizedDetails = detailOrder ? detailOrder.map((detail: any) => {
      const { unit_cost, ...detailRest } = detail;
      return detailRest;
    }) : [];

    return {
      ...rest,
      customer: custOrder ? { id: custOrder.id, name: custOrder.name } : { id: null, name: "cliente general" },
      employee: { 
        id: orderUser.id, 
        name: orderUser.fullname 
      },
      detailOrder: sanitizedDetails
    };
  }


  

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, user:User) {

    
    return await this.dataSource.transaction(async (manager) => {

    // 1. Buscamos la orden con sus relaciones dentro de la transacción
    const order = await manager.findOne(Order, {
      where: { id },
      relations: { detailOrder: { prodOrder_datail: true }, user: true },
    });

    if (!order) {
      throw new NotFoundException(`No se encontró la orden con el ID: ${id}`);
    }

    const previousStatus = order.status;
    const newStatus = updateOrderStatusDto.status;

    // 2. Validaciones de estados bloqueados
    if (previousStatus === orders_status.COMPLETE) {
      throw new BadRequestException('No se puede modificar una orden que ya ha sido completada.');
    }

    if (previousStatus === orders_status.CANCEL) {
      throw new BadRequestException('No se puede modificar una orden que ya ha sido cancelada.');
    }

    // 3. Lógica si la orden pasa a CANCELADA (Devolver stock)
    if (newStatus === orders_status.CANCEL && (previousStatus as any) !== orders_status.CANCEL) {
      if (order.detailOrder && order.detailOrder.length > 0) {
        for (const detail of order.detailOrder) {
          await manager.increment(
            Product, 
            { id: detail.id_product },
            'unit_stock',
            detail.quantity
          );
        }
      }
    }

    // 4. Lógica si la orden pasa a COMPLETADA (Decrementar stock)
    if (newStatus === orders_status.COMPLETE && (previousStatus as any)== orders_status.COMPLETE) {
      if (order.detailOrder && order.detailOrder.length > 0) {
        for (const detail of order.detailOrder) {
          
          const product = await manager.findOne(Product, { where: { id: detail.id_product } });
          
          if (!product) {
            throw new NotFoundException(`El producto con ID ${detail.id_product} no existe.`);
          }

          if (product.unit_stock < detail.quantity) {
            throw new BadRequestException(
              `Stock insuficiente para el producto "${product.name || detail.id_product}". Stock actual: ${product.unit_stock}, requerido: ${detail.quantity}`
            );
          }

          await manager.decrement(
            Product,
            { id: detail.id_product },
            'unit_stock',
            detail.quantity
          );
        }
      }
    }

    // 5. Actualizamos el estado de la orden y guardamos
    order.status = newStatus;
    return await manager.save(order);
  })


  

  
  }
}