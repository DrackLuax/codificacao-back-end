# 📖 Aula 17 · Documentação Técnica com Swagger no NestJS

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-v10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 17** da UC *Codificação para Back-End* (SENAI-AP): geração de **documentação técnica interativa** para uma API NestJS com **Swagger (OpenAPI 3.0)**, usando decorators para descrever rotas, respostas e campos do DTO. Os testes foram feitos diretamente na interface do **Swagger UI**.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [Swagger e OpenAPI](#-swagger-e-openapi)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Endpoint da API](#-endpoint-da-api)
- [Como executar](#-como-executar)
- [Testes no Swagger UI](#-testes-no-swagger-ui)

---

## 🎯 Visão Geral

Este projeto documenta uma **API de Estoque de Alimentos** com uma rota de cadastro de produtos. A documentação é gerada automaticamente a partir do código: o `main.ts` configura o Swagger, o controller descreve a operação e as respostas possíveis, e o DTO descreve cada campo do corpo da requisição com exemplos. O resultado fica disponível em uma página interativa, onde é possível ler e também **executar** as requisições.

---

## 🧭 Swagger e OpenAPI

| Conceito | Descrição |
| :--- | :--- |
| **OpenAPI** | Especificação padrão para descrever APIs REST em formato legível por máquina |
| **Swagger UI** | Interface web que renderiza a especificação e permite testar os endpoints no navegador |
| **`DocumentBuilder`** | Monta a configuração base do documento (título, descrição, versão, tags, autenticação) |
| **`SwaggerModule.setup()`** | Publica a documentação em uma rota da aplicação (aqui, `/docs`) |
| **`@ApiTags()`** | Agrupa as rotas de um controller sob uma tag na interface |
| **`@ApiOperation()`** | Descreve o que a rota faz (`summary`) |
| **`@ApiResponse()`** | Documenta cada status de resposta possível |
| **`@ApiProperty()`** | Descreve um campo do DTO, com `example` e `description` |

---

## 📁 Estrutura do Projeto

```text
aula17-documentação-tecnica-com-swagger-nestjs/
├── src/
│   ├── produtos/
│   │   ├── dto/
│   │   │   └── criar-produto.dto.ts   # DTO documentado com @ApiProperty
│   │   └── produtos.controller.ts     # Rota POST /Produtos documentada
│   ├── app.module.ts                  # Módulo raiz
│   └── main.ts                        # Bootstrap + configuração do Swagger
├── test/
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
| `main.ts` | Cria a aplicação, monta o documento com `DocumentBuilder` e publica o Swagger UI em `/docs` |
| `produtos.controller.ts` | Expõe `POST /Produtos` e documenta a operação e os status `201` e `400` |
| `criar-produto.dto.ts` | Define o corpo esperado (`nome`, `preco`, `categoria`) com exemplos exibidos no Swagger |
| `app.module.ts` | Registra o `ProdutosController` |

### `main.ts`

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API de Estoque de Alimentos')
    .setDescription('Documentação técnica interativa para integração')
    .setVersion('1.0')
    .addTag('Produtos')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
```

| Trecho | Função |
| :--- | :--- |
| `setTitle` / `setDescription` / `setVersion` | Informações exibidas no cabeçalho da documentação |
| `addTag('Produtos')` | Declara uma tag no documento |
| `addBearerAuth()` | Habilita o botão **Authorize** para informar um token Bearer (JWT) |
| `SwaggerModule.setup('docs', ...)` | Publica a interface em `http://localhost:3000/docs` |

### `produtos.controller.ts`

```typescript
import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CriarProdutoDto } from "./dto/criar-produto.dto.js";

@ApiTags('produtos')
@Controller('Produtos')
export class ProdutosController {
    @Post()
    @ApiOperation({
        summary: 'Cadastrar um novo produto no estoque',
    })
    @ApiResponse({
        status: 201,
        description: 'Produto cadastrado com sucesso.',
    })
    @ApiResponse({
        status: 400,
        description: 'Playload enviado contém dados mal formatados e/ou inválidos.',
    })
    async create(@Body() criarprodutodto: CriarProdutoDto) {
        return {
            id: 67,
            ...criarprodutodto,
            criadoEm: new Date().toLocaleDateString(),
        };
    }
}
```

### `criar-produto.dto.ts`

```typescript
import { ApiProperty } from "@nestjs/swagger";

export class CriarProdutoDto {

    //! Nome do produto
    @ApiProperty({
        example: 'Café Grão de Ouro 500g',
        description: 'Nome comercial do produto cadastrado.',
    })
    nome: string;

    //! Preço do produto
    @ApiProperty({
        example: 9.99,
        description: 'Preço unitário do produto',
    })
    preco: number;

    //! Categoria do produto
    @ApiProperty({
        example: 'Alimentos',
        description: 'Categoria do Produto',
    })
    categoria: string;
}
```

### `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ProdutosController } from './produtos/produtos.controller.js';

@Module({
  imports: [],
  controllers: [ProdutosController],
  providers: [],
})
export class AppModule {}
```

---

## 📋 Endpoint da API

| Método | Rota | Corpo esperado | Status | Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/Produtos` | `{ nome, preco, categoria }` | `201 Created` | `{ id, nome, preco, categoria, criadoEm }` |
| `POST` | `/Produtos` (payload inválido) | corpo mal formatado | `400 Bad Request` | Documentado no Swagger via `@ApiResponse` |

| Rota da documentação | Descrição |
| :--- | :--- |
| `GET /docs` | Interface interativa do Swagger UI |

---

## ▶️ Como executar

### 1. Instalar dependências

```bash
npm install
```

Caso o pacote do Swagger ainda não esteja instalado:

```bash
npm install @nestjs/swagger
```

### 2. Iniciar o servidor

```bash
npm run start
```

A API sobe em `http://localhost:3000` e a documentação fica em **`http://localhost:3000/docs`**.

---

## 🧪 Testes no Swagger UI

Os testes desta aula foram feitos na própria interface do **Swagger UI**, acessando `http://localhost:3000/docs` no navegador.

### Passo a passo

1. Abra `http://localhost:3000/docs`.
2. Expanda a rota **`POST /Produtos`**.
3. Clique em **Try it out**.
4. Edite o corpo da requisição, por exemplo:

```json
{
  "nome": "Teclado Mecânico Redragon xyz",
  "preco": 199.99,
  "categoria": "Periférico"
}
```

5. Clique em **Execute** e confira a resposta em **Server response**.

### Requisição gerada pelo Swagger (cURL)

```bash
curl -X 'POST' \
  'http://localhost:3000/Produtos' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "nome": "Teclado Mecânico Redragon xyz",
  "preco": 199.99,
  "categoria": "Periférico"
}'
```

### Resposta obtida — `201 Created`

```json
{
  "id": 67,
  "nome": "Teclado Mecânico Redragon xyz",
  "preco": 199.99,
  "categoria": "Periférico",
  "criadoEm": "16/10/2026"
}
```

A resposta chegou com o header `content-type: application/json; charset=utf-8` e `x-powered-by: Express`.

### Observações

- **Rota com `P` maiúsculo:** o controller usa `@Controller('Produtos')`, então a rota exposta é `/Produtos`. Chamar `/produtos` em minúsculo pode retornar `404`.
- **Dois grupos na interface:** `addTag('Produtos')` (no `main.ts`) e `@ApiTags('produtos')` (no controller) diferem na capitalização. Por isso o Swagger UI exibe dois grupos, **Produtos** e **produtos**. Usar o mesmo nome nos dois lugares unifica o grupo.
- **Botão Authorize:** ele aparece por causa do `addBearerAuth()`, mas nenhuma rota exige autenticação neste projeto. Serve apenas como demonstração da configuração.
- **Sem validação do payload:** o `400` está documentado com `@ApiResponse`, mas o DTO não possui regras de validação. Para a API realmente rejeitar dados inválidos, seria necessário combinar o Swagger com um pipe de validação, como o Zod da aula 16.

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 17</sub></p>