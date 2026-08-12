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
    return this.orderRepository.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  
}
