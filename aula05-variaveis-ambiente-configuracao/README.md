# 🔐 Aula 05 · Variáveis de Ambiente e Configuração Segura

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Dotenv](https://img.shields.io/badge/dotenv-v16.x-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black)
![ESM](https://img.shields.io/badge/ECMAScript-Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 05** da UC *Codificação para Back-End* (SENAI-AP): uso de **variáveis de ambiente** com `dotenv` para configurar e validar credenciais sensíveis (porta, banco de dados e chave de API) antes da inicialização do serviço.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [Por que usar variáveis de ambiente?](#-por-que-usar-variáveis-de-ambiente)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Configuração e instalação](#-configuração-e-instalação)
- [Como executar](#-como-executar)
- [Diagnóstico de inicialização](#-diagnóstico-de-inicialização)

---

## 🎯 Visão Geral

Este módulo é responsável por carregar e **auditar** as variáveis de ambiente necessárias para a inicialização segura do servidor. O serviço verifica credenciais críticas — como conexões com banco de dados e gateways de pagamento — e interrompe o processo (`process.exit()`) caso os parâmetros mínimos de segurança não sejam atendidos.

---

## 🧠 Por que usar variáveis de ambiente?

| Motivo | Descrição |
| :--- | :--- |
| 🔒 **Segurança** | Credenciais e chaves sensíveis nunca ficam expostas diretamente no código-fonte |
| 🌍 **Portabilidade** | O mesmo código roda em ambientes diferentes (dev, teste, produção) apenas trocando o `.env` |
| 🧪 **Configuração isolada** | Cada desenvolvedor pode ter seus próprios valores locais sem afetar o time |

---

## 📁 Estrutura do Projeto

```text
aula05-variaveis-ambiente-configuracao/
├── .env.example    # Modelo com a assinatura das variáveis de ambiente requeridas
├── .gitignore      # Ignora node_modules e o .env real
├── app.js          # Entry point: validação de credenciais e inicialização
└── package.json    # Manifesto do projeto (ESM ativado)
```

---

## 🛠️ Componentes

| Arquivo | Responsabilidade |
| :--- | :--- |
| `app.js` | Importa o `dotenv`, valida a chave obrigatória e inicia o serviço |
| `.env.example` | Template para o desenvolvedor criar seu `.env` local |
| `.gitignore` | Impede o versionamento de `.env` e `node_modules` |

| Tecnologia | Descrição |
| :--- | :--- |
| **Node.js** | Runtime JavaScript com sintaxe ESM (`import`/`export`) |
| **dotenv** | Injeta as variáveis do `.env` em `process.env` |

### `app.js`

```javascript
import dotenv from 'dotenv';

dotenv.config();

function iniciarAplicacao() {
    const porta = process.env.PORT || 8080;
    const apiKey = process.env.API_KEY_PAGAMENTO;
    const dbUrl = process.env.DATABASE_URL;

    if (!apiKey) {
        console.error('ERRO CRÍTICO: A chave API_KEY_PAGAMENTO não está definida nas variáveis de ambiente');
        process.exit();
    }

    console.log('=== SERVIÇO DE CONFIGURAÇÃO CARREGADO ===');
    console.log(`Servidor rodando na porta: ${porta}`);
    console.log(`Conexão com banco de dados: ${dbUrl}`);
    console.log(`Status da API de pagamento: chave de tamanho ${apiKey.length} autenticada.`);
}

iniciarAplicacao();
```

---

## ⚙️ Configuração e Instalação

### 1. Pré-requisitos

- Node.js v18 ou superior
- npm ou yarn

### 2. Instalar dependências

```bash
npm install
```

### 3. Criar o arquivo `.env`

Na raiz do projeto, crie um `.env` seguindo o modelo:

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/my_database
API_KEY_PAGAMENTO=sua_chave_api_aqui
```

> ⚠️ **Atenção:** nunca versione o arquivo `.env`. Chaves de acesso e credenciais de banco de dados são estritamente confidenciais — mantenha-as fora do Git.

---

## ▶️ Como executar

```bash
node app.js
```

---

## 🔎 Diagnóstico de Inicialização

### ✅ Cenário 1 — Credenciais válidas

```text
=== SERVIÇO DE CONFIGURAÇÃO CARREGADO ===
Servidor rodando na porta: 3000
Conexão com banco de dados: mongodb://localhost:27017/my_database
Status da API de pagamento: chave de tamanho 27 autenticada.
```

### ❌ Cenário 2 — Falha de autenticação

Se `API_KEY_PAGAMENTO` estiver ausente, o serviço encerra imediatamente a execução:

```text
ERRO CRÍTICO: A chave API_KEY_PAGAMENTO não está definida nas variáveis de ambiente
```

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 05</sub></p>