import { Injectable } from '@nestjs/common';
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


  create(createSupplierDto: CreateSupplierDto) {
    return 'This action adds a new supplier'
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



}
