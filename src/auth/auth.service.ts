import { BadRequestException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDTo } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'validator';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateSupplierDto } from '../supplier/dto/create-supplier.dto';
import { CreateSetupAdminDto } from './dto/create-setup-admin.dto';
import { ValidRoles } from './enums/valid-roles.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // create owner
  async createInitialAdmin(createSetupAdminDto:CreateSetupAdminDto){

  try {
   
    const userCount = await this.userRepository.count();

    if (userCount > 0) {
      throw new ForbiddenException('El sistema ya ha sido configurado. No se permiten más registros iniciales.');
    }

    
    const { password, ...userData } = createSetupAdminDto;

   
    const createUser = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10),
      roles: [ValidRoles.Owner], // Forzamos que el primer usuario sea Admin
    });

    //Guardamos en la base de datos
    await this.userRepository.save(createUser);
   //Ocultamos el password 
    const { password: _, ...userWithoutPass } = createUser;

    return {
      ...userWithoutPass,
      token: this.getJwtToken({ id: createUser.id }),
    };

  } catch (error) {
      this.hadleException(error)
  }

  
  
  }

  // create admin
  async create(createUserDto: CreateUserDTo, user:User) {
    try{

      const owner = await this.userRepository.findOne({
        where: {reportTo: IsNull()}

      })

      if(!owner){
        throw new BadRequestException('Primero se debe configurar el sistema')
      }


      const {password, ...userData}= createUserDto  // desestructurmos, para encriptar el password
      const createUser = this.userRepository.create({
        ...userData, 
        password:bcrypt.hashSync( password, 10 ),
        roles: (createUserDto.roles as ValidRoles[])||[ValidRoles.Admin],
        reportTo: user
        
      })

      await this.userRepository.save(createUser)
      const {password:_, ...userWithoutPass} = createUser  // para que no se muestre el pass 
      return {
          ...userWithoutPass,
              token:this.getJwtToken({id: createUser.id}) //2

      }
          
    }catch(error){
      this.hadleException(error)
    }
  }

  // create empleado

  async createEmployee(createEmployeeDto: CreateEmployeeDto, user:User){
    try{
      const {password,  ...userData} = createEmployeeDto

    const createEmployee = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10),
      roles: [ValidRoles.Employee], 
      reportTo: user
    });

    await this.userRepository.save(createEmployee);

    
    const { password: _, ...userWithoutPass } = createEmployee;

    return {
      ...userWithoutPass,
      token: this.getJwtToken({ id: createEmployee.id }),
    };


    }catch (error){
      this.hadleException(error)

    }
  }

  //desactivar un usuario
  async desactiveUser(targetUserId:string, requestingUser:User){
    // user a desactive
  const targetUser = await this.userRepository.findOne({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw new NotFoundException('El usuario que intentas desactivar no existe.');
  }

  if (requestingUser.roles.includes(ValidRoles.Employee)) {
    throw new ForbiddenException('Los empleados no tienen permisos para desactivar usuarios.');
  }

      //no desactivar al owner
  if (targetUser.roles.includes(ValidRoles.Owner)) {
    throw new ForbiddenException('No se puede desactivar al Owner del sistema.');
  }

  // admin no desactiva owner ni a un admin 
  if (requestingUser.roles.includes(ValidRoles.Admin)) {
  
    if (targetUser.roles.includes(ValidRoles.Admin)) {
      throw new ForbiddenException('Un administrador no puede desactivar a otro administrador.');
    }
  }

  // Si pasa todas las validaciones, procedemos a desactivar
  targetUser.isActive = false;
  await this.userRepository.save(targetUser);

  return {
    message: `El usuario con correo ${targetUser.email} ha sido desactivado exitosamente.`,
    
    
  };
  }


  // activar un usuario

  async activateUser(targetUserId: string, requestingUser: User) {
  const targetUser = await this.userRepository.findOne({
    where: { id: targetUserId }, // buscamos al user a desactivar
  });
  if (!targetUser) {
    throw new NotFoundException('El usuario que intentas activar no existe.');
  }
  if (requestingUser.roles.includes(ValidRoles.Employee)) {  
    throw new ForbiddenException('Los empleados no tienen permisos para activar usuarios.');
  }
    // no modifica al owner
  const isTargetOwner =  targetUser.roles.includes(ValidRoles.Owner);
  if (isTargetOwner) {
    throw new ForbiddenException('No se puede modificar el estado del Owner del sistema.');
  }

  if (requestingUser.roles.includes(ValidRoles.Admin)) {
       // Un Admin NO puede activar a otro Admin
    if (targetUser.roles.includes(ValidRoles.Admin)) {
      throw new ForbiddenException('Un administrador no puede activar a otro administrador.');
    }
  }
   //activamos al user
  targetUser.isActive = true; 
  await this.userRepository.save(targetUser);

  return {
    message: `El usuario con correo ${targetUser.email} ha sido activado exitosamente.`,
  };
}

async findAll(paginationDto: PaginationDto, user: User) {
  const { limit = 10, offset = 0 } = paginationDto;

  if (user.roles.includes(ValidRoles.Owner)) {
   
    return this.userRepository.find({
      take: limit,
      skip: offset,
      where:{
        reportTo:{id:user.id},
        isActive: true,
        id: Not(user.id)
      },
      relations: {
        subordinates: true
      }
    });
  }
  // admin Solo ve a los empleados 
  if (user.roles.includes(ValidRoles.Admin)) {
    return this.userRepository.find({
      take: limit,
      skip: offset,
      where: {
        reportTo: { id: user.id }, // Filtra solo los que reportan a este admin
        isActive: true
      },
      
    });
  }
  return []
}
  

  // update general
  async update(id: string, updateUserDto: UpdateUserDto) {
      
      
    if(updateUserDto.fullname){
        updateUserDto.fullname = updateUserDto.fullname.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
      }
   
    if(updateUserDto.address){
        updateUserDto.address=updateUserDto.address.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[\u0300-\u036f]/g, '')
      }
    if(updateUserDto.phone){
        updateUserDto.phone=updateUserDto.phone.trim()
      }

    if (updateUserDto.password) {
        updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10);
    }
    const {roles, ...restDto} = updateUserDto
    const userUpdate = await this.userRepository.preload({
        id:id, ...restDto,
        ...(roles  &&{roles: updateUserDto.roles as ValidRoles[]})
      })
    if(!userUpdate){
        throw new NotFoundException(`no existe la employee con id ${id}`)
      }
      try{
        await this.userRepository.save(userUpdate)

        const { password, ...userWithoutPass } = userUpdate as any;
        return userWithoutPass
  
      }catch(error){
        this.hadleException(error)
      }
    }


  async login(loginUserDto:LoginUserDto){
    const{email, password} = loginUserDto
    const user = await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true, id:true} //
    })
    if(!user){
      throw new UnauthorizedException('credenciales no validas')
    }
    if(!bcrypt.compareSync( password, user.password )){
      throw new UnauthorizedException('credenciales no validas')
    }
    const {password:_, ...userWithoutPassword} = user
    return {
      ... userWithoutPassword,
      token:this.getJwtToken({id: user.id}) // 2
    }
    
    
  }
  private getJwtToken(payload:JwtPayload){
    const token = this.jwtService.sign(payload)
    return token
  }

  private hadleException(error:any): never{
    // Si ya es una excepción HTTP de NestJS, déjala pasar tal cual
    if (error instanceof HttpException) {
      throw error;
    }


    if(error.code=== '23505'){
      throw new BadRequestException(`ya existe un registro con estos datos ${error.detail}`)

    }
    console.log (error);
    throw new InternalServerErrorException(`por favor revisa el server log`)
  }

  
}
