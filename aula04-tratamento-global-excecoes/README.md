```markdown
<div align="center">

# Tratamento Global de Exceções no Node.js

![NodeJS](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-v5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![ES Modules](https://img.shields.io/badge/ES_Modules-ECMAScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SENAI](https://img.shields.io/badge/SENAI-Amapá-005CA9?style=for-the-badge)

<p>
  Estratégias de resiliência, captura centralizada de erros e monitoramento de eventos de processo no Node.js com a sintaxe moderna de <b>ES Modules (ESM)</b>.
</p>

</div>

---

## 🎯 Visão Geral

Este projeto demonstra a implementação prática de uma arquitetura tolerante a falhas utilizando o **Express.js**. O objetivo principal é interceptar exceções síncronas e assíncronas no nível da aplicação e do sistema runtime do Node.js, garantindo respostas HTTP padronizadas e prevenindo a queda inesperada do processo (*crash*).

---

## 📁 Estrutura do Projeto

```text
.
├── package.json        # Manifesto do projeto e dependências (Configurado com ES Modules)
├── package-lock.json   # Mapeamento exato e trava de versões das dependências
└── server.js           # Servidor HTTP, middleware global de erro e handlers do processo

```

---

## 🛠️ Descrição dos Componentes

### 1. Configuração do Projeto (`package.json`)

* **Propriedade Chave:** `"type": "module"` ativado para suporte nativo ao uso de `import` / `export`.
* **Framework:** `express` (`^5.2.1`) para controle do pipeline da aplicação e rotas HTTP.

### 2. Núcleo do Servidor (`server.js`)

#### Handlers do Processo Node.js

| Evento | Função / Responsabilidade |
| --- | --- |
| `uncaughtException` | Intercepta erros síncronos lançados e não capturados no código. |
| `unhandledRejection` | Captura Promises rejeitadas sem tratamento via `.catch()` ou bloco `try/catch`. |

#### Endpoints para Validação

| Método | Endpoint | Comportamento Esperado |
| --- | --- | --- |
| `GET` | `/sucesso` | Retorna confirmação JSON com status `200 OK`. |
| `GET` | `/erro-sincrono` | Simula falha síncrona repassada ao manipulador via `next(erro)`. |
| `GET` | `/erro-assincrono` | Simula falha em operação assíncrona interceptada via `try/catch` e enviada ao `next(erro)`. |

#### Middleware Global de Tratamento

* Centraliza o tratamento de qualquer falha injetada via `next(err)`.
* Registra o *stack trace* (`err.stack`) nos logs do servidor.
* Envia um payload JSON estruturado com status HTTP `500 Internal Server Error` (ou personalizado) para o cliente.

---

## 🚀 Guia de Execução

### Pré-requisitos

* **Node.js** v18.0.0 ou superior.

### Passo a Passo

1. Instale as dependências da aplicação:
```bash
npm install

```


2. Inicie o servidor:
```bash
node server.js

```


3. Confirme as rotas de diagnósticos exibidas no console:
```text
Servidor rodando na porta 3000
[GET] http://localhost:3000/sucesso
[GET] http://localhost:3000/erro-sincrono
[GET] http://localhost:3000/erro-assincrono

```


4. Execute requisições via navegador, cURL, Postman ou Insomnia para validar as respostas do sistema.

---

Desenvolvido durante as aulas de **Codificação para Back-End** · **SENAI Amapá**