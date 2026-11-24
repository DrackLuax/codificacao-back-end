# Escola API

API REST para gerenciamento de alunos, construída com **NestJS**, **MongoDB** (Mongoose), validação de dados com **class-validator** e documentação interativa com **Swagger**.

## Tecnologias

- [NestJS](https://nestjs.com/): framework Node.js
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/) com [Mongoose](https://mongoosejs.com/) (`@nestjs/mongoose`)
- [@nestjs/config](https://docs.nestjs.com/techniques/configuration) e [Joi](https://joi.dev/): variáveis de ambiente tipadas e validadas
- [class-validator](https://github.com/typestack/class-validator) e class-transformer: validação dos dados de entrada
- [Swagger](https://swagger.io/) (`@nestjs/swagger`): documentação interativa da API
- [Faker](https://fakerjs.dev/) (`@faker-js/faker`): geração de dados fictícios para testes
- [tsx](https://tsx.is/): execução de scripts TypeScript (usado no seed)
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

# criar o arquivo de variáveis de ambiente a partir do modelo
cp .env.example .env        # Linux/macOS
copy .env.example .env      # Windows (cmd)
```

Depois de criar o `.env`, ajuste os valores (principalmente a `JWT_SECRET`) conforme a seção abaixo.

## Variáveis de ambiente

A configuração é lida do arquivo `.env`, na raiz do projeto. Esse arquivo **não é versionado**, porque contém dados sensíveis. O modelo com os nomes das variáveis fica em `.env.example`.

| Variável         | Obrigatória | Padrão                                | Descrição                                                   |
| ---------------- | :---------: | ------------------------------------- | ----------------------------------------------------------- |
| `NODE_ENV`       | Não         | `development`                         | Ambiente de execução: `development`, `production` ou `test` |
| `PORT`           | Não         | `3000`                                | Porta em que a API sobe                                     |
| `DATABASE_URI`   | Sim         | —                                     | String de conexão com o MongoDB                             |
| `MAX_POOL_SIZE`  | Não         | `10`                                  | Número máximo de conexões abertas com o banco               |
| `JWT_SECRET`     | Sim         | —                                     | Chave secreta para assinatura de tokens JWT                 |
| `JWT_EXPIRES_IN` | Não         | `1d`                                  | Tempo de validade dos tokens JWT                            |

Exemplo (`.env.example`):

```dotenv
NODE_ENV=development
PORT=3001
DATABASE_URI=mongodb://localhost:27017/escola_dbn
MAX_POOL_SIZE=10
JWT_SECRET=troque-por-uma-chave-secreta-longa
JWT_EXPIRES_IN=1d
```

Na inicialização, o **Joi** valida `NODE_ENV`, `PORT`, `DATABASE_URI` e `JWT_SECRET` (`src/app.module.ts`). Se `DATABASE_URI` ou `JWT_SECRET` estiverem ausentes, ou se `NODE_ENV` tiver um valor inválido, a API **não sobe** e mostra o erro de validação. `MAX_POOL_SIZE` e `JWT_EXPIRES_IN` não passam pelo Joi: quando ausentes, valem os padrões da tabela.

Para gerar uma `JWT_SECRET` segura:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> Nunca versione o `.env` nem publique a `JWT_SECRET`. Use uma chave diferente em cada ambiente.

## Configuração tipada (namespaces)

Em vez de ler `process.env` espalhado pelo código, as variáveis são agrupadas em **namespaces** com `registerAs` e carregadas pelo `ConfigModule` (opção `load`):

| Arquivo                       | Namespace  | Valores expostos                                          |
| ----------------------------- | ---------- | --------------------------------------------------------- |
| `src/config/database.config.ts` | `database` | `uri` (`DATABASE_URI`) e `maxPoolSize` (`MAX_POOL_SIZE`)  |
| `src/config/auth.config.ts`     | `auth`     | `jwtSecret` (`JWT_SECRET`) e `jwtExpiresIn` (`JWT_EXPIRES_IN`) |
| `src/config/env.config.ts`      | —          | Interface `variaveisDeAmbiente`, que tipa o `ConfigService` |

Exemplo de namespace (`database.config.ts`):

```typescript
import { registerAs } from "@nestjs/config";

export default registerAs('database', () => ({
    uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/escola_dbn',
    maxPoolSize: parseInt(process.env.MAX_POOL_SIZE || '10', 10),
}));
```

A conexão com o MongoDB usa essa configuração tipada, com `forRootAsync` e `inject: [databaseConfig.KEY]`:

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (dbConfig: ConfigType<typeof databaseConfig>) => ({
    uri: dbConfig.uri,
    maxPoolSize: dbConfig.maxPoolSize,
  }),
  inject: [databaseConfig.KEY],
}),
```

Em qualquer provider, a configuração pode ser injetada com tipagem completa:

```typescript
constructor(
  @Inject(databaseConfig.KEY)
  private dbConfig: ConfigType<typeof databaseConfig>,
) {}
```

Para ler variáveis individuais, o `ConfigService<variaveisDeAmbiente, true>` também está disponível, com `infer: true` para manter os tipos.

## Executando o projeto

```bash
# desenvolvimento (com reload automático)
npm run start:dev

# produção
npm run build
npm run start:prod
```

A API ficará disponível na porta definida em `PORT` (por exemplo, `http://localhost:3001`).

## Documentação (Swagger)

Com a aplicação rodando, a documentação interativa fica em:

```
http://localhost:<PORT>/api
```

Por exemplo, com `PORT=3001`: `http://localhost:3001/api`.

Por ela é possível consultar todas as rotas, ver os campos esperados (com exemplos) e executar as requisições direto no navegador.

## Popular o banco com dados de teste (seed)

O script `src/seeding.ts` gera alunos fictícios com o `@faker-js/faker` (em português do Brasil) e os cadastra pelo `AlunosService`. Assim, os dados passam pelas mesmas regras da API, como a matrícula única.

Com o MongoDB rodando e o `.env` configurado, execute:

```bash
npm run bf67
```

Cada execução faz **150 tentativas** de cadastro, com os seguintes dados:

| Campo       | Valor gerado                                                      |
| ----------- | ----------------------------------------------------------------- |
| `nome`      | Nome completo aleatório em português                              |
| `idade`     | Número inteiro entre `16` e `65`                                  |
| `matricula` | 5 dígitos numéricos aleatórios                                    |
| `cursos`    | De 1 a 3 cursos sorteados de uma lista de 11 cursos               |
| `ativo`     | `true`                                                            |

Se a matrícula sorteada já existir, o registro é ignorado com a mensagem `Pular: Erro ao Criar Matrícula para <nome>! - Matrícula Duplicada`, e o script continua.

Saída esperada:

```text
🌱 Iniciando a Geração de Faker Alunos...
✅ Banco de Dados Populado com Sucesso!
```

Observações:

- **O seed não limpa o banco.** Cada execução acrescenta novos alunos aos que já existem. Para começar do zero, apague a coleção antes:

```bash
mongosh
use escola_dbn
db.alunos.deleteMany({})
```

- **Por que `tsx`?** O projeto usa ES Modules (`"type": "module"`) e importa arquivos com a extensão `.js`, o que o `ts-node` não resolve. O `tsx` resolve, mas não emite os metadados dos decorators. Por isso cada `@Prop` do schema declara o `type` de forma explícita.

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
│   │   └── alunos.service.ts           # regras de negócio (CRUD, filtros, ordenação, paginação e soft delete)
│   ├── config/
│   │   ├── auth.config.ts              # namespace "auth" (JWT)
│   │   ├── database.config.ts          # namespace "database" (URI e pool de conexões)
│   │   └── env.config.ts               # interface tipada das variáveis de ambiente
│   ├── app.module.ts                   # módulo raiz: ConfigModule (Joi + namespaces) e conexão com o banco
│   ├── main.ts                         # ponto de entrada: ValidationPipe, Swagger e inicialização
│   └── seeding.ts                      # script que popula o banco com alunos fictícios
├── test/                               # testes e2e
├── .env.example                        # modelo das variáveis de ambiente
├── vitest.config.ts
├── vitest.config.e2e.ts
└── nest-cli.json
```

## Modelo de dados

Coleção `alunos`:

| Campo       | Tipo       | Obrigatório | Observações                                           |
| ----------- | ---------- | :---------: | ----------------------------------------------------- |
| `nome`      | `string`   | Sim         | Não pode ser vazio                                    |
| `idade`     | `number`   | Sim         | Inteiro, mínimo `0`                                   |
| `matricula` | `string`   | Sim         | **Única** no banco                                    |
| `cursos`    | `string[]` | Sim         | Pelo menos 1 curso, cada um texto                     |
| `ativo`     | `boolean`  | Não         | Padrão `true`. Vira `false` quando o aluno é removido |
| `createdAt` | `Date`     | Automático  | Data de criação do registro                           |
| `updatedAt` | `Date`     | Automático  | Data da última atualização do registro                |

## Endpoints

Base: `/alunos`

| Método   | Rota                    | Descrição                                              |
| -------- | ----------------------- | ------------------------------------------------------ |
| `POST`   | `/alunos`               | Cria um aluno                                          |
| `GET`    | `/alunos`               | Lista alunos ativos com paginação, filtros e ordenação |
| `GET`    | `/alunos/:id`           | Busca um aluno ativo pelo ID                           |
| `PATCH`  | `/alunos/:id`           | Atualiza um aluno                                      |
| `DELETE` | `/alunos/:id`           | Remove o aluno (soft delete: apenas desativa)          |
| `PATCH`  | `/alunos/:id/restaurar` | Restaura um aluno removido                             |

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
  "ativo": true,
  "createdAt": "2026-11-17T23:45:10.123Z",
  "updatedAt": "2026-11-17T23:45:10.123Z",
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

Retorna **apenas alunos ativos**. Todos os parâmetros são opcionais:

| Parâmetro        | Tipo     | Padrão | Descrição                                                     |
| ---------------- | -------- | :----: | ------------------------------------------------------------- |
| `page`           | `number` | `1`    | Número da página                                              |
| `limit`          | `number` | `10`   | Quantidade de itens por página                                |
| `nome`           | `string` | —      | Filtra pelo nome (contém o texto, sem diferenciar maiúsculas) |
| `curso`          | `string` | —      | Filtra alunos matriculados no curso informado (nome exato)    |
| `orderBy`        | `string` | —      | Campo usado na ordenação: `nome`, `idade` ou `matricula`      |
| `orderDirection` | `string` | `asc`  | `asc` para crescente e `desc` para decrescente                |

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
      "ativo": true,
      "createdAt": "2026-11-17T23:45:10.123Z",
      "updatedAt": "2026-11-17T23:45:10.123Z",
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

### Remover e restaurar (soft delete)

A remoção **não apaga** o registro do banco: o aluno apenas recebe `ativo: false` e deixa de aparecer na listagem e na busca por ID.

`DELETE /alunos/:id`

Resposta (`200 OK`):

```json
{
  "_id": "6650f1c2a1b2c3d4e5f67890",
  "nome": "Leonardo Queiroz",
  "idade": 18,
  "matricula": "2026TISENAI02",
  "cursos": ["Banco de dados", "Desenvolvimento WEB"],
  "ativo": false,
  "createdAt": "2026-11-17T23:45:10.123Z",
  "updatedAt": "2026-11-17T23:50:42.508Z",
  "__v": 0
}
```

Para reativar o aluno:

`PATCH /alunos/:id/restaurar`

Resposta (`200 OK`): o mesmo documento, agora com `"ativo": true`.

> A matrícula de um aluno removido continua reservada. Tentar cadastrar outro aluno com a mesma matrícula retorna `409 Conflict` até que o registro seja apagado definitivamente do banco.

### Erros comuns

| Status | Quando acontece                                                                 |
| ------ | ------------------------------------------------------------------------------- |
| `400`  | Dados inválidos (ex.: nome vazio, idade negativa, lista de cursos vazia)        |
| `400`  | Campos que não existem no DTO foram enviados                                    |
| `400`  | `page` ou `limit` não são números inteiros                                      |
| `404`  | Aluno com o ID informado não foi encontrado (ou está removido, na busca por ID) |
| `404`  | Restauração de um ID que não existe                                             |
| `409`  | Já existe um aluno cadastrado com a mesma matrícula                             |
| `500`  | Falha inesperada ao processar o cadastro do aluno                               |

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

As buscas, atualizações, remoções e restaurações lançam `NotFoundException` (`404`) quando o ID não existe.

## Testes

```bash
# testes unitários
npm run test

# testes e2e
npm run test:e2e
```

## Scripts úteis

| Script               | Descrição                                      |
| -------------------- | ---------------------------------------------- |
| `npm run start:dev`  | Inicia em modo desenvolvimento                 |
| `npm run build`      | Compila o projeto para `dist/`                 |
| `npm run start:prod` | Executa a versão compilada                     |
| `npm run bf67`       | Popula o banco com alunos fictícios (seed)     |
| `npm run test`       | Executa os testes unitários                    |
| `npm run test:e2e`   | Executa os testes e2e                          |

## Autor

**Leonardo Queiroz** — Técnico em Desenvolvimento de Sistemas (SENAI)