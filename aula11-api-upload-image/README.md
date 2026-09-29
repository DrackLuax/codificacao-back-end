# 🖼️ Aula 11 · Upload de Arquivos no NestJS

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-v10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-Upload-FF6600?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 11** da UC *Codificação para Back-End* (SENAI-AP): upload de arquivos no NestJS com **Multer**, validação de tipo (`fileFilter`) e tamanho (`limits`), nomes de arquivo únicos com **UUID** e disponibilização estática dos arquivos enviados.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [Como funciona o upload](#-como-funciona-o-upload)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Endpoint da API](#-endpoint-da-api)
- [Como executar](#-como-executar)
- [Testes e diagnósticos](#-testes-e-diagnósticos)

---

## 🎯 Visão Geral

Este projeto implementa um endpoint de **upload de imagens**, integrando o NestJS ao **Multer** através do `FileInterceptor`. O arquivo recebido é validado por tipo MIME e tamanho máximo, salvo em disco com um nome único gerado via `uuid`, e disponibilizado publicamente através de uma rota estática configurada no `main.ts`.

---

## 🧭 Como funciona o upload

| Etapa | Responsável | Descrição |
| :--- | :--- | :--- |
| 1. Interceptação | `FileInterceptor('file', ...)` | Intercepta o campo `file` do `multipart/form-data` antes de chegar ao handler |
| 2. Armazenamento | `diskStorage` (Multer) | Define a pasta de destino (`./uploads`) e o nome do arquivo salvo |
| 3. Nomeação única | `uuidv4() + extname(...)` | Evita colisão de nomes, preservando a extensão original |
| 4. Validação de tipo | `fileFilter` | Aceita apenas `jpg`, `jpeg`, `png`, `gif` e `webp`; rejeita o restante com `BadRequestException` |
| 5. Validação de tamanho | `limits.fileSize` | Limita o upload a **2 MB** (`2 * 1024 * 1024` bytes) |
| 6. Exposição pública | `app.useStaticAssets()` | Serve a pasta `uploads/` como arquivos estáticos sob o prefixo `api/uploads/` |

---

## 📁 Estrutura do Projeto

```text
aula11-upload-imagem/
├── src/
│   ├── app.controller.ts          # Rota raiz, herdada das aulas anteriores
│   ├── app.controller.spec.ts     # Teste do controller principal
│   ├── app.service.ts             # Mensagem de status do servidor
│   ├── app.module.ts              # Módulo raiz, registra ImagemController
│   ├── imagem.controller.ts       # Rota POST /imagem/upload
│   ├── imagem.module.ts           # Módulo dedicado ao recurso de imagem
│   └── main.ts                    # Bootstrap com NestExpressApplication e assets estáticos
├── uploads/                        # Pasta onde as imagens enviadas são salvas
├── test/                           # Testes e2e gerados pelo CLI
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
| `imagem.controller.ts` | Expõe `POST /imagem/upload`, configura o `FileInterceptor` (storage, limits, fileFilter) e retorna os metadados do arquivo salvo |
| `imagem.module.ts` | Módulo dedicado que registra o `ImagemController` isoladamente |
| `app.module.ts` | Módulo raiz que registra `ImagemController` diretamente e habilita a instrumentação via `createObserveModule` |
| `main.ts` | Usa `NestExpressApplication` para habilitar `useStaticAssets`, servindo a pasta `uploads/` publicamente |

### `imagem.controller.ts`

```typescript
import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from "path";

@Controller('imagem')
export class ImagemController {
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const nomeArquivo = `${uuidv4()}${extname(file.originalname)}`;
                    callback(null, nomeArquivo);
                },
            }),
            limits: {
                fileSize: 2 * 1024 * 1024
            },
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                    return callback(
                        new BadRequestException('Apenas Arquivos jpg, jpeg, png, gif e webp são suportados!'),
                        false,
                    );
                }
                callback(null, true);
            }
        }),
    )
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Nenhum Arquivo Enviado');
        }
        return {
            filename: file.filename,
            size: file.size,
            url: `http://localhost:3000/api/uploads/${file.filename}`
        };
    }
}
```

### `imagem.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { ImagemController } from "./imagem.controller.js";

@Module({
    controllers: [ImagemController]
})
export class ImagemModule {}
```

### `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ImagemController } from './imagem.controller.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [],
  controllers: [AppController, ImagemController],
  providers: [AppService],
})
export class AppModule {}
```

### `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: 'api/uploads/'
  });

  await app.listen(3000);
  console.log('Aplicação rodando em http://localhost:3000');
}
bootstrap();
```

> ⚠️ **Nota técnica:** `__dirname` só existe nativamente em CommonJS. Como o projeto usa ESM (`"type": "module"`), esse trecho depende de `__dirname` estar disponível via alguma configuração do bundler/CLI do Nest — se o build falhar por isso, o ajuste padrão é derivar o caminho com `fileURLToPath(import.meta.url)` + `dirname()`, como já feito em `main.ts` de aulas anteriores.

---

## 📋 Endpoint da API

| Método | Rota | Corpo | Status | Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/imagem/upload` | `multipart/form-data` com campo `file` | `201 Created` | `{ filename, size, url }` |
| `POST` | `/imagem/upload` (sem arquivo) | — | `400 Bad Request` | `Nenhum Arquivo Enviado` |
| `POST` | `/imagem/upload` (tipo inválido) | arquivo não suportado | `400 Bad Request` | Mensagem sobre formatos aceitos |
| `POST` | `/imagem/upload` (arquivo > 2 MB) | — | `413 Payload Too Large` | `{"message":"File too large", "error":"Payload Too Large", "statusCode":413}` |
| `GET` | `/api/uploads/:filename` | — | `200 OK` | Arquivo de imagem servido estaticamente |

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
[Nest] LOG [RoutesResolver] ImagemController {/imagem}:
[Nest] LOG [RouterExplorer] Mapped {/imagem/upload, POST} route
[Nest] LOG [NestApplication] Nest application successfully started
Aplicação rodando em http://localhost:3000
```

---

## 🧪 Testes e Diagnósticos

### Upload válido

```bash
curl -i -X POST http://localhost:3000/imagem/upload \
  -F "file=@./minha-imagem.jpg"
```

*Resposta esperada:*

```json
{
  "filename": "3f2a1c9e-....jpg",
  "size": 84213,
  "url": "http://localhost:3000/api/uploads/3f2a1c9e-....jpg"
}
```

### Arquivo maior que o limite (2 MB)

```bash
curl -i -X POST http://localhost:3000/imagem/upload \
  -F "file=@./arquivo-grande.jpg"
```

*Resposta esperada:*

```json
{
  "message": "File too large",
  "error": "Payload Too Large",
  "statusCode": 413
}
```

### Acessar a imagem enviada

```bash
curl -i http://localhost:3000/api/uploads/3f2a1c9e-....jpg
```

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 11</sub></p>