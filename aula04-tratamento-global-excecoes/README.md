# 🛡️ Aula 04 · Tratamento Global de Exceções no Node.js

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-v5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![ESM](https://img.shields.io/badge/ECMAScript-Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 04** da UC *Codificação para Back-End* (SENAI-AP): estratégias de resiliência com **Express.js**, captura centralizada de erros e monitoramento de eventos críticos do processo Node.js.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Endpoints de validação](#-endpoints-de-validação)
- [Como executar](#-como-executar)
- [Testes e diagnósticos](#-testes-e-diagnósticos)

---

## 🎯 Visão Geral

Este projeto demonstra, na prática, uma arquitetura **tolerante a falhas** em Express: interceptar exceções síncronas e assíncronas tanto no nível da aplicação quanto no nível do runtime do Node.js, garantindo respostas HTTP padronizadas e evitando que o processo caia inesperadamente (*crash*).

---

## 📁 Estrutura do Projeto

```text
aula04-tratamento-global/
├── package.json        # Manifesto do projeto (ESM ativado)
├── package-lock.json   # Trava de versões das dependências
└── server.js            # Servidor Express, handlers de processo e rotas de teste
```

---

## 🛠️ Componentes

### Configuração (`package.json`)

| Item | Detalhe |
| :--- | :--- |
| `"type": "module"` | Ativa suporte nativo a `import`/`export` (ESM) |
| `express` (`^5.2.1`) | Framework usado para roteamento e pipeline de middlewares |

### Handlers globais do processo

| Evento | Responsabilidade |
| :--- | :--- |
| `uncaughtException` | Intercepta erros **síncronos** lançados e não capturados no código |
| `unhandledRejection` | Captura **Promises rejeitadas** sem `.catch()` ou `try/catch` |

> 💡 Esses handlers atuam como uma **última linha de defesa**: registram o erro no console para diagnóstico, mas não substituem o tratamento local (`try/catch` + `next(erro)`) dentro das rotas.

### `server.js`

```javascript
import express from 'express';

const app = express();
app.use(express.json());

process.on('uncaughtException', (err) => {
    console.error('[ERRO DE PROCESSO - uncaughtException]: ', err.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('[PROMISE REJEITADA - unhandledRejection]: ', reason);
});

app.get('/sucesso', (req, res) => {
    res.json({ success: true, message: 'Operação Realizada com Sucesso!' });
});

app.get('/erro-sincrono', (req, res, next) => {
    try {
        throw new Error('Falha ao Processar a Regra de Negócio!');
    } catch (erro) {
        next(erro);
    }
});

app.get('/erro-assincrono', async (req, res, next) => {
    try {
        await Promise.reject(new Error('Erro na consulta no Banco de Dados externo'));
    } catch (erro) {
        next(erro);
    }
});
```

---

## 📋 Endpoints de Validação

| Método | Rota | Comportamento esperado |
| :--- | :--- | :--- |
| `GET` | `/sucesso` | Retorna JSON de confirmação com status `200 OK` |
| `GET` | `/erro-sincrono` | Simula falha síncrona, repassada ao Express via `next(erro)` |
| `GET` | `/erro-assincrono` | Simula falha em operação assíncrona, capturada em `try/catch` e repassada via `next(erro)` |

> ⚙️ Ao chamar `next(erro)`, o Express encaminha a exceção para o **middleware de tratamento de erros** (o próximo handler com 4 parâmetros `(err, req, res, next)`), responsável por centralizar o tratamento, registrar o *stack trace* (`err.stack`) nos logs e enviar um payload JSON padronizado — tipicamente com status `500 Internal Server Error` — para o cliente.

---

## ▶️ Como executar

### 1. Pré-requisitos

- Node.js v18 ou superior

### 2. Instalar dependências

```bash
npm install
```

### 3. Iniciar o servidor

```bash
node server.js
```

Saída esperada no console:

```text
Servidor rodando na porta 3000
[GET] http://localhost:3000/sucesso
[GET] http://localhost:3000/erro-sincrono
[GET] http://localhost:3000/erro-assincrono
```

---

## 🧪 Testes e Diagnósticos

Com o servidor ativo, teste as rotas via navegador, cURL, Postman ou Insomnia:

```bash
curl -i http://localhost:3000/sucesso
curl -i http://localhost:3000/erro-sincrono
curl -i http://localhost:3000/erro-assincrono
```

Cada rota de erro deve gerar um log no console (via `next(erro)` → middleware global) sem derrubar o servidor — validando que o tratamento centralizado está funcionando corretamente.

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 04</sub></p>