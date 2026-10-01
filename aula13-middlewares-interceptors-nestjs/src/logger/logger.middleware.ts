import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const currentUrl = req.originalUrl || req.url;
    console.log(`[LOG] Método: ${req.method} | Rota: ${req.path}`)
    if(currentUrl.startsWith('/admin')){
      const base = req.headers['x-user-base'];
      if(base !== 'Administrador'){
        return res.status(403).json({
          Codigo:403,
          messagem: 'Acesso Negado: Previlégio de Aministrador necessário',
          registro: new Date,
        })
      }
    }
    next();
  }
}
