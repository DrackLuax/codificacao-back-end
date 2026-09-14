# 🧩 Aula 02 · Módulos no Node.js — CommonJS vs. ESM

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![ESM](https://img.shields.io/badge/ECMAScript-Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 02** da UC *Codificação para Back-End* (SENAI-AP): sistema de módulos do Node.js, migração de **CommonJS** para **ES Modules** e uso prático dos módulos nativos `path` e `fs` em um mini-projeto de logging.

---

## 📌 Sumário

- [Por que modularizar?](#-por-que-modularizar)
- [CommonJS vs. ESM](#-commonjs-vs-esm)
- [Módulos nativos usados](#-módulos-nativos-usados)
- [Projeto prático: Organizador de Logs](#-projeto-prático-organizador-de-logs)
- [Como executar](#-como-executar)
- [Saída esperada](#-saída-esperada)

---

## 🎯 Por que modularizar?

| Vantagem | Descrição |
| :--- | :--- |
| 🎯 **Responsabilidade única** | Cada arquivo resolve uma única parte do problema, mantendo o código previsível |
| ♻️ **Reutilização** | Funções utilitárias e regras de negócio podem ser importadas em vários pontos do sistema |
| 🛠️ **Manutenibilidade** | Corrigir ou evoluir um módulo pequeno é muito mais simples do que mexer em um arquivo monolítico |

---

## ⚖️ CommonJS vs. ESM

| Característica | CommonJS (CJS) | ES Modules (ESM) |
| :--- | :--- | :--- |
| Importar | `const x = require('./x')` | `import x from './x.js'` |
| Exportar | `module.exports = { ... }` | `export default ...` / `export { ... }` |
| Origem | Padrão histórico do Node.js | Padrão oficial do JavaScript |
| Carregamento | Síncrono (bloqueante) | Assíncrono (otimizado) |
| Ativação | Padrão em arquivos `.js` | `"type": "module"` no `package.json` ou extensão `.mjs` |
| Top-level `await` | ❌ Não suportado | ✅ Suportado |

> 💡 **Na prática:** projetos novos em Node.js tendem a adotar ESM por estar alinhado ao padrão do próprio JavaScript e por permitir `await` fora de funções `async`.

---

## 🧰 Módulos nativos usados

### `path` — caminhos multiplataforma
Resolve diferenças entre `\` (Windows) e `/` (Linux/macOS).

```javascript
path.join(...paths)      // une segmentos de caminho com segurança
path.extname(caminho)    // retorna a extensão do arquivo
path.resolve(...paths)   // gera um caminho absoluto
```

### `fs` — sistema de arquivos
Lê, cria, atualiza e remove arquivos/pastas no servidor.

```javascript
// Síncrono (bloqueante)
fs.readFileSync() / fs.writeFileSync() / fs.existsSync() / fs.mkdirSync()

// Assíncrono via Promises (recomendado)
fs.promises.readFile() / fs.promises.writeFile()
```

---

## 🗂️ Projeto prático: Organizador de Logs

Script que verifica (ou cria) a pasta `logs/`, formata um timestamp e grava mensagens no arquivo `system.log`.

```text
aula02-organizador-logs/
├── logs/
│   └── system.log     # criado automaticamente na primeira execução
├── package.json       # habilita ESM
├── utils.js           # formatação de logs
└── index.js           # ponto de entrada
```

### `package.json`

```json
{
  "name": "aula02-modulos-commonjs-esm",
  "version": "1.0.0",
  "description": "Organizador de logs com módulos nativos do Node.js (ESM)",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["nodejs", "esm", "fs", "path"],
  "author": "Leonardo Picanço Queiroz Fontinele",
  "license": "ISC",
  "type": "module"
}
```

### `utils.js`

```javascript
/**
 * Formata uma mensagem de log adicionando data e hora atuais.
 * Formato de saída: [YYYY-MM-DD HH:MM:SS] - Mensagem
 * @param {string} mensagem - Texto a ser registrado no log.
 * @returns {string} Mensagem já formatada com timestamp.
 */
export function formatLog(mensagem) {
  const dataAtual = new Date().toISOString().split('T')[0];
  const horaAtual = new Date().toLocaleTimeString();
  return `[${dataAtual} ${horaAtual}] - ${mensagem}`;
}
```

### `index.js`

```javascript
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatLog } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function salvarLogSystem(mensagemLog) {
  try {
    const pastaLog = path.join(__dirname, 'logs');
    const arquivoLog = path.join(pastaLog, 'system.log');

    await fs.mkdir(pastaLog, { recursive: true });
    const registroLog = formatLog(mensagemLog);
    await fs.appendFile(arquivoLog, registroLog + '\n', 'utf-8');

    console.log('✅ Log registrado com sucesso!');
  } catch (erro) {
    console.error('❌ Erro ao registrar log:', erro);
  }
}

salvarLogSystem('Inicialização do servidor concluída!');
salvarLogSystem('Conexão com o banco de dados estabelecida!');
```

---

## ▶️ Como executar

```bash
npm start
```

Ou diretamente:

```bash
node index.js
```

---

## ✅ Saída esperada

Na primeira execução, a pasta `logs/` é criada automaticamente junto com o arquivo `system.log`, contendo algo como:

```text
[2026-09-14 09:32:10] - Inicialização do servidor concluída!
[2026-09-14 09:32:10] - Conexão com o banco de dados estabelecida!
```

A cada nova execução, novas linhas são anexadas ao final do arquivo — sem sobrescrever o histórico anterior.

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 02</sub></p>