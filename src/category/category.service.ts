import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { json } from 'stream/consumers';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isULID, isUUID } from 'validator';

@Injectable()
export class CategoryService {


  constructor(

    @InjectRepository(Category)
    private categoryRepository:Repository<Category>,
  ){}


  async create(createCategoryDto: CreateCategoryDto) {
    createCategoryDto.name= createCategoryDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')

    try {
    const createCategory= this.categoryRepository.create(createCategoryDto)
    return await this.categoryRepository.save(createCategory)
    }catch (error){
      this.hadleException(error, createCategoryDto.name)
    }
    
  }


  findAll(paginationDto:PaginationDto) {
    const {limit = 10, offset = 0}= paginationDto
    return this.categoryRepository.find({
      take: limit,
      skip: offset
    })
  }

  async findOne(term: string) {

    let category: Category|null;

    if(isUUID(term)){
      category = await this.categoryRepository.findOne({
        where:{id: term},
        relations:{prodCategory: true}
      })

    }else{
      const normalizar = term.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
      const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      category = await queryBuilder
      .where('LOWER(category.name) = :name', {name:normalizar})
      .leftJoinAndSelect('category.prodCategory', 'prodCategory')
      .getOne()
    }
    
    if(!category){
      throw new NotFoundException(`no existe la categoria N° ${term}`)
    }
    return category
  }

  

 

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    if(updateCategoryDto.name){
      updateCategoryDto.name = updateCategoryDto.name.toLocaleLowerCase().trim()
    }
    if(updateCategoryDto.description){
      updateCategoryDto.description = updateCategoryDto.description.toLocaleLowerCase().trim()
    }
    const categoryUpdate = await this.categoryRepository.preload({
      id:id,
      ...updateCategoryDto
    })
    if(!categoryUpdate){
      throw new NotFoundException(`no existe la categoria con id ${id}`)
    }
    
    try{
    await this.categoryRepository.save(categoryUpdate)
    return categoryUpdate

    }catch(error){
      this.hadleException(error, updateCategoryDto.name?? categoryUpdate.name)

    }
  }



  async remove(id: string) {
    const categoryRemove = await this.categoryRepository.findOne({
      where: {id}
    })
    if(!categoryRemove){
      throw new NotFoundException(`no existe la categoria con id ${id}`)
    }
    await this.categoryRepository.delete(id);

    return {
      message: 'Categoría eliminada correctamente'
  };
  }


  private hadleException(error:any, categoryName: string){
    if(error.code=== '23505'){
      throw new BadRequestException(`ya existe en la base de datos la categoria ${categoryName}`)

    }
    console.log (error);
    throw new InternalServerErrorException(`no creaste una categoria- check server log`)
  }
}
