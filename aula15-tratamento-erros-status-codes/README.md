# 🚨 Aula 15 · Tratamento de Erros e Status Codes no NestJS

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-v10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 15** da UC *Codificação para Back-End* (SENAI-AP): tratamento estruturado de erros no NestJS com **exceções HTTP nativas** (`BadRequestException`, `NotFoundException`) e **logging** de eventos relevantes com o `Logger` interno do framework.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [Exceções e status codes](#-exceções-e-status-codes)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Endpoint da API](#-endpoint-da-api)
- [Como executar](#-como-executar)
- [Testes e diagnósticos](#-testes-e-diagnósticos)

---

## 🎯 Visão Geral

Este projeto demonstra como validar entradas e sinalizar erros de forma padronizada em uma API NestJS, usando um cenário de consulta de produtos por ID. Dois cuidados são aplicados antes de retornar o recurso: garantir que o ID informado é um número válido e garantir que o produto realmente existe na base — cada falha gera o status HTTP correto, além de um registro no log do servidor.

---

## 🧭 Exceções e Status Codes

| Exceção Nest | Status HTTP | Quando é lançada |
| :--- | :--- | :--- |
| `BadRequestException` | `400 Bad Request` | O parâmetro `:id` não é um número válido (`isNaN`) |
| `NotFoundException` | `404 Not Found` | O ID é válido, mas nenhum produto corresponde a ele |
| `Logger.warn()` | — | Registra no console cada tentativa inválida, antes de lançar a exceção |

> 💡 Lançar uma exceção nativa do Nest (`throw new BadRequestException(...)`) é suficiente: o framework intercepta automaticamente e monta a resposta JSON padronizada com `statusCode`, `message` e `error`, sem necessidade de um filtro de exceção customizado para este caso.

---

## 📁 Estrutura do Projeto

```text
aula15-tratamento-erros-status-codes/
├── src/
│   ├── app.controller.ts          # Rota /status, herdada das aulas anteriores
│   ├── app.service.ts             # Mensagem de status do servidor
│   ├── app.module.ts              # Módulo raiz, registra ProdutosController
│   ├── produtos.controller.ts     # Rota /produtos/:id com validações e logging
│   ├── produtos.service.ts        # Lista de produtos em memória
│   └── main.ts                    # Bootstrap da aplicação
├── test/                          # Testes e2e gerados pelo CLI
├── .gitignore
├── .oxlintrc.json
├── .prettierrc
├── nest-cli.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
└── vitest.config.e2e.ts
```

---

## 🛠️ Componentes

| Arquivo | Responsabilidade |
| :--- | :--- |
| `produtos.service.ts` | Mantém a lista de produtos em memória (`id`, `nome`, `preco`) |
| `produtos.controller.ts` | Expõe `GET /produtos/:id`, valida o parâmetro e busca o produto correspondente |
| `app.module.ts` | Registra `ProdutosController`/`ProdutosService` junto ao `AppController` |

### `produtos.service.ts`

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProdutosService {
    produtos = [
        { id: 1, nome: 'arroz namorados', preco: 9.90 },
        { id: 2, nome: 'feijão timbiras', preco: 19.90 },
        { id: 3, nome: 'macarrão galo', preco: 69.90 },
        { id: 4, nome: 'açúcar união', preco: 89.90 },
        { id: 5, nome: 'sal lebre', preco: 119.90 },
    ];

    listarProdutos() {
        return this.produtos;
    }
}
```

### `produtos.controller.ts`

```typescript
import { Controller,
         Get,
         Param,
         BadRequestException,
         NotFoundException,
         Logger } from "@nestjs/common";
import { ProdutosService } from "./produtos.service.js";

@Controller('produtos')
export class ProdutosController {
    private readonly logger = new Logger(ProdutosController.name);
    constructor(private readonly produtosService: ProdutosService) {}

    produtos() {
        return this.produtosService.listarProdutos();
    }

    @Get(':id')
    buscarProdutos(@Param('id') idProduto: string) {
        const id = Number(idProduto);

        if (isNaN(id)) {
            this.logger.warn(`Tentativa de busca com ID ${idProduto} não numérico.`);
            throw new BadRequestException('O ID do produto deve ser um número inteiro.');
        }
        const produto = this.produtos().find((produto) => produto.id === id);
        if (!produto) {
            this.logger.warn(`Produto com ID ${id} não localizado.`);
            throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
        }
        return produto;
    }
}
```

> ⚠️ **Nota técnica:** o método `produtos()` não tem o decorator `@Get()`, então **não é exposto como rota HTTP** — ele funciona apenas como um atalho interno, chamado por `buscarProdutos()` para obter a lista completa antes de filtrar pelo ID. Na prática, este projeto expõe apenas a busca individual (`/produtos/:id`); para listar todos os produtos via rota, seria necessário adicionar `@Get()` a esse método.

### `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProdutosService } from './produtos.service.js';
import { ProdutosController } from './produtos.controller.js';

@Module({
  imports: [],
  controllers: [AppController, ProdutosController],
  providers: [AppService, ProdutosService],
})
export class AppModule {}
```

### `app.controller.ts` / `app.service.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller('status')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getStatus();
  }
}
```

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): string {
    return 'Servidor Ativo!';
  }
}
```

### `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
```

---

## 📋 Endpoint da API

| Método | Rota | Status | Resposta |
| :--- | :--- | :--- | :--- |
| `GET` | `/status` | `200 OK` | `Servidor Ativo!` |
| `GET` | `/produtos/:id` | `200 OK` | Objeto do produto (`id`, `nome`, `preco`) |
| `GET` | `/produtos/:id` (ID não numérico) | `400 Bad Request` | `O ID do produto deve ser um número inteiro.` |
| `GET` | `/produtos/:id` (ID inexistente) | `404 Not Found` | `Produto com ID {id} não encontrado.` |

---

## ▶️ Como executar

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o servidor

```bash
npm run start
```

Por padrão, a aplicação sobe em `http://localhost:3000`.

---

## 🧪 Testes e Diagnósticos

```bash
# Produto existente
curl -i http://localhost:3000/produtos/3

# ID não numérico (400)
curl -i http://localhost:3000/produtos/abc

# ID numérico, produto inexistente (404)
curl -i http://localhost:3000/produtos/99
```

Cada tentativa inválida também gera um log de aviso no console do servidor, por exemplo:

```text
[Nest] WARN [ProdutosController] Produto com ID 99 não localizado.
```

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 15</sub></p>