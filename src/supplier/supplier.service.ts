import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'validator';

@Injectable()
export class SupplierService {

  constructor(
    @InjectRepository(Supplier)
    private supplierRepository:Repository<Supplier>
  ){}


  async create(createSupplierDto: CreateSupplierDto) {
    createSupplierDto.name = createSupplierDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    try{
      const createSupplier= this.supplierRepository.create(createSupplierDto)
      return this.supplierRepository.save(createSupplier)
    }catch (error){
      this.handleException(error, createSupplierDto.name)
    }
    
  }
  

  findAll(paginationDto:PaginationDto) {
    const {limit = 10, offset = 0}= paginationDto
    return this.supplierRepository.find({
      take: limit,
      skip: offset
    })
  }

  async findOne(term: string) {

    let supplier: Supplier|null;
    
    if(isUUID(term)){
      supplier = await this.supplierRepository.findOne({
        where:{id: term},
        relations:{ProdSupplier: true}
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
    return supplier
  }



  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    
    
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
      ...updateSupplierDto
    })
    if(!supplierUpdate){
      throw new NotFoundException (`no existe la categoria con id ${id}`)
    }
    try{
      await this.supplierRepository.update(id,updateSupplierDto)
      return {...supplierUpdate, ...updateSupplierDto}

    }catch(error){
      this.handleException(error, updateSupplierDto.name?? supplierUpdate.name)
    }

  }

  async remove(id: string) {
    const supplierRemove = await this.supplierRepository.findOne({
      where: {id}
    })
    if(!supplierRemove){
      throw new NotFoundException(`no existe la categoria con id ${id}`)
    }
    await this.supplierRepository.delete(id);

    return {
      message: 'supplier eliminada correctamente'
  };
  }

  private handleException(error: any, supplierName:string){
    if(error === '23505'){
      throw new BadRequestException(`ya existe en la base de datos el supplier ${supplierName}`)
    }
    console.log(error)
    throw new InternalServerErrorException(`no creaste una categoria- check server log`)
  }

  



}
