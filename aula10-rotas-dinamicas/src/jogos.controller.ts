import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { JogosService } from "./jogos.service.js";

@Controller('jogos')
export class JogosController {
    constructor(private readonly jogosService: JogosService){}

    @Get(':id')
    buscarPorId(@Param('id', ParseIntPipe) id:string){
        const numId =+id;
        return this.jogosService.buscarPorId(numId);
    }
}