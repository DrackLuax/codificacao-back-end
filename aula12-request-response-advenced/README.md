# 🔑 Aula 12 · Headers e Response no NestJS

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-v10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 12** da UC *Codificação para Back-End* (SENAI-AP): leitura de **headers de requisição** com `@Headers()`, controle manual da resposta com `@Res()` do Express, e uma simulação simples de autenticação por chave de API.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [Headers e Response no Nest](#-headers-e-response-no-nest)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Endpoint da API](#-endpoint-da-api)
- [Como executar](#-como-executar)
- [Testes e diagnósticos](#-testes-e-diagnósticos)

---

## 🎯 Visão Geral

Este projeto demonstra como acessar diretamente os **headers HTTP** de uma requisição e como assumir **controle manual da resposta** usando o objeto `Response` do Express (via `@Res()`), em vez de deixar o Nest serializar o retorno automaticamente. O cenário prático é uma rota de "área secreta" protegida por uma chave de API simples enviada em um header customizado.

---

## 🧭 Headers e Response no Nest

| Recurso | Descrição |
| :--- | :--- |
| **`@Headers('nome')`** | Extrai o valor de um header específico da requisição |
| **`@Res()`** | Injeta o objeto `Response` do Express, permitindo controle total sobre status, headers e corpo da resposta |
| **Header customizado de resposta** | `res.setHeader(...)` adiciona um header próprio (`y-auth-status`) na resposta, indicando o resultado da verificação |

> ⚠️ **Atenção:** ao usar `@Res()`, o Nest deixa de gerenciar a resposta automaticamente — é responsabilidade do código chamar `res.status()` / `res.json()` (ou `res.send()`) explicitamente em **todos** os caminhos do método, ou a requisição fica pendente sem resposta.

---

## 📁 Estrutura do Projeto

```text
aula12-request-response/
├── src/
│   ├── app.controller.ts          # Rota /status, herdada das aulas anteriores
│   ├── app.controller.spec.ts     # Teste do controller principal
│   ├── app.service.ts             # Mensagem de status do servidor
│   ├── app.module.ts              # Módulo raiz, registra SegurancaController
│   ├── seguranca.controller.ts    # Rota /secret protegida por header de API key
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
| `seguranca.controller.ts` | Expõe `GET /secret`, lê o header `y-api-key` e responde de acordo com a validade da chave |
| `app.module.ts` | Registra `SegurancaController` junto ao `AppController` no módulo raiz |

### `seguranca.controller.ts`

```typescript
import { Controller, Get, Headers, Res } from "@nestjs/common";
import type { Response } from "express";

@Controller('secret')
export class SegurancaController {
    @Get()
    acessAreaSecret(@Headers('y-api-key') apiKey: string, @Res() res: Response) {
        if (apiKey === 'FULLSTACK-2026') {
            res.setHeader('y-auth-status', 'verificado');
            return res.status(200).json({
                mensagem: 'Acesso concedido a Área Secreta!',
                log: new Date(),
            });
        }
        return res.status(403).json({
            erro: 'Forbidden',
            mensagem: 'Chave API inválida ou ausente!',
            log: new Date(),
        });
    }
}
```

### `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SegurancaController } from './seguranca.controller.js';

@Module({
  imports: [],
  controllers: [AppController, SegurancaController],
  providers: [AppService],
})
export class AppModule {}
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

| Método | Rota | Header obrigatório | Status | Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/status` | — | `200 OK` | `Status: Servidor Ativo!` |
| `GET` | `/secret` | `y-api-key: FULLSTACK-2026` | `200 OK` | `{ mensagem, log }` + header `y-auth-status: verificado` |
| `GET` | `/secret` | ausente ou incorreto | `403 Forbidden` | `{ erro: "Forbidden", mensagem, log }` |

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

### Acesso autorizado

```bash
curl -i http://localhost:3000/secret \
  -H "y-api-key: FULLSTACK-2026"
```

*Resposta esperada:*

```json
{
  "mensagem": "Acesso concedido a Área Secreta!",
  "log": "2026-09-30T12:00:00.000Z"
}
```

### Acesso negado

```bash
curl -i http://localhost:3000/secret \
  -H "y-api-key: chave-errada"
```

*Resposta esperada:*

```json
{
  "erro": "Forbidden",
  "mensagem": "Chave API inválida ou ausente!",
  "log": "2026-09-30T12:00:00.000Z"
}
```

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 12</sub></p>