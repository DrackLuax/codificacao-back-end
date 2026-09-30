import { Controller, Get, Headers, Res } from "@nestjs/common";
import type { Response } from "express";

@Controller('secret')
export class SegurancaController {
    @Get()
    acessAreaSecret(@Headers('y-api-key') apiKey:string, @Res() res: Response){
        if(apiKey === 'FULLSTACK-2026'){
            res.setHeader('y-auth-status', 'verificado');
            return res.status(200).json({
                mensagem:'Acesso concedido a Área Secreta!',
                log:new Date(), 
            });
        }
        return res.status(403).json({
            erro:'Forbidden',
            mensagem:'Chave API inválida ou ausente!',
            log: new Date(),
        });
    }
}