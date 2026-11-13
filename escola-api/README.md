# Escola API

API REST para gerenciamento de alunos, construída com **NestJS**, **MongoDB** (Mongoose), validação de dados com **class-validator** e documentação interativa com **Swagger**.

## Tecnologias

- [NestJS](https://nestjs.com/): framework Node.js
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/) com [Mongoose](https://mongoosejs.com/) (`@nestjs/mongoose`)
- [class-validator](https://github.com/typestack/class-validator) e class-transformer: validação dos dados de entrada
- [Swagger](https://swagger.io/) (`@nestjs/swagger`): documentação interativa da API
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

## Documentação (Swagger)

Com a aplicação rodando, a documentação interativa fica em:

```
http://localhost:3000/docs
```

Por ela é possível consultar todas as rotas, ver os campos esperados (com exemplos) e executar as requisições direto no navegador.

## Estrutura do projeto

```
escola-api/
├── src/
│   ├── alunos/
│   │   ├── dto/
│   │   │   ├── create-aluno.dto.ts     # validações e exemplos (Swagger) para criar aluno
│   │   │   └── update-aluno.dto.ts     # dados para atualizar aluno
│   │   ├── schemas/
│   │   │   └── aluno.schema.ts         # modelo do MongoDB
│   │   ├── aluno.controller.ts         # rotas HTTP e documentação Swagger
│   │   ├── alunos.module.ts            # módulo de alunos
│   │   └── alunos.service.ts           # regras de negócio (CRUD, filtros, ordenação e paginação)
│   ├── app.module.ts                   # módulo raiz e conexão com o banco
│   └── main.ts                         # ponto de entrada da aplicação
├── test/                               # testes e2e
├── vitest.config.ts
├── vitest.config.e2e.ts
└── nest-cli.json
```

## Modelo de dados

Coleção `alunos`:

| Campo       | Tipo       | Obrigatório | Observações                       |
| ----------- | ---------- | :---------: | --------------------------------- |
| `nome`      | `string`   | Sim         | Não pode ser vazio                |
| `idade`     | `number`   | Sim         | Inteiro, mínimo `0`               |
| `matricula` | `string`   | Sim         | **Única** no banco                |
| `cursos`    | `string[]` | Sim         | Pelo menos 1 curso, cada um texto |

## Endpoints

Base: `/alunos`

| Método   | Rota          | Descrição                                              |
| -------- | ------------- | ------------------------------------------------------ |
| `POST`   | `/alunos`     | Cria um aluno                                          |
| `GET`    | `/alunos`     | Lista alunos com paginação, filtros e ordenação        |
| `GET`    | `/alunos/:id` | Busca um aluno pelo ID                                 |
| `PATCH`  | `/alunos/:id` | Atualiza um aluno                                      |
| `DELETE` | `/alunos/:id` | Remove um aluno                                        |

### Criar aluno

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

Como a `matricula` é única, cadastrar um segundo aluno com a mesma matrícula retorna `409 Conflict`:

```json
{
  "message": "Já existe um aluno cadastrado com essa matricula",
  "error": "Conflict",
  "statusCode": 409
}
```

### Listar alunos

`GET /alunos`

Todos os parâmetros são opcionais:

| Parâmetro        | Tipo     | Padrão | Descrição                                                         |
| ---------------- | -------- | :----: | ----------------------------------------------------------------- |
| `page`           | `number` | `1`    | Número da página                                                  |
| `limit`          | `number` | `10`   | Quantidade de itens por página                                    |
| `nome`           | `string` | —      | Filtra pelo nome (contém o texto, sem diferenciar maiúsculas)     |
| `curso`          | `string` | —      | Filtra alunos matriculados no curso informado (nome exato)        |
| `orderBy`        | `string` | —      | Campo usado na ordenação: `nome`, `idade` ou `matricula`          |
| `orderDirection` | `string` | `asc`  | `asc` para crescente e `desc` para decrescente                    |

Exemplo:

```
GET /alunos?page=1&limit=5&nome=leo&curso=Banco%20de%20dados&orderBy=nome&orderDirection=asc
```

Resposta (`200 OK`):

```json
{
  "data": [
    {
      "_id": "6650f1c2a1b2c3d4e5f67890",
      "nome": "Leonardo Queiroz",
      "idade": 18,
      "matricula": "2026TISENAI02",
      "cursos": ["Banco de dados", "Desenvolvimento WEB"],
      "__v": 0
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 5,
    "totalPages": 1
  }
}
```

O campo `total` considera os filtros aplicados. Quando nenhum aluno é encontrado, a resposta continua sendo `200 OK`, com `data` vazio e `total` igual a `0`.

### Erros comuns

| Status | Quando acontece                                                          |
| ------ | ------------------------------------------------------------------------ |
| `400`  | Dados inválidos (ex.: nome vazio, idade negativa, lista de cursos vazia) |
| `400`  | Campos que não existem no DTO foram enviados                             |
| `400`  | `page` ou `limit` não são números inteiros                               |
| `404`  | Aluno com o ID informado não foi encontrado                              |
| `409`  | Já existe um aluno cadastrado com a mesma matrícula                      |
| `500`  | Falha inesperada ao processar o cadastro do aluno                        |

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

Na listagem, os parâmetros `page` e `limit` são validados com `ParseIntPipe` e recebem valores padrão com `DefaultValuePipe`.

## Tratamento de erros

O cadastro captura as falhas do MongoDB no `AlunosService`:

- Erro de chave duplicada (código `11000`, matrícula repetida): vira `ConflictException` (`409`).
- Qualquer outra falha ao salvar: vira `InternalServerErrorException` (`500`).

As buscas, atualizações e remoções lançam `NotFoundException` (`404`) quando o ID não existe.

## Testes

```bash
# testes unitários
npm run test

# testes e2e
npm run test:e2e
```

## Scripts úteis

| Script               | Descrição                      |
| -------------------- | ------------------------------ |
| `npm run start:dev`  | Inicia em modo desenvolvimento |
| `npm run build`      | Compila o projeto para `dist/` |
| `npm run start:prod` | Executa a versão compilada     |
| `npm run test`       | Executa os testes unitários    |
| `npm run test:e2e`   | Executa os testes e2e          |

## Autor

**Leonardo Queiroz** — Técnico em Desenvolvimento de Sistemas (SENAI)