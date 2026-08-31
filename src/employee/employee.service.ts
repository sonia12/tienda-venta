import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
    createEmployeeDto.name = createEmployeeDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    try{
      const createEmployee = this.employeeRepository.create(createEmployeeDto)
      return this.employeeRepository.save(createEmployee)
    }catch(error){
      this.handleException(error, createEmployeeDto.name)
    }
  }

  findAll() {
    return this.employeeRepository.find({
      relations:{subordinates:true, ordEmployee:true}
    });
  }

  async findOneById(id: number) {
    const employee = await this.employeeRepository.findOne({
      where: {id},
      relations: {ordEmployee: true}
    })
    if(!employee){
      throw new NotFoundException(`el empleado con el ${id} no se encontro`)
    }

    return employee ;
  }

   async findEmployeeName(name: string){
    
    const employeeName = await this.employeeRepository.findOne({
      where:{name:name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')},
      relations:{ordEmployee: true}
    })
    if(!employeeName){
      throw new NotFoundException(`no existe el empleado de name ${name}`)
    }
    return employeeName

  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const emploUpdate = await this.employeeRepository.findOne({
      where: {id}
    })
    if(!emploUpdate){
      throw new NotFoundException(`no se encontro el empleado con el id ${id} `)
    }
    if(updateEmployeeDto.name){
      updateEmployeeDto.name = updateEmployeeDto.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    if(updateEmployeeDto.lastnaame){
      updateEmployeeDto.lastnaame = updateEmployeeDto.lastnaame.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    if(updateEmployeeDto.title){
      updateEmployeeDto.title = updateEmployeeDto.title.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    if(updateEmployeeDto.adress){
      updateEmployeeDto.adress=updateEmployeeDto.adress.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    if(updateEmployeeDto.phone){
      updateEmployeeDto.phone=updateEmployeeDto.phone.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
    }
    try{
      await this.employeeRepository.update(id,updateEmployeeDto)
      return{...emploUpdate, ...updateEmployeeDto}

    }catch(error){
      this.handleException(error,updateEmployeeDto.name?? emploUpdate.name)
    }
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
