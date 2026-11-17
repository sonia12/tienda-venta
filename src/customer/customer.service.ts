import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { noDeprecation } from 'process';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'validator';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

@Injectable()
export class CustomerService {

  constructor(
    @InjectRepository(Customer)
      private customerRepository:Repository<Customer>
    )
  {}

  async create(createCustomerDto: CreateCustomerDto, user:User) {
    let processName = 'cliente General'
    if (createCustomerDto.name){
      createCustomerDto.name = createCustomerDto.name
      .toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    if (createCustomerDto.ci) {
    createCustomerDto.ci = createCustomerDto.ci.trim();
    }
    
    
    try{
      const NewCreateCustomer= this.customerRepository.create({...createCustomerDto, user})
      const saveCustomer = await this.customerRepository.save(NewCreateCustomer)
      return {
        message: "Cliente registrado correctamente",
        client: {
          id: saveCustomer.id,
          name: saveCustomer.name,
          phone: saveCustomer.phone,
          ci: saveCustomer.ci
        }
      }

    }catch(error){
      this.handleException(error, processName)

    }

    
  }

  findAll(paginationDto:PaginationDto,user:User) {
    const {limit = 10, offset = 0}= paginationDto
    if(user.roles.includes(ValidRoles.Owner)||user.roles.includes(ValidRoles.Admin)){
      return this.customerRepository.find({
      take: limit,
      skip: offset,
      relations:{user:true},
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ci: true,
        user: {
          id: true,
          fullname: true, 
        },
      },
    })
    }
    if (user.roles.includes(ValidRoles.Employee)) {
    return this.customerRepository.find({
      take: limit,
      skip: offset,
      where: {
        user: { id: user.id }, // Filtra por la relación con el usuario logueado
      },

    });
  }
  return []
    
  }

  async findOne(term: string, user: User) {
  let customer: Customer | null;
  if (isUUID(term)) {
    customer = await this.customerRepository.findOne({
      where: { id: term },
      relations: { customerOrders: true, user:true }, // Incluimos 'user' para saber quién lo registró
      select:{
        id: true,
        name: true,
        email: true,
        phone: true,
        ci: true,
        customerOrders: {
          id: true,
          date: true, 
          id_employee: true,
          total_amount:true,
          status:true
        },
      
      }
    });
  } else {
   

    const queryBuilder = this.customerRepository.createQueryBuilder('customer');
    
    customer = await queryBuilder
      .where('customer.ci = :ci', { ci: term})
      .leftJoinAndSelect('customer.customerOrders', 'customerOrders')
      .leftJoinAndSelect('customer.user', 'user') // Importante para verificar la propiedad del cliente
      .getOne();
  }

  if (!customer) {
    throw new NotFoundException(`No existe el cliente con el término: ${term}`);
  }
  if(user.roles.includes(ValidRoles.Employee)){
    if (!customer.user || customer.user.id !== user.id) {
      throw new NotFoundException(`No existe el cliente con id o ci: ${term}`); 
    }
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      ci: customer.ci,
    
      registeredBy: {
        id: customer.user.id,
        name: customer.user.fullname,
      }
    }
  }

  // Si es Admin u Owner, pasa directo y retorna el cliente
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    ci: customer.ci,
    customerOrders: customer.customerOrders,
    
  };
}

  


  async update(id: string, updateCustomerDto: UpdateCustomerDto, user: User) {
  
  const customer = await this.customerRepository.findOne({
    where: { id },
    relations: { user: true }, // Necesario para saber qué empleado lo registró
  });

  if (!customer) {
    throw new NotFoundException(`El cliente con el id ${id} no se encontró`);
  }

  if (user.roles.includes(ValidRoles.Employee)) {
    if (!customer.user || customer.user.id !== user.id) {
      throw new ForbiddenException(`No tienes permisos para actualizar a este cliente`);
    }
  }
  if (updateCustomerDto.name) {
    updateCustomerDto.name = updateCustomerDto.name
      .toLocaleLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\u0300-\u036f]/g, ''); // (Nota: tenías el replace de acentos repetido dos veces, con uno basta)
  }
  
  if (updateCustomerDto.phone) {
    updateCustomerDto.phone = updateCustomerDto.phone.trim();
  }

  if (updateCustomerDto.ci) {
    updateCustomerDto.ci = updateCustomerDto.ci.trim();
  }
  const customerUpdate = await this.customerRepository.preload({
    id: id,
    ...updateCustomerDto,

  });

  if (!customerUpdate) {
    throw new NotFoundException(`El cliente con el id ${id} no se encontró`);
  }

  try {
    await this.customerRepository.save(customerUpdate);
    return {
      message: " se actualizo correctamente los datos del cliente",
      customerUpdate
    }

  } catch (error) {
    this.handleException(error, updateCustomerDto.name ?? customerUpdate.name ?? 'cliente general');
  }
}

  
  private handleException(error: any, customerName:string){
      if(error === '23505'){
        throw new BadRequestException(`ya existe en la base de datos el cliente ${customerName}`)
      }
      console.log(error)
      throw new InternalServerErrorException(`no creaste un cliente - check server log`)
    }

  
}
