import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionAuthGuard extends AuthGuard('jwt'){
    handleRequest(err, user){
        // Si hubo un error real (ej. token expirado, firma falsa, etc.), 
    // lanzamos el error para que el cliente sepa que su token no sirve.
    if (err) {
      throw err;
    }

    // Si simplemente el usuario no mandó token (es un visitante anónimo), 
    // no hay error, simplemente devolvemos null de forma segura.
    if (!user) {
      return null;
    }

    // Si todo salió bien y el token es válido, devolvemos el usuario completo.
    return user;
    }
}