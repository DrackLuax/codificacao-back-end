# ⚡ Aula 14 · Edge Function na Vercel

![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Edge_Runtime-000000?style=for-the-badge&logo=vercel&logoColor=white)
![SENAI](https://img.shields.io/badge/SENAI-AMAPÁ-0057B7?style=for-the-badge)
![UC](https://img.shields.io/badge/UC-Codificação_Back--End-6A1B9A?style=for-the-badge)
![Status](https://img.shields.io/badge/status-concluído-success?style=for-the-badge)

> Material de estudo da **Aula 14** da UC *Codificação para Back-End* (SENAI-AP): execução de uma **função na borda da rede (Edge Function)** na infraestrutura da **Vercel**, sem servidor tradicional — a função roda no runtime Edge, mais próximo geograficamente do usuário.

---

## 📌 Sumário

- [Visão geral](#-visão-geral)
- [O que é uma Edge Function?](#-o-que-é-uma-edge-function)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Deploy na Vercel](#-deploy-na-vercel)
- [Testes e diagnósticos](#-testes-e-diagnósticos)

---

## 🎯 Visão Geral

Este projeto demonstra, na prática, o funcionamento de uma **Edge Function** hospedada na Vercel. Ao ser chamada, a função registra o instante inicial da execução e retorna um JSON com informações sobre o processamento: mensagem de status, horário do servidor, região de execução e tempo decorrido.

---

## 🧭 O que é uma Edge Function?

| Conceito | Descrição |
| :--- | :--- |
| **Edge Runtime** | Ambiente de execução leve, rodando em pontos de rede distribuídos geograficamente (a "borda" da rede), em vez de um servidor centralizado |
| **Latência reduzida** | A função é executada no nó mais próximo do usuário, diminuindo o tempo de resposta |
| **`export const config = { runtime: 'edge' }`** | Diretiva que instrui a Vercel a executar essa função no Edge Runtime, em vez do runtime Node.js padrão (Serverless Function) |
| **`Request`/`Response`** | O Edge Runtime usa as APIs Web padrão (`fetch`-like), diferente do `req`/`res` do Express/Node |

---

## 📁 Estrutura do Projeto

```text
aula14-servidor-edge-runtime-vercel/
├── api/
│   └── hora-servidor.ts    # Edge Function: retorna dados da execução em JSON
├── .vercel/                 # Metadados do projeto vinculado à Vercel
├── .gitignore
├── package.json
└── README.md
```

> 💡 Na Vercel, qualquer arquivo dentro da pasta `api/` é automaticamente exposto como um endpoint — `api/hora-servidor.ts` vira a rota `/api/hora-servidor`.

---

## 🛠️ Componentes

### `api/hora-servidor.ts`

```typescript
export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const inicio = new Date();

    return new Response(
        JSON.stringify({
            mensagem: 'Função executada na borda de rede',
            horarioDoServidor: new Date().toISOString(),
            regiao: 'local-dev',
            tempoDeExecucao: `${Date.now() - inicio.getTime()} ms`,
        }),
        {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        },
    );
}
```

| Trecho | Função |
| :--- | :--- |
| `config.runtime = 'edge'` | Define que essa função roda no Edge Runtime, não no runtime Node padrão |
| `inicio` | Marca o instante em que a execução começou, usado para calcular `tempoDeExecucao` |
| `new Response(...)` | API Web nativa (não é o `res` do Express) — retorna corpo, status e headers manualmente |

---

## ☁️ Deploy na Vercel

O deploy foi feito via **Vercel CLI**, a partir da raiz do projeto:

```bash
vercel
```

O comando vincula a pasta ao projeto na Vercel e gera uma URL de *preview* automaticamente. Para promover a build para produção:

```bash
vercel --prod
```

Durante o desenvolvimento local, o valor de `regiao` retornado é fixo em `"local-dev"`; em produção na Vercel, esse campo pode ser substituído pela variável de ambiente de região real da Edge Network, se desejado.

---

## 🧪 Testes e Diagnósticos

### Testar localmente (com Vercel CLI)

```bash
vercel dev
curl -i http://localhost:3000/api/hora-servidor
```

### Testar a URL publicada

```bash
vercel curl https://aula14-servidor-edge-runtime-vercel.vercel.app/api/hora-servidor
```

*Resposta esperada:*

```json
{
  "mensagem": "Função executada na borda de rede",
  "horarioDoServidor": "2026-10-06T00:00:00.000Z",
  "regiao": "local-dev",
  "tempoDeExecucao": "0 ms"
}
```

---

<p align="center"><sub>SENAI Amapá · Codificação para Back-End · Aula 14</sub></p>