import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {

  constructor(
    @InjectRepository(Customer)
      private customerRepository:Repository<Customer>
    )
  {}

  create(createCustomerDto: CreateCustomerDto) {
    createCustomerDto.name = createCustomerDto.name.toLocaleLowerCase()
    try{
      const createCustomer= this.customerRepository.create(createCustomerDto)
      return this.customerRepository.save(createCustomer)

    }catch(error){
      this.handleException(error, createCustomerDto.name)

    }

    
  }

  findAll() {
    return this.customerRepository.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} customer`;
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }

  private handleException(error: any, customerName:string){
      if(error === '23505'){
        throw new BadRequestException(`ya existe en la base de datos el cliente ${customerName}`)
      }
      console.log(error)
      throw new InternalServerErrorException(`no creaste un cliente - check server log`)
    }
}
