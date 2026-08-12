import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
    createSupplierDto.name = createSupplierDto.name.toLocaleLowerCase()
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

  findOne(id: number) {
    return `This action returns a #${id} supplier`;
  }

  update(id: number, updateSupplierDto: UpdateSupplierDto) {
    return `This action updates a #${id} supplier`;
  }

  remove(id: number) {
    return `This action removes a #${id} supplier`;
  }
  private handleException(error: any, supplierName:string){
    if(error === '23505'){
      throw new BadRequestException(`ya existe en la base de datos la categoria ${supplierName}`)
    }
    console.log(error)
    throw new InternalServerErrorException(`no creaste una categoria- check server log`)
  }



}
