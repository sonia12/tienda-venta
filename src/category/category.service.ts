import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { json } from 'stream/consumers';

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


  findAll() {
    return this.categoryRepository.find()
  }

  async findCategoryById(id: number) {
    const category = await this.categoryRepository.findOne({
      where: {id},
      relations:{prodCategory: true}
    })
    if(!category){
      throw new NotFoundException(`no existe la categoria N° ${id}`)
    }
    return category
  }

  

  async findCategoryByName(name: string){
    
    const categoryName = await this.categoryRepository.findOne({
      where:{name:name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')},
      relations:{prodCategory: true}
    })
    if(!categoryName){
      throw new NotFoundException(`no existe la categoria de name ${name}`)
    }
    return categoryName

  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const categoryUpdate = await this.categoryRepository.findOne({
      where: {id }
    })
    if(!categoryUpdate){
      throw new NotFoundException(`no existe la categoria con id ${id}`)
    }
    if(updateCategoryDto.name){
      updateCategoryDto.name = updateCategoryDto.name.toLocaleLowerCase().trim()
    }
    if(updateCategoryDto.description){
      updateCategoryDto.description = updateCategoryDto.description.toLocaleLowerCase().trim()
    }
    try{
      
    await this.categoryRepository.update(id,updateCategoryDto)
    return{
      ...categoryUpdate, ...updateCategoryDto
    }

    }catch(error){
      this.hadleException(error, updateCategoryDto.name?? categoryUpdate.name)

    }
  }



  remove(id: number) {
    return `This action removes a #${id} category`;
  }


  private hadleException(error:any, categoryName: string){
    if(error.code=== '23505'){
      throw new BadRequestException(`ya existe en la base de datos la categoria ${categoryName}`)

    }
    console.log (error);
    throw new InternalServerErrorException(`no creaste una categoria- check server log`)
  }
}
