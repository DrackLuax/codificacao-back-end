# 🎮 Aula 10 · Rotas Dinâmicas no NestJS

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-v10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 10** da UC *Codificação para Back-End* (SENAI-AP): uso de **rotas dinâmicas** (`@Param()`) no NestJS para buscar um recurso específico por identificador, com validação automática via **Pipe** e tratamento de erro para IDs inexistentes.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [O que são rotas dinâmicas?](#-o-que-são-rotas-dinâmicas)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Endpoints da API](#-endpoints-da-api)
- [Como executar](#-como-executar)
- [Testes e diagnósticos](#-testes-e-diagnósticos)

---

## 🎯 Visão Geral

Este projeto expande a base das aulas anteriores com um novo recurso, **Jogos**, focado especificamente no uso de **parâmetros de rota** para buscar um item individual dentro de uma coleção em memória — reforçando o padrão já visto com `ConvidadosController`, agora com validação automática do parâmetro via `ParseIntPipe`.

---

## 🧭 O que são rotas dinâmicas?

| Conceito | Descrição |
| :--- | :--- |
| **Rota dinâmica** | Segmento de URL representado por um parâmetro (`:id`), capturado em tempo de execução |
| **`@Param('id')`** | Decorator do Nest que extrai o valor do parâmetro de rota da requisição |
| **`ParseIntPipe`** | Pipe embutido do Nest que valida e converte o parâmetro para número **antes** de o handler rodar; se não for numérico, responde `400 Bad Request` automaticamente |

---

## 📁 Estrutura do Projeto

```text
aula10-rotas-dinamicas/
├── src/
│   ├── app.controller.ts          # Rota raiz, herdada das aulas anteriores
│   ├── app.controller.spec.ts     # Teste do controller principal
│   ├── app.service.ts             # Mensagem de status do servidor
│   ├── app.module.ts              # Módulo raiz, com instrumentação Observe
│   ├── jogos.controller.ts        # Rota /jogos/:id (busca dinâmica com ParseIntPipe)
│   ├── jogos.service.ts           # Lista de jogos em memória e busca por ID
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
| `jogos.service.ts` | Mantém a lista de jogos em memória e localiza um jogo pelo `id`, lançando `NotFoundException` se não existir |
| `jogos.controller.ts` | Expõe a rota dinâmica `/jogos/:id`, validando o parâmetro com `ParseIntPipe` antes de repassar ao service |
| `app.module.ts` | Registra `JogosController`/`JogosService` e habilita a instrumentação via `createObserveModule` (`@nestjs/observe`) |

### `jogos.service.ts`

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class JogosService {
    private jogos = [
        { id: 1, titulo: 'Roblox', estudio: 'Roblox Studios' },
        { id: 2, titulo: 'Minecraft', estudio: 'Mojang Studios' },
        { id: 3, titulo: 'Half Life', estudio: 'Valve Corporation' },
        { id: 4, titulo: 'Skyrim', estudio: 'Bethesda' },
        { id: 5, titulo: 'Free Fire', estudio: 'Garena' },
    ];

    buscarPorId(id: number) {
        const jogo = this.jogos.find((j) => j.id === id);
        if (!jogo) {
            throw new NotFoundException(`Jogo com ID ${id} não localizado em nosso estoque.`);
        }
        return jogo;
    }
}
```

### `jogos.controller.ts`

```typescript
import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { JogosService } from "./jogos.service.js";

@Controller('jogos')
export class JogosController {
    constructor(private readonly jogosService: JogosService) {}

    @Get(':id')
    buscarPorId(@Param('id', ParseIntPipe) id: string) {
        const numId = +id;
        return this.jogosService.buscarPorId(numId);
    }
}
```

> 💡 O `ParseIntPipe` já garante, na entrada, que `id` é numérico — retornando `400 Bad Request` automaticamente para valores inválidos como `/jogos/abc`, antes mesmo de o método `buscarPorId` ser executado.

### `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { JogosController } from './jogos.controller.js';
import { JogosService } from './jogos.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [],
  controllers: [AppController, JogosController],
  providers: [AppService, JogosService],
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

| Método | Rota | Status | Resposta |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | `200 OK` | `Status: Servidor Ativo!` |
| `GET` | `/jogos/:id` | `200 OK` | Objeto do jogo encontrado (`id`, `titulo`, `estudio`) |
| `GET` | `/jogos/:id` (ID inexistente) | `404 Not Found` | Mensagem de erro informando que o jogo não foi localizado |
| `GET` | `/jogos/:id` (ID não numérico) | `400 Bad Request` | Erro de validação automática do `ParseIntPipe` |

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
# Buscar o jogo de ID 2
curl -i http://localhost:3000/jogos/2

# Buscar um ID inexistente (deve retornar 404)
curl -i http://localhost:3000/jogos/99

# Buscar com ID inválido (deve retornar 400)
curl -i http://localhost:3000/jogos/abc
```

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 10</sub></p>