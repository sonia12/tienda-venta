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
import { User } from '../auth/entities/user.entity';
import { IncrementStockDto } from './dto/increment-stock.dto';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

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

  async create(createProductDto: CreateProductDto, user:User) {
    
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
        // extraer valores del usaurio y calcular
      const initialStock = createProductDto.unit_stock || 0;
      const quantityPerUnit = createProductDto.quantity_per_unit || 1;
      const calculatedTotalStock = initialStock * quantityPerUnit;
    
      //crea product
      const createProduct = this.productRepository.create({
        
        ...createProductDto, 
        unit_stock: calculatedTotalStock,
        categoryProd:category, 
        supplierProd:supplier, user})
      
        const savedProd = await this.productRepository.save(createProduct)
        return  {
          message: "se creo el producto con exito",
          id: savedProd.id,
          name: savedProd.name,
          unit_cost: savedProd.unit_cost,
          unit_price: savedProd.unit_price,
          quantityPerUnit: savedProd.quantity_per_unit,
          id_category: savedProd.id_category,
          id_supplier: savedProd.id_supplier,
          created_By_user:{ 
            id: user.id,
            email: user.email,
            name: user.fullname
          }


        }

    }catch(error){
      this.handleException(error, createProductDto.name)
    }
  }

  

  async findAll(paginationDto:PaginationDto, user: User) {
    const {limit = 10, offset = 0}= paginationDto

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        user: true
      }
      
    })
    if (!user) {
    return products.map(product => ({
      id: product.id,
      name: product.name,
      unit_price: product.unit_price,
      unit_stock: product.unit_stock,
      quantity_per_unit: product.quantity_per_unit,
    }));
  }
    if (user.roles.includes(ValidRoles.Employee) && !user.roles.includes(ValidRoles.Admin) && !user.roles.includes(ValidRoles.Owner)) {
    return products.map(product => {
      const { user: _, unit_cost, ...productData } = product as any; // Omitimos el objeto user creador
      return productData;
    });
  }
    return products.map(product => {
    const {user, ...productData} = product as any
    return {
        ...productData,
      registeredBy: {
        id: user.id,
        name: user.fullname,

    }
  }
  
  });

    
  }

  async findOne(term: string, user : User) {
    let product:Product| null
    if(isUUID(term)){
      product = await this.productRepository.findOne({
      where: {id:term},
      relations: { user:true}
      
    })
    }else{
      const normalizar = term.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
      const queryBuilder = this.productRepository.createQueryBuilder('product')
      product = await queryBuilder

      .where('LOWER(product.name) = :name', {name:normalizar})
      .leftJoinAndSelect('product.user', 'user')
      .getOne()
    }
    
    if(!product){
      throw new NotFoundException(`no existe el product N° ${term}`)
    }

    if (!user) {
    return {
      id: product.id,
      name: product.name,
      unit_price: product.unit_price,
      unit_stock: product.unit_stock,
      quantity_per_unit: product.quantity_per_unit,
    }
    }
    if(user.roles.includes(ValidRoles.Employee) && !user.roles.includes(ValidRoles.Admin) && !user.roles.includes(ValidRoles.Owner)){
      
      const { user: _, unit_cost, ...productData } = product as any; // Omitimos el objeto user creador
      return productData;
  }
  
    const {user: creatorUser, ...productData} = product as any
    return {
        ...productData,
      registeredBy: {
        id: creatorUser.id,
        name: creatorUser.fullname,

    
  }
  
  };


  }



  async update(id: string, updateProductDto: UpdateProductDto, user:User) {

    if(updateProductDto.name){
      updateProductDto.name = updateProductDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }

    const produpdate = await this.productRepository.preload({
      id:id, ...updateProductDto, user
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
      const updatedProduct = await this.productRepository.save(produpdate)
      
      const {user, ...productData }= updatedProduct as any
      return {
        message: "se actualizo con exito los datos del producto",
        ...productData, 
        registeredBy:{
          id:user.id,
          name: user.fullname
        }
      }
    }catch(error){
      this.handleException(error,updateProductDto.name?? produpdate.name)

    }
    
  }
  async incrementStock(id: string, incrementStock:IncrementStockDto){
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
    throw new NotFoundException(`No se encontró el producto con el ID: ${id}`);
  }
     
      // multiplica si hay un per unit si no defecto 1 
    const multiplier = incrementStock.quantity_per_unit_add ||1
    const totalToAdd = incrementStock.stockToAdd * multiplier

    await this.productRepository.increment(
    { id },
    'unit_stock',
    totalToAdd
  )
  return await this.productRepository.findOneBy({ id });

  }

  


  private handleException(error: any, productName:string){
        if(error === '23505'){
          throw new BadRequestException(`ya existe en la base de datos la categoria ${productName}`)
        }
        console.log(error)
        throw new InternalServerErrorException(`no creaste una categoria- check server log`)
      }
}
