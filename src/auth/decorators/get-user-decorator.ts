import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser= createParamDecorator(
    (data:string, ctx: ExecutionContext)=>{
        const req = ctx.switchToHttp().getRequest()// del ctx.switch...  saco la request
        const user = req.user

        if(!user){
            return null
        }
            
    return data ? user[data] : user  //? ternario, si no existe la data regresamos todo el usuario 
})