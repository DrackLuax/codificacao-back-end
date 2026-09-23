# 🎟️ Aula 08-09 · Métodos HTTP no NestJS — GET, POST, PATCH, DELETE

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-v10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo das **Aulas 08 e 09** da UC *Codificação para Back-End* (SENAI-AP): implementação de um **CRUD completo** com NestJS, cobrindo os métodos HTTP `GET`, `POST`, `PATCH` e `DELETE`, uso de **DTOs** para validação de payload e tratamento de erros com `NotFoundException`.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [Métodos HTTP trabalhados](#-métodos-http-trabalhados)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Endpoints da API](#-endpoints-da-api)
- [Como executar](#-como-executar)
- [Testes e diagnósticos](#-testes-e-diagnósticos)

---

## 🎯 Visão Geral

Este projeto evolui a base criada na Aula 07, adicionando um recurso completo de **Convidados**, com operações de listagem, criação, atualização parcial e remoção — os quatro pilares de um CRUD REST. Os dados são mantidos em memória (array no `ConvidadosService`), o que permite focar no entendimento do roteamento e dos decorators HTTP do Nest sem a complexidade de um banco de dados.

---

## 🧭 Métodos HTTP trabalhados

| Método | Decorator Nest | Finalidade |
| :--- | :--- | :--- |
| `GET` | `@Get()` | Listar todos os recursos |
| `POST` | `@Post()` | Criar um novo recurso a partir do corpo da requisição |
| `PATCH` | `@Patch(':id')` | Atualizar parcialmente um recurso existente |
| `DELETE` | `@Delete(':id')` | Remover um recurso, retornando `204 No Content` |

---

## 📁 Estrutura do Projeto

```text
aula08-09-metodo-get-post-patch-delete/
├── src/
│   ├── app.controller.ts          # Rota /status, herdada da aula 07
│   ├── app.controller.spec.ts     # Teste do controller principal
│   ├── app.service.ts             # Mensagem de status do servidor
│   ├── app.module.ts              # Módulo raiz, com instrumentação Observe
│   ├── convidados.controler.ts    # Rota /convidados (GET, POST, PATCH, DELETE)
│   ├── convidados.service.ts      # CRUD em memória dos convidados
│   ├── criar-convidado.dto.ts     # DTO de validação para criação de convidado
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
| `criar-convidado.dto.ts` | Define o formato esperado do corpo da requisição ao criar um convidado |
| `convidados.service.ts` | Mantém a lista de convidados em memória e concentra as regras de negócio (buscar, atualizar, remover) |
| `convidados.controler.ts` | Expõe a rota `/convidados` e delega cada operação ao service |
| `app.module.ts` | Registra `ConvidadosController`/`ConvidadosService` e habilita a instrumentação via `createObserveModule` (`@nestjs/observe`) |

### `criar-convidado.dto.ts`

```typescript
export class CriarConvidadoDto {
    nome: string;
    idade: number;
}
```

### `convidados.service.ts`

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class ConvidadosService {
    private convidados = [
        { id: 1, nome: 'Rebeca', idade: 20 },
        { id: 2, nome: 'Leonardo', idade: 18 },
        { id: 3, nome: 'Sergio', idade: 18 },
        { id: 4, nome: 'Jamily', idade: 22 },
        { id: 5, nome: 'Alvaro', idade: 21 },
    ];

    listarConvidados() {
        return this.convidados;
    }

    encontrarConvidado(id: number) {
        const convidado = this.convidados.find((buscarConvidado) => buscarConvidado.id === id);

        if (!convidado) {
            throw new NotFoundException(`[ADMINISTRADOR] Convidado com ID ${id} não encontrado!`);
        }
        return convidado;
    }

    atualizarIdade(id: number, idade: number) {
        const convidado = this.encontrarConvidado(id);
        convidado.idade = idade;
        return convidado;
    }

    removerConvidadoLista(id: number) {
        const index = this.convidados.findIndex((convidado) => convidado.id === id);

        if (index === -1) {
            throw new NotFoundException(`[ADMINISTRADOR] Convidado com ID ${id} não encontrado!`);
        }
        this.convidados.splice(index, 1);
    }
}
```

### `convidados.controler.ts`

```typescript
import { Controller, Get, Post, Body, Patch, Delete, Param, HttpCode } from "@nestjs/common";
import { CriarConvidadoDto } from "./criar-convidado.dto.js";
import { ConvidadosService } from "./convidados.service.js";

@Controller('convidados')
export class ConvidadosController {

    constructor(private readonly convidadosService: ConvidadosService) {}

    @Get()
    listarConvidados() {
        return this.convidadosService.listarConvidados();
    }

    @Post()
    criarConvidado(@Body() criarConvidado: CriarConvidadoDto) {
        console.log(`[Operadora Nayra] Convidado(a) Registrado(a): ${criarConvidado.nome}`);

        return {
            mensagem: `Convidado(a) ${criarConvidado.nome}, foi adicionado(a) com sucesso!`,
            dados: criarConvidado,
        };
    }

    @Patch(':id')
    atualizarIdade(@Param('id') id: string, @Body('idade') idade: number) {
        console.log(`[ADMINISTRADOR] Atualizando idade do ID ${id}`);
        return this.convidadosService.atualizarIdade(+id, idade);
    }

    @Delete(':id')
    @HttpCode(204)
    removerConvidado(@Param('id') id: string) {
        console.log(`[ADMINISTRADOR] Convidado com ID ${id} removido com Sucesso!`);
        this.convidadosService.removerConvidadoLista(+id);
    }
}
```

> 💡 `@Param('id')` extrai o parâmetro de rota (`:id`), enquanto `@Body()` extrai o corpo inteiro ou, com `@Body('idade')`, apenas o campo `idade` do payload JSON.

### `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConvidadosController } from './convidados.controler.js';
import { ConvidadosService } from './convidados.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [],
  controllers: [AppController, ConvidadosController],
  providers: [AppService, ConvidadosService],
})
export class AppModule {}
```

### `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
```

---

## 📋 Endpoints da API

| Método | Rota | Corpo esperado | Status | Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/status` | — | `200 OK` | `Status: Servidor Ativo!` |
| `GET` | `/convidados` | — | `200 OK` | Lista completa de convidados |
| `POST` | `/convidados` | `{ "nome": string, "idade": number }` | `201 Created` | Mensagem de confirmação + dados enviados |
| `PATCH` | `/convidados/:id` | `{ "idade": number }` | `200 OK` | Convidado atualizado |
| `DELETE` | `/convidados/:id` | — | `204 No Content` | Sem corpo de resposta |

> ⚠️ Em `PATCH` e `DELETE`, um `:id` inexistente resulta em `404 Not Found`, lançado pelo `ConvidadosService` via `NotFoundException`.

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
# Listar convidados
curl -i http://localhost:3000/convidados

# Criar um novo convidado
curl -i -X POST http://localhost:3000/convidados \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana","idade":19}'

# Atualizar a idade do convidado de ID 1
curl -i -X PATCH http://localhost:3000/convidados/1 \
  -H "Content-Type: application/json" \
  -d '{"idade":21}'

# Remover o convidado de ID 5
curl -i -X DELETE http://localhost:3000/convidados/5
```

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aulas 08-09</sub></p>