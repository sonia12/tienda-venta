
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtPayload } from "../../interfaces/jwt-payload.interface";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService
    ){
        super({
            secretOrKey: configService.getOrThrow('JWT_SECRETE'),// throw busca la variable de enviroment si no la encuentra lanza un error
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() // donde mandar el token 
        })
        
    }
    async validate (payload:JwtPayload): Promise<User>{
        const { id } = payload; //3

        const user = await this.userRepository.findOneBy({ id });//3
         if ( !user ) 
            throw new UnauthorizedException('Token not valid')
            
        if ( !user.isActive ) 
            throw new UnauthorizedException('User is inactive, talk with an admin');
        

        return user;
    }
    
}

