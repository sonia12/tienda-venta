import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../category/entities/category.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { UpdateSupplierDto } from '../supplier/dto/update-supplier.dto';

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
    createProductDto.name = createProductDto.name.toLocaleLowerCase()
    try{
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
      
      //crea product
      const createProduct = this.productRepository.create({...createProductDto, categoryProd:category, supplierProd:supplier})
      return this.productRepository.save(createProduct)

    }catch(error){
      this.handleException(error, createProductDto.name)
    }
  }

  findAll() {
    return this.productRepository.find({
      relations:{categoryProd:true, orderProd:true}
    })
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: {id},
      relations:{supplierProd: true, categoryProd: true}
    })
    if(!product){
      throw new NotFoundException(`el producto con id ${id} no se encontro`)
    }
    return product;
  }

  async findNameWithProd(name:string){
    const productName = await this.productRepository.findOne({
      where: {name:name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')},
      relations:{categoryProd: true, supplierProd: true}
    })
    if(!productName){
      throw new NotFoundException(`el producto con id ${name} no se encontro`)
    }
    return productName
  }




  async update(id: number, updateProductDto: UpdateProductDto) {
    const produpdate = await this.productRepository.findOne({
      where: {id}
    })
    if(!produpdate){
        throw new NotFoundException(`no existe el id ${id} del producto`)
      }
    if(updateProductDto.name){
      updateProductDto.name = updateProductDto.name.toLocaleLowerCase().trim()
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

  remove(id: number) {
    return `This action removes a #${id} product`;
  }


  private handleException(error: any, productName:string){
        if(error === '23505'){
          throw new BadRequestException(`ya existe en la base de datos la categoria ${productName}`)
        }
        console.log(error)
        throw new InternalServerErrorException(`no creaste una categoria- check server log`)
      }
}
