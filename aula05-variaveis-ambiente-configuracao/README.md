```markdown
<div align="center">

# Serviço de Configuração e Inicialização

![NodeJS](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Dotenv](https://img.shields.io/badge/Dotenv-v16.x-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black)
![ES Modules](https://img.shields.io/badge/ES_Modules-ECMAScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SENAI](https://img.shields.io/badge/SENAI-Amapá-005CA9?style=for-the-badge)

<p>
  Aplicação para validação, sanitização e inicialização de configurações do ambiente runtime no Node.js.
</p>

</div>

---

## 🎯 Visão Geral

Este módulo é responsável por carregar e auditar as variáveis de ambiente necessárias para a inicialização segura do servidor. O serviço verifica credenciais críticas (como conexões com banco de dados e gateways de pagamento) e interrompe o processo via código de saída do sistema caso os parâmetros mínimos de segurança não sejam atendidos.

---

## 📁 Estrutura do Projeto

```text
.
├── .env.example    # Modelo com a assinatura das variáveis de ambiente requeridas
├── .gitignore      # Regras para ignorar dependências e dados sensíveis (.env)
├── app.js          # Entry point da aplicação, validação de credenciais e inicialização
└── package.json    # Manifesto do projeto e dependências (ES Modules ativado)

```

---

## 🛠️ Descrição dos Componentes

### 1. Arquivos de Configuração

| Arquivo | Função / Responsabilidade |
| --- | --- |
| `app.js` | Importa o `dotenv`, valida a integridade das chaves e inicia a execução do serviço. |
| `.env.example` | Serve como template para desenvolvedores criarem seu arquivo local `.env`. |
| `.gitignore` | Impede o versionamento de dados sensíveis (`.env`) e pacotes instalados (`node_modules`). |

### 2. Tecnologias Utilizadas

| Tecnologia | Descrição |
| --- | --- |
| **Node.js** | Runtime JavaScript para execução no servidor utilizando sintaxe **ES Modules** (`import/export`). |
| **dotenv** | Módulo para injeção automática de variáveis de ambiente no objeto global `process.env`. |

---

## ⚙️ Configuração e Instalação

### 1. Pré-requisitos

* **Node.js** v18.0.0 ou superior.
* Gerenciador de pacotes **NPM** ou **Yarn**.

### 2. Instalação de Dependências

```bash
npm install

```

### 3. Definição das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto replicando a estrutura abaixo:

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/my_database
API_KEY_PAGAMENTO=sua_chave_api_aqui

```

> [!WARNING]
> Nunca versione o arquivo `.env`. As chaves de acesso e credenciais de bancos de dados são estritamente confidenciais.

---

## 🚀 Execução e Diagnósticos

Inicie a aplicação utilizando a CLI do Node.js:

```bash
node app.js

```

### 📋 Diagnóstico de Inicialização

#### Cenário 1: Credenciais Válidas (Sucesso)

Quando todas as chaves estão presentes e passam pelo fluxo de verificação:

```text
=== SERVIÇO DE CONFIGURAÇÃO CARREGADO ===
Servidor rodando na porta: 3000
Conexão com banco de dados: mongodb://localhost:27017/my_database
Status da API de pagamento: chave de tamanho 27 autenticada.

```

#### Cenário 2: Falha de Autenticação (Erro Crítico)

Caso uma variável mandatória como `API_KEY_PAGAMENTO` esteja ausente, o serviço encerra a execução:

```text
ERRO CRÍTICO: A chave API_KEY_PAGAMENTO não está definida nas variáveis de ambiente

```

---

Desenvolvido durante as aulas de **Codificação para Back-End** · **SENAI Amapá**