# 🛡️ Aula 16 · Validação de Schemas com Zod no NestJS

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-v10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-v4.x-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 16** da UC *Codificação para Back-End* (SENAI-AP): validação do corpo das requisições com **schemas Zod**, integrada ao NestJS por meio de um **Pipe customizado** (`ZodValidationPipe`), com mensagens de erro claras por campo.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [Zod e Pipes no Nest](#-zod-e-pipes-no-nest)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Endpoint da API](#-endpoint-da-api)
- [Como executar](#-como-executar)
- [Testes e diagnósticos](#-testes-e-diagnósticos)

---

## 🎯 Visão Geral

Este projeto implementa o cadastro de **colaboradores** com validação rigorosa dos dados de entrada. Em vez de validar campo a campo dentro do controller, o formato esperado é descrito em um **schema Zod**, e um **Pipe** do Nest aplica esse schema antes de o handler ser executado. Se qualquer regra for violada, a API responde `400 Bad Request` com a lista de erros por campo.

---

## 🧭 Zod e Pipes no Nest

| Conceito | Descrição |
| :--- | :--- |
| **Schema Zod** | Descreve o formato, os tipos e as regras de cada campo do objeto esperado |
| **`z.infer<typeof schema>`** | Gera automaticamente o tipo TypeScript a partir do schema, sem duplicar definições |
| **`PipeTransform`** | Interface do Nest para classes que validam ou transformam dados antes do handler |
| **`@UsePipes()`** | Aplica um pipe a todos os parâmetros de um handler |
| **`safeParse()`** | Valida sem lançar exceção, retornando `{ success, data }` ou `{ success, error }` |

> 💡 **Vantagem sobre `class-validator`:** o schema Zod é a **única fonte da verdade** — ele valida em tempo de execução e ainda gera o tipo estático usado pelo TypeScript.

---

## 📁 Estrutura do Projeto

```text
aula16-validacao-schemas-com-zod-nestjs/
├── src/
│   ├── app.controller.ts           # Rota raiz, herdada do CLI
│   ├── app.controller.spec.ts
│   ├── app.service.ts
│   ├── app.module.ts               # Módulo raiz
│   ├── colaborador.schema.ts       # Schema Zod e tipo Colaborador
│   ├── colaboradores.controller.ts # Rota POST /colaboradores
│   ├── zod-validation.pipe.ts      # Pipe genérico de validação com Zod
│   └── main.ts                     # Bootstrap da aplicação
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
| `colaborador.schema.ts` | Define as regras de validação e exporta o tipo `Colaborador` |
| `zod-validation.pipe.ts` | Valida o `body` contra um schema e formata os erros em `{ campo, mensagem }` |
| `colaboradores.controller.ts` | Expõe `POST /colaboradores`, aplicando o pipe com o schema do colaborador |
| `app.module.ts` | Registra `ColaboradoresController` no módulo raiz |

### `colaborador.schema.ts`

```typescript
import { z } from 'zod';

export const colaboradorSchema = z.object({
    nome: z.string()
        .min(3, { message: 'O nome deve ter no mínimo 3 letras!' }),
    email: z.email({ message: 'O email deve ser válido!' }),
    idade: z.number({ error: 'A idade deve ser um número válido!' })
        .min(18, { message: 'A idade mínima permitida é 18 anos!' })
        .max(65, { message: 'A idade máxima permitida é 65 anos!' }),
    departamento: z.enum(['TI', 'RH', 'Comercial', 'Financeiro'], {
        error: () => ({ message: 'Departamento deve ser obrigatoriamente TI, RH, Comercial ou Financeiro' }),
    }),
});

export type Colaborador = z.infer<typeof colaboradorSchema>;
```

| Campo | Regras |
| :--- | :--- |
| `nome` | Texto com no mínimo 3 caracteres |
| `email` | Formato de e-mail válido |
| `idade` | Número entre 18 e 65 |
| `departamento` | Um entre `TI`, `RH`, `Comercial` ou `Financeiro` |

### `zod-validation.pipe.ts`

```typescript
import { PipeTransform,
         ArgumentMetadata,
         BadRequestException } from "@nestjs/common";
import { z } from "zod";

export class ZodValidationPipe implements PipeTransform {
    constructor(private z: z.ZodType) {}

    transform(value: unknown, metadata: ArgumentMetadata) {
        if (metadata.type !== 'body') return value;

        const parseResult = this.z.safeParse(value);
        if (!parseResult.success) {
            const formatedErrors = parseResult.error.issues.map((issue) => ({
                campo: issue.path.join('.'),
                mensagem: issue.message,
            }));
            throw new BadRequestException({
                statusCode: 400,
                erros: formatedErrors,
            });
        }
        return parseResult.data;
    }
}
```

> 💡 O pipe só valida parâmetros do tipo `body` (`metadata.type !== 'body'` devolve o valor intacto). Quando a validação passa, ele retorna `parseResult.data`, ou seja, o objeto já validado e tipado.

### `colaboradores.controller.ts`

```typescript
import { Controller, Post, Body, UsePipes } from "@nestjs/common";
import { colaboradorSchema } from "./colaborador.schema.js";
import type { Colaborador } from "./colaborador.schema.js";
import { ZodValidationPipe } from "./zod-validation.pipe.js";

@Controller('colaboradores')
export class ColaboradoresController {
    @Post()
    @UsePipes(new ZodValidationPipe(colaboradorSchema))
    async create(@Body() body: Colaborador) {
        return {
            mensagem: 'Colaborador cadastro com sucesso',
            dados: body,
        };
    }
}
```

### `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ColaboradoresController } from './colaboradores.controller.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

@Module({
  imports: [ZodValidationPipe],
  controllers: [AppController, ColaboradoresController],
  providers: [AppService],
})
export class AppModule {}
```

> ⚠️ **Nota técnica:** o `ZodValidationPipe` está listado em `imports`, mas essa propriedade é reservada para **módulos**. Como o pipe é instanciado manualmente no controller (`new ZodValidationPipe(colaboradorSchema)`), essa linha não é necessária para o funcionamento.

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

| Método | Rota | Corpo esperado | Status | Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/colaboradores` | `{ nome, email, idade, departamento }` | `201 Created` | `{ mensagem, dados }` |
| `POST` | `/colaboradores` (dados inválidos) | qualquer corpo que viole o schema | `400 Bad Request` | `{ statusCode: 400, erros: [{ campo, mensagem }] }` |

---

## ▶️ Como executar

### 1. Instalar dependências

```bash
npm install
```

Caso o Zod ainda não esteja instalado no projeto:

```bash
npm install zod
```

### 2. Iniciar o servidor

```bash
npm run start
```

Por padrão, a aplicação sobe em `http://localhost:3000`.

---

## 🧪 Testes e Diagnósticos

### Cadastro válido

```bash
curl -i -X POST http://localhost:3000/colaboradores \
  -H "Content-Type: application/json" \
  -d '{"nome":"Leonardo","email":"leonardo@empresa.com","idade":25,"departamento":"TI"}'
```

*Resposta esperada:*

```json
{
  "mensagem": "Colaborador cadastro com sucesso",
  "dados": {
    "nome": "Leonardo",
    "email": "leonardo@empresa.com",
    "idade": 25,
    "departamento": "TI"
  }
}
```

### Cadastro inválido

```bash
curl -i -X POST http://localhost:3000/colaboradores \
  -H "Content-Type: application/json" \
  -d '{"nome":"Jo","email":"email-invalido","idade":17,"departamento":"Marketing"}'
```

*Resposta esperada:*

```json
{
  "statusCode": 400,
  "erros": [
    { "campo": "nome", "mensagem": "O nome deve ter no mínimo 3 letras!" },
    { "campo": "email", "mensagem": "O email deve ser válido!" },
    { "campo": "idade", "mensagem": "A idade mínima permitida é 18 anos!" },
    { "campo": "departamento", "mensagem": "Departamento deve ser obrigatoriamente TI, RH, Comercial ou Financeiro" }
  ]
}
```

### Tipo de dado incorreto

```bash
curl -i -X POST http://localhost:3000/colaboradores \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria","email":"maria@empresa.com","idade":"vinte","departamento":"RH"}'
```

*Resposta esperada:*

```json
{
  "statusCode": 400,
  "erros": [
    { "campo": "idade", "mensagem": "A idade deve ser um número válido!" }
  ]
}
```

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 16</sub></p>