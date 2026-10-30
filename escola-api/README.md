# Escola API

API REST para gerenciamento de alunos, construída com **NestJS**, **MongoDB** (Mongoose) e validação de dados com **class-validator**.

## Tecnologias

- [NestJS](https://nestjs.com/): framework Node.js
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/) com [Mongoose](https://mongoosejs.com/) (`@nestjs/mongoose`)
- [class-validator](https://github.com/typestack/class-validator) e class-transformer: validação dos dados de entrada
- [Vitest](https://vitest.dev/): testes unitários e e2e
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) e Prettier: lint e formatação

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS)
- [MongoDB](https://www.mongodb.com/try/download/community) rodando localmente na porta `27017`

## Instalação

```bash
# clonar o repositório
git clone <url-do-repositorio>
cd escola-api

# instalar as dependências
npm install
```

## Configuração

A conexão com o banco está definida em `src/app.module.ts`:

```
mongodb://localhost:27017/escola_dbn
```

A porta da aplicação é `3000` por padrão e pode ser alterada pela variável de ambiente `PORT`.

## Executando o projeto

```bash
# desenvolvimento (com reload automático)
npm run start:dev

# produção
npm run build
npm run start:prod
```

A API ficará disponível em `http://localhost:3000`.

## Estrutura do projeto

```
escola-api/
├── src/
│   ├── alunos/
│   │   ├── dto/
│   │   │   ├── create-aluno.dto.ts     # validações para criar aluno
│   │   │   └── update-aluno.dto.ts     # dados para atualizar aluno
│   │   ├── schemas/
│   │   │   └── aluno.schema.ts         # modelo do MongoDB
│   │   ├── aluno.controller.ts         # rotas HTTP
│   │   ├── alunos.module.ts            # módulo de alunos
│   │   └── alunos.service.ts           # regras de negócio (CRUD)
│   ├── app.module.ts                   # módulo raiz e conexão com o banco
│   └── main.ts                         # ponto de entrada da aplicação
├── test/                               # testes e2e
├── vitest.config.ts
├── vitest.config.e2e.ts
└── nest-cli.json
```

## Modelo de dados

Coleção `alunos`:

| Campo       | Tipo       | Obrigatório | Observações                      |
| ----------- | ---------- | :---------: | -------------------------------- |
| `nome`      | `string`   | Sim         | Não pode ser vazio               |
| `idade`     | `number`   | Sim         | Inteiro, mínimo `0`              |
| `matricula` | `string`   | Sim         | **Única** no banco               |
| `cursos`    | `string[]` | Sim         | Pelo menos 1 curso, cada um texto |

## Endpoints

Base: `/alunos`

| Método   | Rota          | Descrição                    |
| -------- | ------------- | ---------------------------- |
| `POST`   | `/alunos`     | Cria um aluno                |
| `GET`    | `/alunos`     | Lista todos os alunos        |
| `GET`    | `/alunos/:id` | Busca um aluno pelo ID       |
| `PATCH`  | `/alunos/:id` | Atualiza um aluno            |
| `DELETE` | `/alunos/:id` | Remove um aluno              |

### Exemplo de requisição

`POST /alunos`

```json
{
  "nome": "Leonardo Queiroz",
  "idade": 18,
  "matricula": "2026TISENAI02",
  "cursos": ["Banco de dados", "Desenvolvimento WEB"]
}
```

Resposta (`201 Created`):

```json
{
  "_id": "6650f1c2a1b2c3d4e5f67890",
  "nome": "Leonardo Queiroz",
  "idade": 18,
  "matricula": "2026TISENAI02",
  "cursos": ["Banco de dados", "Desenvolvimento WEB"],
  "__v": 0
}
```

### Erros comuns

| Status | Quando acontece                                                        |
| ------ | ---------------------------------------------------------------------- |
| `400`  | Dados inválidos (ex.: nome vazio, idade negativa, lista de cursos vazia) |
| `400`  | Campos que não existem no DTO foram enviados                           |
| `404`  | Aluno com o ID informado não foi encontrado                            |

Exemplo de erro de validação:

```json
{
  "message": ["A idade não pode ser negativa."],
  "error": "Bad Request",
  "statusCode": 400
}
```

## Validação

O `ValidationPipe` global (em `src/main.ts`) está configurado com:

- `whitelist: true`: remove campos que não estão no DTO
- `forbidNonWhitelisted: true`: retorna erro `400` se campos extras forem enviados
- `transform: true`: converte o body para a instância do DTO

## Testes

```bash
# testes unitários
npm run test

# testes e2e
npm run test:e2e
```

## Scripts úteis

| Script              | Descrição                         |
| ------------------- | --------------------------------- |
| `npm run start:dev` | Inicia em modo desenvolvimento    |
| `npm run build`     | Compila o projeto para `dist/`    |
| `npm run start:prod`| Executa a versão compilada        |
| `npm run test`      | Executa os testes unitários       |
| `npm run test:e2e`  | Executa os testes e2e             |

## Autor

**Leonardo Queiroz** — Técnico em Desenvolvimento de Sistemas (SENAI)