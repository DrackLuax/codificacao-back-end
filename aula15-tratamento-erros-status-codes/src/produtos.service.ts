import { Injectable } from '@nestjs/common';

@Injectable()
export class ProdutosService {
    produtos = [
        {
            id: 1, nome: 'arroz namorados', preco: 9.90
        },
        {
            id: 2, nome: 'feijão timbiras', preco: 19.90
        },
        {
            id: 3, nome: 'macarrão galo', preco: 69.90
        },
        {
            id: 4, nome: 'açúcar união', preco: 89.90
        },
        {
            id: 5, nome: 'sal lebre', preco: 119.90
        },
    ];

    listarProdutos() {
        return this.produtos;
    }
}