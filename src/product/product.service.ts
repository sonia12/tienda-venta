import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../category/entities/category.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { UpdateSupplierDto } from '../supplier/dto/update-supplier.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'validator';

@Injectable()
export class ProductService {

  constructor(
    @InjectRepository(Product)
    private productRepository:Repository<Product>,

    @InjectRepository(Category)
    private categoryRepository:Repository<Category>,

    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>
  ){}

  async create(createProductDto: CreateProductDto) {
    
    createProductDto.name = createProductDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    //encontrar category para crear el producto
      const category = await this.categoryRepository.findOneBy({id:createProductDto.id_category})
      if(!category){
        throw new NotFoundException('la categoria no se encontro')
      }

      //encontrar supplier para crear el producto
      const supplier = await this.supplierRepository.findOneBy({id:createProductDto.id_supplier})
      if(!supplier){
        throw new NotFoundException('el proveedor no se encontro')
      }
    try{
    
      //crea product
      const createProduct = this.productRepository.create({...createProductDto, categoryProd:category, supplierProd:supplier})
      return  await this.productRepository.save(createProduct)

    }catch(error){
      this.handleException(error, createProductDto.name)
    }
  }

  findAll(paginationDto:PaginationDto) {
    const {limit = 10, offset = 0}= paginationDto
    return this.productRepository.find({
      take: limit,
      skip: offset,
      relations:{categoryProd:true, orderProd:true}
    })
  }

  async findOne(term: string) {
    let product:Product| null
    if(isUUID(term)){
      product = await this.productRepository.findOne({
      where: {id:term},
      relations:{supplierProd: true, categoryProd: true}
    })
    }else{
      const normalizar = term.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
      const queryBuilder = this.productRepository.createQueryBuilder('product')
      product = await queryBuilder
      .where('LOWER(product.name) = :name', {name:normalizar})
      .leftJoinAndSelect('product.supplierProd', 'supplierProd')
      .leftJoinAndSelect('product.categoryProd', 'categoryProd')
      .getOne()
    }
    
    if(!product){
      throw new NotFoundException(`no existe el product N° ${term}`)
    }
    return product;
  }



  async update(id: string, updateProductDto: UpdateProductDto) {

    if(updateProductDto.name){
      updateProductDto.name = updateProductDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }

    const produpdate = await this.productRepository.preload({
      id:id, ...updateProductDto
    })
    if(!produpdate){
        throw new NotFoundException(`no existe el producto con id ${id}`)
      }
    
    if (updateProductDto.id_category) {
    const category = await this.categoryRepository.findOne({
      where: { id: updateProductDto.id_category },
    });
      if (!category) {
        throw new NotFoundException(`No existe la categoria con el id ${updateProductDto.id_category}`);
      }
    }
    if(updateProductDto.id_supplier){
      const supplier = await this.supplierRepository.findOne({
        where:{id:updateProductDto.id_supplier}
      })
      if(!supplier){
        throw new NotFoundException(`No existe el proveedor con el id ${updateProductDto.id_supplier}`);
      }

    }
    try{
      await this.productRepository.update(id, updateProductDto)
      return {
        ...produpdate, ...updateProductDto
      }
    }catch(error){
      this.handleException(error,updateProductDto.name?? produpdate.name)

    }
    
  }

  async remove(id: string) {
   const productRemove = await this.productRepository.findOne({
      where: {id}
    })
    if(!productRemove){
      throw new NotFoundException(`no existe el empleado con id ${id}`)
    }
    await this.productRepository.delete(id);

    return {
      message: 'employee eliminada correctamente'
  };
  }


  private handleException(error: any, productName:string){
        if(error === '23505'){
          throw new BadRequestException(`ya existe en la base de datos la categoria ${productName}`)
        }
        console.log(error)
        throw new InternalServerErrorException(`no creaste una categoria- check server log`)
      }
}
