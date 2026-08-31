import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';

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
  

  findAll() {
    return this.supplierRepository.find()
  }

  async findOne(id: number) {

    const supplier = await this.supplierRepository.findOne({
      where: {id},
      relations: {ProdSupplier:true}
    })
    if(!supplier){
      throw new NotFoundException(`el proveedor con ${id} no se encuentra`)
    }
    return supplier 
  }

  async supplierNameWithProduct(name:string){
    const supplierName= await this.supplierRepository.findOne({
      where:{name:name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')},
      relations: {ProdSupplier: true}
    })
    if(!supplierName){
      throw new NotFoundException(`el proveedor con ${name} no se encuentra`)
    }
    return supplierName
  }



  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    const supplierUpdate = await this.supplierRepository.findOne({
      where: {id}
    })
    if(!supplierUpdate){
      throw new NotFoundException (`no se encontro el id ${id} del proveedor`)
    }
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
      updateSupplierDto.phone = updateSupplierDto.phone.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    try{
      await this.supplierRepository.update(id,updateSupplierDto)
      return {...supplierUpdate, ...updateSupplierDto}

    }catch(error){
      this.handleException(error, updateSupplierDto.name?? supplierUpdate.name)
    }

  }

  remove(id: number) {
    return `This action removes a #${id} supplier`;
  }

  private handleException(error: any, supplierName:string){
    if(error === '23505'){
      throw new BadRequestException(`ya existe en la base de datos el supplier ${supplierName}`)
    }
    console.log(error)
    throw new InternalServerErrorException(`no creaste una categoria- check server log`)
  }

  



}
