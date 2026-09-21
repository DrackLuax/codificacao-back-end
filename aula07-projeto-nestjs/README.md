# 🐈 Aula 07 · Primeiros Passos com NestJS

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-v10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 07** da UC *Codificação para Back-End* (SENAI-AP): primeiro contato com o framework **NestJS**, sua arquitetura baseada em módulos, controllers e services, e a customização de uma rota inicial gerada pelo CLI oficial.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [Por que NestJS?](#-por-que-nestjs)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Como o projeto foi criado](#-como-o-projeto-foi-criado)
- [Como executar](#-como-executar)
- [Testes e diagnósticos](#-testes-e-diagnósticos)

---

## 🎯 Visão Geral

Este projeto foi gerado com o **Nest CLI** e teve seus arquivos padrão de bootstrap (`app.service.ts` e `app.controller.ts`) ajustados para expor uma rota de status simples, servindo como base para os próximos conteúdos da UC construídos sobre o NestJS.

---

## 🧠 Por que NestJS?

| Característica | Descrição |
| :--- | :--- |
| 🏗️ **Arquitetura opinativa** | Organiza a aplicação em Módulos, Controllers e Services, inspirado no Angular |
| 💉 **Injeção de dependências** | Services são injetados automaticamente nos Controllers via construtor |
| 🔷 **TypeScript nativo** | Tipagem estática desde a criação do projeto, sem configuração manual |
| 🧩 **Decorators** | `@Controller()`, `@Get()`, `@Injectable()` declaram responsabilidades de forma clara e declarativa |

---

## 📁 Estrutura do Projeto

```text
aula07-projeto-nestjs/
├── src/
│   ├── app.controller.ts    # Rota de status da aplicação
│   ├── app.service.ts       # Regra de negócio consumida pelo controller
│   ├── app.module.ts        # Módulo raiz que une controller e service
│   └── main.ts              # Bootstrap da aplicação Nest
├── test/                    # Testes e2e gerados pelo CLI
├── .gitignore
├── .oxlintrc.json
├── .prettierrc
├── nest-cli.json            # Configuração do Nest CLI
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
| `app.service.ts` | Contém a lógica de negócio — método `getHello()` retorna a mensagem de status |
| `app.controller.ts` | Expõe a rota `/status` via `@Controller('status')` e delega a resposta ao service |
| `app.module.ts` | Declara e conecta controller e service no módulo raiz da aplicação |
| `main.ts` | Inicializa a aplicação Nest e a coloca para escutar em uma porta local |

### `app.service.ts`

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Servidor Nest.JS Ativo [Aula]';
  }
}
```

### `app.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller('status')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

> 💡 O decorator `@Injectable()` marca a classe como um **provider** que pode ser injetado; o `@Controller('status')` define o prefixo de rota, e o `@Get()` mapeia o método `getHello()` para requisições `GET /status`.

---

## 🚀 Como o projeto foi criado

1. **Geração via Nest CLI**, dentro da pasta da UC (`codificacao-back-end`):

```bash
npx @nestjs/cli new aula07-projeto-nestjs
```

2. **Ajuste do service e do controller** para retornar uma mensagem de status personalizada na rota `/status`, em vez do "Hello World" padrão.

3. **Remoção do repositório Git interno**, já que o CLI inicializa um `.git` próprio dentro da pasta gerada — o que causaria conflito com o repositório único da UC. Executado a partir da pasta do projeto:

```powershell
Remove-Item -Recurse -Force .git
```

> ⚠️ Esse passo é essencial: sem ele, o Git trataria `aula07-projeto-nestjs` como um **submódulo/repositório aninhado**, e os commits feitos a partir de `codificacao-back-end` não incluiriam corretamente os arquivos dessa pasta.

---

## ▶️ Como executar

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o servidor em modo desenvolvimento

```bash
npm run start
```

Ou, com recarregamento automático:

```bash
npm run start:dev
```

Por padrão, o Nest sobe em `http://localhost:3000`.

---

## 🧪 Testes e Diagnósticos

Com o servidor ativo, acesse a rota configurada:

```bash
curl -i http://localhost:3000/status
```

*Saída esperada:*

```text
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

Servidor Nest.JS Ativo [Aula]
```

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 07</sub></p>