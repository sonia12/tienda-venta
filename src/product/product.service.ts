import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../category/entities/category.entity';
import { Supplier } from '../supplier/entities/supplier.entity';

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
      //encontrar category
      const category = await this.categoryRepository.findOneBy({id:createProductDto.id_category})
      if(!category){
        throw new NotFoundException('la categoria no se encontro')
      }

      //encontrar supplier
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
    return this.productRepository.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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
