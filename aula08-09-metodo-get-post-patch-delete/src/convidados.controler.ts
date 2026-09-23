import { Controller, Get, Post, Body, Patch, Delete, Param, HttpCode } from "@nestjs/common";
import { CriarConvidadoDto } from "./criar-convidado.dto.js";
import { ConvidadosService } from "./convidados.service.js";

@Controller('convidados')
export class ConvidadosController {

    constructor(private readonly convidadosService : ConvidadosService){}

    @Get()
    listarConvidados(){
     return this.convidadosService.listarConvidados();
    }

    @Post()
    criarConvidado(@Body() criarConvidado: CriarConvidadoDto){
        console.log(`[Operadora Nayra] Convidado(a) Registrado(a): ${criarConvidado.nome}`);

        return {
            mensagem: `Convidado(a) ${criarConvidado.nome}, foi adicionado(a) com sucesso!`,
            dados: criarConvidado,
        }
    }

    @Patch(':id')
    atualizarIdade(@Param('id') id:string, @Body('idade') idade:number){
        console.log(`[ADMINISTRADOR] Atualizando idade do ID ${id}`);
        return this.convidadosService.atualizarIdade(+id, idade);
    }

    @Delete(':id')
    @HttpCode(204)
    removerConvidado(@Param('id') id: string){
        console.log(`[ADMINISTRADOR] Convidado com ID ${id} removido com Sucesso!`);
        this.convidadosService.removerConvidadoLista(+id);
    }
}