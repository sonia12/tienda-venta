import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { json } from 'stream/consumers';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isULID, isUUID } from 'validator';
import { User } from '../auth/entities/user.entity';


@Injectable()
export class CategoryService {


  constructor(

    @InjectRepository(Category)
    private categoryRepository:Repository<Category>,
  ){}


  async create(createCategoryDto: CreateCategoryDto, user:User) {
    createCategoryDto.name= createCategoryDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')

    try {
    
      const createCategory= this.categoryRepository.create({
      ...createCategoryDto, user})
      const savedCategory = await this.categoryRepository.save(createCategory)
      return {
        mesaage: "la categoria se creo con exito",
        id: savedCategory.id,
        name: savedCategory.name,
        description: savedCategory.description,
        by_user:{
          id: user.id,
          name: user.fullname
        }
      }
    }catch (error){
      this.hadleException(error, createCategoryDto.name)
    }
    
  }


  findAll(paginationDto:PaginationDto ) {
    const {limit = 10, offset = 0}= paginationDto
    return this.categoryRepository.find({
      take: limit,
      skip: offset
    })
  }

  async findOne(term: string, isAdmin: boolean) {

    let category: any;

    if(isUUID(term)){
      category = await this.categoryRepository.findOne({
        where:{id: term},
        relations:{products: true}
      })

    }else{
      const normalizar = term.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
      const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      category = await queryBuilder
      .where('LOWER(category.name) = :name', {name:normalizar})
      .leftJoinAndSelect('category.products', 'products')
      .getOne()
    }
    
    if(!category){
      throw new NotFoundException(`no existe la categoria N° ${term}`)
    }

    if (!isAdmin) {
      if (category.products && Array.isArray(category.products)) {
            category.products = category.products.map(product => {
                const { unit_cost, id_category,id_supplier, ...productWithoutCost } = product;
                return productWithoutCost;
            });
        }

      
    const { unit_cost, ...productWithoutCost } = category ;
    return productWithoutCost;
    }

    return category
  }

  

 

  async update(id: string, updateCategoryDto: UpdateCategoryDto, user:User) {
    if(updateCategoryDto.name){
      updateCategoryDto.name = updateCategoryDto.name.toLocaleLowerCase().trim()
    }
    if(updateCategoryDto.description){
      updateCategoryDto.description = updateCategoryDto.description.toLocaleLowerCase().trim()
    }
    const categoryUpdate = await this.categoryRepository.preload({
      id:id,
      ...updateCategoryDto, user
    })
    if(!categoryUpdate){
      throw new NotFoundException(`no existe la categoria con id ${id}`)
    }
    
    try{
    const updateCategory = await this.categoryRepository.save(categoryUpdate)
    return {
      message: "Se actualizo la categoria con exito",
      id: updateCategory.id,
      name: updateCategory.name,
      description: updateCategory.description,
      isActive: updateCategory.isActive,
      by_user:{
        id:user.id,
        name: user.fullname
      }
    }

    }catch(error){
      this.hadleException(error, updateCategoryDto.name?? categoryUpdate.name)

    }
  }


  private hadleException(error:any, categoryName: string){
    if(error.code=== '23505'){
      throw new BadRequestException(`ya existe en la base de datos la categoria ${categoryName}`)

    }
    console.log (error);
    throw new InternalServerErrorException(`no creaste una categoria- check server log`)
  }
}
