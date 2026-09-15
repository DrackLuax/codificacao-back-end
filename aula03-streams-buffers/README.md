# 🌊 Aula 03 · Streams e Buffers no Node.js

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Streams](https://img.shields.io/badge/Node.js-Streams-FF6F00?style=for-the-badge)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 03** da UC *Codificação para Back-End* (SENAI-AP): conceito de **Streams** e **Buffers** no Node.js, aplicado à geração e ao processamento de arquivos de log de grande volume sem sobrecarregar a memória.

---

## 📌 Sumário

- [O que são Streams e Buffers?](#-o-que-são-streams-e-buffers)
- [Por que usar Streams em arquivos grandes?](#-por-que-usar-streams-em-arquivos-grandes)
- [Tipos de Streams no Node.js](#-tipos-de-streams-no-nodejs)
- [Projeto prático](#-projeto-prático)
- [Como executar](#-como-executar)
- [Saída esperada](#-saída-esperada)

---

## 🧠 O que são Streams e Buffers?

| Conceito | Descrição |
| :--- | :--- |
| **Buffer** | Região de memória temporária usada para armazenar dados binários enquanto são movidos de um lugar para outro |
| **Stream** | Fluxo de dados processado em **pedaços (chunks)**, de forma contínua, em vez de carregar o arquivo inteiro de uma só vez |

> 💡 **Analogia:** ler um arquivo sem stream é como tentar engolir um balde d'água de uma vez. Com stream, você bebe em goles — processa aos poucos, sem afogar a memória da aplicação.

---

## ⚡ Por que usar Streams em arquivos grandes?

| Abordagem | Consumo de memória | Comportamento |
| :--- | :--- | :--- |
| `fs.readFileSync()` | ⚠️ Alto — carrega o arquivo inteiro na RAM | Bloqueante |
| `fs.createReadStream()` | ✅ Baixo — processa em pequenos pedaços | Não bloqueante, orientado a eventos |

Isso é essencial ao lidar com arquivos de log que podem crescer para centenas de milhares de linhas, como o gerado neste projeto.

---

## 🔀 Tipos de Streams no Node.js

| Tipo | Função | Exemplo usado no projeto |
| :--- | :--- | :--- |
| **Writable** | Escreve dados em um destino | `fs.createWriteStream()` |
| **Readable** | Lê dados de uma origem | `fs.createReadStream()` |
| **Duplex** | Lê e escreve (não usado aqui) | — |
| **Transform** | Lê, transforma e escreve (não usado aqui) | — |

---

## 🗂️ Projeto prático

Dois scripts que trabalham em conjunto: um **gera** um log gigante usando *Writable Stream*, e outro **processa** esse log linha a linha usando *Readable Stream* + `readline`, filtrando apenas as linhas de erro.

```text
aula03-streams-buffers/
├── logs/
│   ├── servidor.log         # gerado por gerarLogGigante.js
│   └── apenas_erros.log     # gerado por filtrarErros.js
├── package.json             # habilita ESM
├── gerarLogGigante.js       # gera 400.000 linhas de log simulado
└── filtrarErros.js          # lê o log e filtra apenas erros
```

### `package.json`

```json
{
  "name": "aula03-streams-buffers",
  "version": "1.0.0",
  "description": "Geração e processamento de logs em larga escala com Streams e Buffers",
  "main": "index.js",
  "scripts": {
    "gerar": "node gerarLogGigante.js",
    "filtrar": "node filtrarErros.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["nodejs", "streams", "buffers", "readline"],
  "author": "Leonardo Picanço Queiroz Fontinele",
  "license": "ISC",
  "type": "module"
}
```

### `gerarLogGigante.js` — geração via Writable Stream

Cria um arquivo `servidor.log` com **400.000 linhas** de log simulado, alternando entre status `INFO` e `ERROR`, escrevendo de forma contínua via `createWriteStream`.

```javascript
import fs from "fs";

const data = new Date().toISOString().split('T')[0];
const hora = new Date().toLocaleTimeString();

const streamEscrita = fs.createWriteStream('servidor.log');
console.log('Gerando arquivo de log simulado...');

for (let i = 0; i < 400000; i++) {
    const tipo = i % 7 === 0 ? 'ERROR' : 'INFO';
    streamEscrita.write(`[${data} - ${hora}] Linha ${i}: Status 200 - Mensagem de teste ${tipo} \n`);
}
streamEscrita.end();
```

> ⚠️ **Nota técnica:** o `write()` é chamado em loop síncrono sem verificar o retorno booleano (que indica se o buffer interno está cheio) nem aguardar o evento `'drain'`. Para arquivos ainda maiores, o ideal é pausar a escrita quando `write()` retornar `false` e retomar no `'drain'`, evitando pressão excessiva de memória.

### `filtrarErros.js` — processamento via Readable Stream + readline

Lê o `servidor.log` **linha a linha** (sem carregar o arquivo inteiro na memória), filtra as linhas contendo `"ERROR"` e grava o resultado em `apenas_erros.log`. Também mede o consumo de memória (RSS e Heap) antes e depois do processamento.

```javascript
import fs from 'fs';
import readline from 'readline';

async function filtrarErros() {
    console.log('Iniciando processamento com Stream...');
    exibirConsumoMemoria('Início');

    const streamLeitura = fs.createReadStream('servidor.log');
    const streamEscrita = fs.createWriteStream('apenas_erros.log');
    const leitorLinhaAlinha = readline.createInterface({ input: streamLeitura, crlfDelay: Infinity });

    let totalErros = 0;
    for await (const linha of leitorLinhaAlinha) {
        if (linha.includes('ERROR')) {
            streamEscrita.write(linha + '\n');
            totalErros++;
        }
    }

    exibirConsumoMemoria('Fim');
    console.log('Processamento Concluído!\n');
    console.log(`Quantidade de Erros Encontrados: ${totalErros} linhas.\n`);
}
filtrarErros();

function exibirConsumoMemoria(consumo) {
    const memoria = process.memoryUsage();
    const rssMB = (memoria.rss / 1024 / 1024).toFixed(2);
    const heapMB = (memoria.heapUsed / 1024 / 1024).toFixed(2);
    console.log(`[${consumo}] RSS: ${rssMB} MB | Heap Utilizado: ${heapMB} MB`);
}
```

---

## ▶️ Como executar

**1. Gerar o log simulado:**

```bash
node gerarLogGigante.js
```

**2. Filtrar apenas os erros:**

```bash
node filtrarErros.js
```

---

## ✅ Saída esperada

Ao rodar `gerarLogGigante.js`, o arquivo `servidor.log` é criado com 400.000 linhas de log.

Ao rodar `filtrarErros.js`, o console exibe algo como:

```text
Iniciando processamento com Stream...
[Início] RSS: 42.15 MB | Heap Utilizado: 6.03 MB
[Fim] RSS: 58.72 MB | Heap Utilizado: 9.87 MB
Processamento Concluído!

Quantidade de Erros Encontrados: 57143 linhas.
```

E o arquivo `apenas_erros.log` conterá apenas as linhas do log original que continham `"ERROR"`, uma por linha.

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 03</sub></p>