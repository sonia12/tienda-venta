import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeeService {

  constructor(
     @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ){}


  create(createEmployeeDto: CreateEmployeeDto) {
    createEmployeeDto.name = createEmployeeDto.name.toLocaleLowerCase()
    try{
      const createEmployee = this.employeeRepository.create(createEmployeeDto)
      return this.employeeRepository.save(createEmployee)
    }catch(error){
      this.handleException(error, createEmployeeDto.name)
    }
  }

  findAll() {
    return this.employeeRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} employee`;
  }

  update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return `This action updates a #${id} employee`;
  }

  remove(id: number) {
    return `This action removes a #${id} employee`;
  }

  private handleException(error: any, employeeName:string){
      if(error === '23505'){
        throw new BadRequestException(`ya existe en la base de datos la categoria ${employeeName}`)
      }
      console.log(error)
      throw new InternalServerErrorException(`no creaste una categoria- check server log`)
    }
}
