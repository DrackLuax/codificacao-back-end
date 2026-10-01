# 🧱 Aula 13 · Middlewares no NestJS

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-v10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 13** da UC *Codificação para Back-End* (SENAI-AP): criação de um **middleware customizado** no NestJS para logging de requisições e controle de acesso baseado em header, aplicado globalmente via `NestModule`.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [Middlewares no Nest](#-middlewares-no-nest)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Endpoints da API](#-endpoints-da-api)
- [Como executar](#-como-executar)
- [Testes e diagnósticos](#-testes-e-diagnósticos)

---

## 🎯 Visão Geral

Este projeto implementa um **middleware** que intercepta **todas** as requisições antes de chegarem aos controllers: registra o método e a rota de cada chamada no console e, especificamente para a rota `/admin`, valida um header customizado (`x-user-base`) para liberar ou bloquear o acesso — simulando um controle simples de privilégio administrativo.

---

## 🧭 Middlewares no Nest

| Conceito | Descrição |
| :--- | :--- |
| **Middleware** | Função executada **antes** do handler da rota, com acesso a `req`, `res` e `next()` |
| **`NestMiddleware`** | Interface que padroniza a classe de middleware, com o método `use()` |
| **`NestModule`** | Interface implementada pelo módulo para registrar middlewares via `configure()` |
| **`MiddlewareConsumer`** | Objeto usado em `configure()` para aplicar o middleware a rotas específicas |
| **`.forRoutes('*')`** | Aplica o middleware a **todas** as rotas da aplicação |

> 💡 Diferente de um **Guard**, que decide se uma rota pode ser acessada com base em metadados e contexto de execução do Nest, um middleware trabalha em um nível mais baixo, próximo ao Express puro — útil para logging, parsing e validações simples de header, como neste exemplo.

---

## 📁 Estrutura do Projeto

```text
aula13-middlewares-interceptors-nestjs/
├── src/
│   ├── logger/
│   │   ├── logger.middleware.ts       # Middleware de log e controle de acesso
│   │   └── logger.middleware.spec.ts  # Teste do middleware
│   ├── app.controller.ts              # Rotas pública (/) e protegida (/admin)
│   ├── app.controller.spec.ts
│   ├── app.service.ts
│   ├── app.module.ts                  # Registra o LoggerMiddleware globalmente
│   └── main.ts
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
| `logger.middleware.ts` | Loga método e rota de toda requisição; bloqueia `/admin` com `403` se o header `x-user-base` não for `'Administrador'` |
| `app.controller.ts` | Expõe a rota pública `/` e a rota `/admin`, protegida pelo middleware |
| `app.module.ts` | Implementa `NestModule` e registra o `LoggerMiddleware` para todas as rotas (`'*'`) |

### `logger.middleware.ts`

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const currentUrl = req.originalUrl || req.url;
    console.log(`[LOG] Método: ${req.method} | Rota: ${req.path}`);

    if (currentUrl.startsWith('/admin')) {
      const base = req.headers['x-user-base'];
      if (base !== 'Administrador') {
        return res.status(403).json({
          Codigo: 403,
          messagem: 'Acesso Negado: Previlégio de Aministrador necessário',
          registro: new Date(),
        });
      }
    }
    next();
  }
}
```

> ⚠️ A verificação de `/admin` é feita por `startsWith`, então qualquer rota que comece com esse prefixo (ex: `/admin/qualquer-coisa`) também exige o header — vale manter isso em mente ao adicionar novas rotas administrativas.

### `app.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getPublic() {
    return {
      mensagem: 'Rota Pública acessada com sucesso!',
      data: new Date(),
    };
  }

  @Get('admin')
  getPrivate() {
    return {
      mensagem: 'Bem-vindo ao Painel Administrativo',
      data: new Date(),
    };
  }
}
```

### `app.module.ts`

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { LoggerMiddleware } from './logger/logger.middleware.js';

@Module({
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
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

## 📋 Endpoints da API

| Método | Rota | Header obrigatório | Status | Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | — | `200 OK` | `{ mensagem: "Rota Pública acessada com sucesso!", data }` |
| `GET` | `/admin` | `x-user-base: Administrador` | `200 OK` | `{ mensagem: "Bem-vindo ao Painel Administrativo", data }` |
| `GET` | `/admin` | ausente ou diferente de `Administrador` | `403 Forbidden` | `{ Codigo: 403, messagem, registro }` |

Além da resposta, **toda** requisição gera um log no console no formato:

```text
[LOG] Método: GET | Rota: /admin
```

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

Console esperado:

```text
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [RoutesResolver] AppController {/}:
[Nest] LOG [RouterExplorer] Mapped {/, GET} route
[Nest] LOG [RouterExplorer] Mapped {/admin, GET} route
[Nest] LOG [NestApplication] Nest application successfully started
```

---

## 🧪 Testes e Diagnósticos

### Rota pública

```bash
curl -i http://localhost:3000/
```

### Painel administrativo — acesso autorizado

```bash
curl -i http://localhost:3000/admin \
  -H "x-user-base: Administrador"
```

*Resposta esperada:*

```json
{
  "mensagem": "Bem-vindo ao Painel Administrativo",
  "data": "2026-10-01T00:18:07.740Z"
}
```

### Painel administrativo — acesso negado

```bash
curl -i http://localhost:3000/admin
```

*Resposta esperada:*

```json
{
  "Codigo": 403,
  "messagem": "Acesso Negado: Previlégio de Aministrador necessário",
  "registro": "2026-10-01T00:20:00.000Z"
}
```

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 13</sub></p>