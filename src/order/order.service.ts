import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Employee } from '../employee/entities/employee.entity';

@Injectable()
export class OrderService {

  constructor(
    @InjectRepository(Order)
    private orderRepository:Repository<Order>,
    
    @InjectRepository(Employee)
    private employeeRepository:Repository<Employee>,

    @InjectRepository(Customer)
    private customerRepository:Repository<Customer>
  )
  {}

  async create(createOrderDto: CreateOrderDto) {
    
      const customer = await this.customerRepository.findOneBy({id:createOrderDto.id_customer})
      if(!customer){
          throw new NotFoundException('el cliente no se encontro')
        }

      const employee = await this.employeeRepository.findOneBy({id:createOrderDto.id_employee})
      if(!employee){
          throw new NotFoundException('el empleado no se encontro')
        }
      const createOrder= this.orderRepository.create({...createOrderDto, custOrder:customer, emplOrder:employee})
      return this.orderRepository.save(createOrder)

    
  }

  findAll() {
    return this.orderRepository.find({
      relations:{emplOrder:true, custOrder: true}
    })
  }

  async findOne(id: number) {
    const service = await this.orderRepository.findOne({
      where: {id},
      relations:{emplOrder: true, custOrder: true }
    })
    if(!service){
      throw new NotFoundException (`el order id $(id) no existe`)
    }
    return service
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const orderUpdate = await this.orderRepository.findOne({
      where: {id}
    })
    if(!orderUpdate){
      throw new NotFoundException(`no se encontro la orden con el id ${id}`)
    }

    const updateData:Partial<Order>={}  // 

    if(updateOrderDto.id_customer){
      const customer = await this.customerRepository.findOne({
        where:{id:updateOrderDto.id_customer}
      })
      if(!customer){
        throw new NotFoundException(`No existe el cliente con el id ${updateOrderDto.id_customer}`);
      }
      updateData.custOrder = customer;  //
    }
    
    if(updateOrderDto.id_employee){
      const employee = await this.employeeRepository.findOne({
        where:{id:updateOrderDto.id_employee}
      })
      if(!employee){
        throw new NotFoundException(`No existe el empleado con el id ${updateOrderDto.id_employee}`);
      }
      updateData.emplOrder = employee; //

    }

    await this.orderRepository.update(id, updateData)
    return {
      ...orderUpdate, ...updateOrderDto

    }

    
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  
}
