import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { noDeprecation } from 'process';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'validator';

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

  findAll(paginationDto:PaginationDto) {
    const {limit = 10, offset = 0}= paginationDto
    return this.customerRepository.find({
      take: limit,
      skip: offset
    })
  }

  async findOne(term: string) {
    let customer: Customer|null
    if(isUUID(term)){
      customer = await this.customerRepository.findOne({
        where:{id:term},
        relations:{orderCust: true}
      })
    }else{
      const normalizar = term.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
      const queryBuilder = this.customerRepository.createQueryBuilder('customer')
      customer = await queryBuilder
      .where('LOWER(customer.name) = :name', {
        name:normalizar
      
      })
      .leftJoinAndSelect('customer.orderCust', 'orderCust')
      .getOne()
    }
    
    if(!customer){
      throw new NotFoundException(`no existe el cliente con el id ${term}`)
    }
    return customer
  }

  


  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    
    if(updateCustomerDto.name){
      updateCustomerDto.name=updateCustomerDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '').replace(/[\u0300-\u036f]/g, '')
    }
    if(updateCustomerDto.phone){
      updateCustomerDto.phone= updateCustomerDto.phone.trim()
    }
    const customerUpdate = await this.customerRepository.preload({
      id:id,
      ...updateCustomerDto
    })
    
    if(!customerUpdate){
      throw new NotFoundException(`el cliente con el id ${id} no se encontro`)
    }

    try{
      await this.customerRepository.save(customerUpdate)
      return customerUpdate

    }catch(error){
      this.handleException(error,updateCustomerDto.name?? customerUpdate.name)

    }
  }

  async remove(id: string) {
    const customerRemove = await this.customerRepository.findOne({
      where: {id}
    })
    if(!customerRemove){
      throw new NotFoundException(`no existe la categoria con id ${id}`)
    }
    await this.customerRepository.delete(id);

    return {
      message: 'Categoría eliminada correctamente'
  };
  }

  private handleException(error: any, customerName:string){
      if(error === '23505'){
        throw new BadRequestException(`ya existe en la base de datos el cliente ${customerName}`)
      }
      console.log(error)
      throw new InternalServerErrorException(`no creaste un cliente - check server log`)
    }

  
}
