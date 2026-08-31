import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { noDeprecation } from 'process';

@Injectable()
export class CustomerService {

  constructor(
    @InjectRepository(Customer)
      private customerRepository:Repository<Customer>
    )
  {}

  create(createCustomerDto: CreateCustomerDto) {
    createCustomerDto.name = createCustomerDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
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

  async findOne(id: number) {
    
    const customer = await this.customerRepository.findOne({
      where: {id},
      relations: {orderCust: true}
    })
    if(!customer){
      throw new NotFoundException(`no existe el cliente con el id ${id}`)
    }
    return customer
  }

  async findByNameWithOrder(name:string){
    
    const customerName = await this.customerRepository.findOne({
      where: {name:name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '').replace(/[\u0300-\u036f]/g, '')},
      relations: {orderCust:true}
    })
    if(!customerName){
      throw new NotFoundException(`no existe el cliente con el nombre ${name}`)
    }
    return customerName
  }



  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customerUpdate= await this.customerRepository.findOne({
      where: {id}
    })
    if(!customerUpdate){
      throw new NotFoundException(`el cliente con el id ${id} no se encontro`)
    }
    if(updateCustomerDto.name){
      updateCustomerDto.name=updateCustomerDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '').replace(/[\u0300-\u036f]/g, '')
    }
    if(updateCustomerDto.phone){
      updateCustomerDto.phone= updateCustomerDto.phone.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '').replace(/[\u0300-\u036f]/g, '')
    }

    try{
      await this.customerRepository.update(id,updateCustomerDto)
      return {...customerUpdate, ...updateCustomerDto}

    }catch(error){
      this.handleException(error,updateCustomerDto.name?? customerUpdate.name)

    }
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
