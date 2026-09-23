import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'validator';

@Injectable()
export class EmployeeService {

  constructor(
     @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ){}


  create(createEmployeeDto: CreateEmployeeDto) {
    createEmployeeDto.name = createEmployeeDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    try{
      const createEmployee = this.employeeRepository.create(createEmployeeDto)
      return this.employeeRepository.save(createEmployee)
    }catch(error){
      this.handleException(error, createEmployeeDto.name)
    }
  }

  findAll(paginationDto:PaginationDto) {
    const {limit = 10, offset = 0}= paginationDto
    return this.employeeRepository.find({
      take: limit,
      skip: offset,
      relations:{subordinates:true, ordEmployee:true}
    });
  }

  async findOne(term: string) {
    let employee: Employee|null
    if(isUUID(term)){
      employee = await this.employeeRepository.findOne({
      where: {id: term},
      relations: {subordinates:true,ordEmployee: true}
    })

    }else{
      const normalizar = term.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
      const queryBuilder = this.employeeRepository.createQueryBuilder('employee')
      employee = await queryBuilder
      .where('LOWER(employee.name) = :name', {name:normalizar})
      .orWhere('employee.phone = :phone',{phone: term.trim()})
      
      .leftJoinAndSelect('employee.subordinates', 'subordinate')
      .leftJoinAndSelect('employee.ordEmployee','ordEmployee')
      .getOne()
    }
    
    if(!employee){
      throw new NotFoundException(`no existe la empleado N° ${term}`)
    }

    return employee;
  }

   
  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    
    
    if(updateEmployeeDto.name){
      updateEmployeeDto.name = updateEmployeeDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    if(updateEmployeeDto.lastname){
      updateEmployeeDto.lastname = updateEmployeeDto.lastname.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    if(updateEmployeeDto.title){
      updateEmployeeDto.title = updateEmployeeDto.title.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    if(updateEmployeeDto.address){
      updateEmployeeDto.address=updateEmployeeDto.address.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    if(updateEmployeeDto.phone){
      updateEmployeeDto.phone=updateEmployeeDto.phone.trim()
    }
    const emploUpdate = await this.employeeRepository.preload({
      id:id, ...updateEmployeeDto
    })
    if(!emploUpdate){
      throw new NotFoundException(`no existe la employee con id ${id}`)
    }
    try{
      await this.employeeRepository.update(id,updateEmployeeDto)
      return{...emploUpdate, ...updateEmployeeDto}

    }catch(error){
      this.handleException(error,updateEmployeeDto.name?? emploUpdate.name)
    }
  }

  async remove(id: string) {
    const employeeRemove = await this.employeeRepository.findOne({
      where: {id}
    })
    if(!employeeRemove){
      throw new NotFoundException(`no existe el empleado con id ${id}`)
    }
    await this.employeeRepository.delete(id);

    return {
      message: 'employee eliminada correctamente'
  };
  }

  private handleException(error: any, employeeName:string){
      if(error === '23505'){
        throw new BadRequestException(`ya existe en la base de datos la categoria ${employeeName}`)
      }
      console.log(error)
      throw new InternalServerErrorException(`no creaste una categoria- check server log`)
    }
}
