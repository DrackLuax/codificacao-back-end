import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CriarProdutoDto } from "./dto/criar-produto.dto.js";

@ApiTags('produtos')
@Controller('Produtos')
export class ProdutosController {
    @Post()
    @ApiOperation({
        summary:'Cadastrar um novo produto no estoque',
    })
    @ApiResponse({
        status: 201,
        description: 'Produto cadastrado com sucesso.'
    })
    @ApiResponse({
        status: 400,
        description:'Playload enviado contém dados mal formatados e/ou inválidos.',
    })
    async create(@Body() criarprodutodto: CriarProdutoDto ){
        return {
            id:67,
            ...criarprodutodto,
            criadoEm: new Date().toLocaleDateString(),
        };
    }
}