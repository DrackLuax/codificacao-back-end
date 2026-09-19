# 🛰️ Aula 06 · Servidor HTTP Nativo — Módulo `http`

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![HTTP](https://img.shields.io/badge/Módulo-HTTP_Nativo-007ACC?style=for-the-badge&logo=node.js&logoColor=white)
![ESM](https://img.shields.io/badge/ECMAScript-Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 06** da UC *Codificação para Back-End* (SENAI-AP): criação de um servidor HTTP **100% nativo**, sem frameworks externos, com roteamento manual, logging de requisições e cabeçalhos de segurança essenciais.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Cabeçalhos de segurança](#-cabeçalhos-de-segurança)
- [Endpoints](#-endpoints)
- [Como executar](#-como-executar)
- [Testes e diagnósticos](#-testes-e-diagnósticos)

---

## 🎯 Visão Geral

O **Servidor Sentinela** foi construído usando apenas o módulo interno `http` do Node.js — sem Express nem qualquer dependência externa. O objetivo é entender, na base, o que um framework como o Express abstrai: criação do servidor, interceptação de requisições, roteamento condicional e definição manual de cabeçalhos de resposta, incluindo hardening básico contra ataques comuns de camada web.

---

## 📁 Estrutura do Projeto

```text
aula06-servidor-web-http/
├── package.json    # Manifesto do projeto (ESM ativado)
└── servidor.js     # Núcleo da aplicação: roteamento, headers e logs
```

---

## 🛠️ Componentes

| Recurso | Descrição |
| :--- | :--- |
| **Módulo nativo `http`** | Criação e controle do servidor sem abstrações de terceiros |
| **Logger de requisições** | Registra o método HTTP de cada requisição recebida no console |
| **Headers de segurança** | Injeção estática de cabeçalhos contra MIME sniffing e clickjacking |
| **Roteador manual** | Verificação condicional de `req.url` com resposta padronizada em JSON |

| Tecnologia | Finalidade |
| :--- | :--- |
| **Node.js** | Runtime com sintaxe ESM (`import`/`export`) |
| **http** | API nativa para gerenciar o ciclo de vida de requisição/resposta |

### `servidor.js`

```javascript
import http from "http";

const servidor = http.createServer((req, res) => {
  console.log(`[LOG] Método recebido: ${req.method}`);

  const cabecalhoPadrao = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };

  if (req.url === "/status") {
    res.writeHead(200, {
      ...cabecalhoPadrao,
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ servidor: "Online" }));
  } else {
    res.writeHead(404, {
      ...cabecalhoPadrao,
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ erro: "Página não encontrada" }));
  }
});

servidor.listen(3000, () => {
  console.log('Sentinela ativo na porta 3000');
});
```

> ⚠️ **Nota:** no código original o `Content-Type` da resposta de erro estava grafado como `"aplication/json"` (faltando o segundo "p"). Corrigido acima para `"application/json"` — vale conferir no seu arquivo local.

---

## 🔒 Cabeçalhos de Segurança

Todas as respostas do servidor incluem os seguintes headers:

```http
Content-Type: application/json
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

| Header | Proteção |
| :--- | :--- |
| `X-Content-Type-Options: nosniff` | Impede que o navegador reinterprete o payload com um MIME type diferente do declarado |
| `X-Frame-Options: DENY` | Bloqueia a renderização da resposta em `<iframe>`/`<frame>`/`<object>`, prevenindo *clickjacking* |

---

## 📋 Endpoints

| Método | Rota | Descrição | Status | Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/status` | Health check do serviço | `200 OK` | `{"servidor":"Online"}` |
| `*` | qualquer outra rota | Fallback para rota não mapeada | `404 Not Found` | `{"erro":"Página não encontrada"}` |

---

## ▶️ Como executar

Nenhuma dependência externa é necessária:

```bash
node servidor.js
```

Saída esperada no console:

```text
Sentinela ativo na porta 3000
```

---

## 🧪 Testes e Diagnósticos

### 1. Health check (`/status`)

```bash
curl -i http://localhost:3000/status
```

```text
HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Type: application/json

{"servidor":"Online"}
```

### 2. Rota inexistente

```bash
curl -i http://localhost:3000/rota-invalida
```

```text
HTTP/1.1 404 Not Found
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Type: application/json

{"erro":"Página não encontrada"}
```

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 06</sub></p>