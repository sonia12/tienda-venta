import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'validator';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

@Injectable()
export class SupplierService {

  constructor(
    @InjectRepository(Supplier)
    private supplierRepository:Repository<Supplier>
  ){}


  async create(createSupplierDto: CreateSupplierDto, user:User) {
    createSupplierDto.name = createSupplierDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    try{
      const createSupplier= this.supplierRepository.create({
        ...createSupplierDto, user
      })
      
      const savedSupplier=  await this.supplierRepository.save(createSupplier)
      return {
        message: "se creo el proveedor con los sgtes datos  ",
        id: savedSupplier.id ,
        name: savedSupplier.name,
        address: savedSupplier.address,
        city: savedSupplier.city,
        phone: savedSupplier.phone,
        registredBy:{
          id: user.id,
          name: user.fullname

        }

      }
    }catch (error){
      this.handleException(error, createSupplierDto)
    }
    
  }
  

  async findAll(paginationDto:PaginationDto, user:User) {
    const {limit = 10, offset = 0}= paginationDto

    const suppliers = await this.supplierRepository.find({
       take: limit,
       skip: offset
       
    })

    if(user.roles.includes(ValidRoles.Employee)&& !user.roles.includes(ValidRoles.Admin)&& !user.roles.includes(ValidRoles.Owner)){

      return suppliers.map(supplier =>{
        const {address, city, phone, ...complementData} = supplier 
        return complementData
      })
    }
    
    
    return suppliers
  }

  async findOne(term: string, user:User) {

    let supplier: any
    
    if(isUUID(term)){
      supplier = await this.supplierRepository.findOne({
        where:{id: term},
        relations:{ProdSupplier: true, 
          
         }
       })
    
      }else{
        const normalizar = term.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
        const queryBuilder = this.supplierRepository.createQueryBuilder('supplier')
        supplier = await queryBuilder
        .where('LOWER(supplier.name) = :name', {
        name:normalizar
          
        })
        .orWhere('supplier.phone = :phone', {
          phone: term.trim()
        })
          .leftJoinAndSelect('supplier.ProdSupplier', 'prodSupplier')
          .getOne()
        }
    if(!supplier){
      throw new NotFoundException(`no existe la categoria N° ${term}`)
    }

   if(user.roles.includes(ValidRoles.Employee) && !user.roles.includes(ValidRoles.Admin) && !user.roles.includes(ValidRoles.Owner)){
      if(supplier.ProdSupplier && Array.isArray(supplier.ProdSupplier)){
        supplier.ProdSupplier = supplier.ProdSupplier.map(product=>{
                const { unit_cost, ...productWithoutCost } = product;
                return productWithoutCost;
        })

      }
        const {address, city, phone, ...complementData} = supplier 
        return complementData
    
    }
    return supplier
  }



  async update(id: string, updateSupplierDto: UpdateSupplierDto, user:User) {
    
    
    if(updateSupplierDto.name){
      updateSupplierDto.name = updateSupplierDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    if(updateSupplierDto.address){
      updateSupplierDto.address = updateSupplierDto.address.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    if(updateSupplierDto.city){
      updateSupplierDto.city = updateSupplierDto.city.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')

    }
    if(updateSupplierDto.phone){
      updateSupplierDto.phone = updateSupplierDto.phone.trim()
    }
    const supplierUpdate = await this.supplierRepository.preload({
      id:id,
      ...updateSupplierDto, user
    })
    if(!supplierUpdate){
      throw new NotFoundException (`No existe el supplier con id ${id}`)
    }
    try{
      await this.supplierRepository.update(id, updateSupplierDto)

      const sanitizedUser = { id: user.id, fullname: user.fullname }
      return {...supplierUpdate, ...updateSupplierDto, user:sanitizedUser}

    }catch(error){
      this.handleException(error, updateSupplierDto)
    }

  }

  private handleException(error: any, updateSupplierDto: UpdateSupplierDto){
    if(error.code === '23505'){
      
        throw new BadRequestException(`Ya existe en la base de datos un supplier con el NIT ${updateSupplierDto.nit}`)
    }
    console.log(error)
    throw new InternalServerErrorException(`Error inesperado al actualizar el supplier - check server log`)
  }
}
