import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
    createCategoryDto.name= createCategoryDto.name.toLocaleLowerCase()

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

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
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
