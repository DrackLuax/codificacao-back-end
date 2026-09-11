<div align="center">

# Aula 01: Revisão do Node.js e NPM

![NodeJS](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SENAI](https://img.shields.io/badge/SENAI-Amapá-005CA9?style=for-the-badge)
![Module](https://img.shields.io/badge/Módulo-OS-darkgrey?style=for-the-badge)

<p>
  Código fonte e anotações técnicas referentes à <b>Aula 01</b> da Unidade Curricular de <b>Codificação para Back-End</b>.
</p>

</div>

---

## 🎯 Objetivos do Estudo

- Compreender os conceitos do ecossistema **Node.js** e sua execução *Server-Side*.
- Validar e configurar o ambiente de desenvolvimento local.
- Inicializar um projeto Node.js utilizando o **NPM** (*Node Package Manager*).
- Desenvolver um script de diagnóstico utilizando o módulo nativo `os` para acessar recursos diretos do sistema operacional.

---

## 💻 Conceitos Server-Side Aplicados

Diferente da execução no navegador (*Client-Side*), onde o código é limitado ao DOM e à interface visual:

- **Acesso Direto ao Sistema Operacional:** O Node.js permite interagir diretamente com hardware, memória e sistema de arquivos.
- **Execução via Terminal:** O código é executado diretamente pelo runtime do Node.js através da linha de comando, sem necessidade de uma página HTML.
- **Arquitetura Non-blocking I/O:** Utilização do motor V8 e do Event Loop para processar instruções de forma performática.

---

## 🚀 Passo a Passo da Prática

### 1. Verificação do Ambiente

Antes de iniciar a aplicação, confirmamos a instalação do **Node.js** e do **NPM** via terminal:

```bash
node -v
npm -v