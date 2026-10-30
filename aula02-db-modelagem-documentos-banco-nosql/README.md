# Aula 02 — Modelagem de Documentos em Banco de Dados NoSQL

Exercícios de modelagem de dados orientada a documentos (estilo MongoDB), usando arquivos JSON.

## Estrutura da pasta

```
aula02-db-modelagem-documentos-banco-nosql/
├── aluno-escola.json
├── produto-loja-notebook.json
├── post-de-rede-social.json
└── README.md
```

## Conceitos

### Banco de dados orientado a documentos

Em vez de tabelas, linhas e colunas (modelo relacional), os dados são guardados como **documentos** em formato JSON/BSON. Documentos parecidos ficam agrupados em **coleções**.

| Relacional (SQL) | Documentos (NoSQL) |
| ---------------- | ------------------ |
| Banco de dados   | Banco de dados     |
| Tabela           | Coleção            |
| Linha (registro) | Documento          |
| Coluna           | Campo              |
| JOIN             | Documentos embutidos ou referências |

### Tipos de dados usados

- **String:** textos (`"nome"`, `"curso"`)
- **Number:** inteiros e decimais (`21`, `4599.99`, `9.5`)
- **Array:** listas de valores ou de objetos (`disciplinas`, `tags`, `curtidas`)
- **Objeto (documento embutido):** objeto dentro de outro (`especificacoesTecnicas`)

### Embutir (embedding) vs. referenciar

- **Embutir:** guardar os dados relacionados dentro do próprio documento. É mais rápido de ler (uma única consulta) e indicado quando os dados são sempre acessados juntos.
- **Referenciar:** guardar apenas o identificador de outro documento. É indicado quando os dados são grandes, mudam muito ou são compartilhados por vários documentos.

Nos três exemplos desta aula foi usado o **embutimento**.

---

## Exemplo 1 — Aluno de escola (`aluno-escola.json`)

```json
{
  "nome": "Leonardo Queiroz",
  "nomeSocial": "",
  "matricula": "2026TISENAI02",
  "dataNascimento": "2007-10-02",
  "curso": "Técnico em Desenvolvimento de Sistemas",
  "disciplinas": [
    { "nome": "Banco de dados", "nota": 9.5 },
    { "nome": "Desenvolvimento WEB", "nota": 8.8 }
  ],
  "endereco": [
    {
      "rua": "Avenida Antônio Carlos Reis",
      "numero": 2192,
      "bairro": "Novo Horizonte",
      "cidade": "Macapá",
      "estado": "Amapá",
      "cep": "68909816"
    },
    {
      "rua": "Avenida Antônio Carlos Reis",
      "numero": 2192,
      "bairro": "Novo Horizonte",
      "cidade": "Macapá",
      "estado": "Amapá",
      "cep": "68909816"
    }
  ]
}
```

**O que este exemplo demonstra:**

- **Campos simples:** `nome`, `matricula`, `curso`.
- **Campo opcional/vazio:** `nomeSocial` fica como string vazia quando não se aplica.
- **Array de objetos:** `disciplinas`, em que cada item tem `nome` e `nota`. Em um modelo relacional isso exigiria uma tabela separada e um JOIN.
- **Array de endereços:** `endereco` permite que o aluno tenha mais de um endereço (residencial, comercial etc.).
- **Data em formato ISO 8601:** `AAAA-MM-DD`, que é padronizado e ordenável.
- **CEP como string:** evita perder zeros à esquerda e não é usado em cálculos.

> **Observação:** os dois endereços do exemplo são idênticos, só para ilustrar o array. Em um caso real, cada item teria dados diferentes, ou um campo `tipo` (`"residencial"`, `"comercial"`) para diferenciá-los.

---

## Exemplo 2 — Produto de loja (`produto-loja-notebook.json`)

```json
{
  "nome": "Notebook Ultra X1",
  "categoria": "Informática",
  "preco": 4599.99,
  "estoque": 21,
  "especificacoesTecnicas": {
    "ram": "16GB",
    "processador": "Intel core i7 14700HS",
    "armazenamento": "1TB"
  },
  "tags": ["notebook", "ultrabook", "informatica"]
}
```

**O que este exemplo demonstra:**

- **Números:** `preco` (decimal) e `estoque` (inteiro).
- **Documento embutido:** `especificacoesTecnicas` agrupa as características técnicas em um objeto.
- **Esquema flexível:** cada categoria de produto pode ter especificações diferentes. Uma camiseta teria `tamanho` e `cor`, por exemplo, sem precisar alterar uma estrutura de tabela.
- **Array de strings:** `tags` facilita buscas e filtros por palavra-chave.

---

## Exemplo 3 — Post de rede social (`post-de-rede-social.json`)

```json
{
  "texto": "The Baron of Gravity, Dagon Full Fight...",
  "autor": "Keiito",
  "data": "2026-10-17",
  "curtidas": [
    { "autor": "Wisdomiswonder" },
    { "autor": "vanityform8364" },
    { "autor": "Darkjuniol" }
  ],
  "comentarios": [
    {
      "autor": "@morfeu.",
      "texto": "idk if this is a deepwoken or parry slop but black clover was IN NEED of a decent game",
      "data": "2026-10-17"
    },
    {
      "autor": "@mkp_Kaizz",
      "texto": "This boss seems bland, I feel like he needs a second form but idk",
      "data": "2026-10-17"
    },
    {
      "autor": "@Wisdomiswonder",
      "texto": "Ever since the new season of black clover dropped I’ve been wanting a good black clover game",
      "data": "2026-10-17"
    }
  ]
}
```

**O que este exemplo demonstra:**

- **Vários arrays no mesmo documento:** `curtidas` e `comentarios`.
- **Objetos aninhados em listas:** cada comentário tem seu próprio `autor`, `texto` e `data`.
- **Leitura em uma única consulta:** o post vem completo, com curtidas e comentários, sem JOINs.

**Ponto de atenção:** como curtidas e comentários ficam dentro do post, o documento cresce a cada interação. Em posts muito populares, o ideal é guardar comentários em uma coleção separada e **referenciar** o post por um `postId`. Um banco como o MongoDB limita cada documento a 16 MB.

---

## Comparação dos três modelos

| Documento | Campos simples | Objeto embutido | Array de valores | Array de objetos |
| --------- | :------------: | :-------------: | :--------------: | :--------------: |
| Aluno     | ✅ | —  | —  | ✅ (`disciplinas`, `endereco`) |
| Produto   | ✅ | ✅ (`especificacoesTecnicas`) | ✅ (`tags`) | — |
| Post      | ✅ | —  | —  | ✅ (`curtidas`, `comentarios`) |

## Boas práticas vistas na aula

- Usar nomes de campos em `camelCase` e consistentes entre documentos.
- Embutir dados que são lidos juntos; referenciar dados grandes ou compartilhados.
- Guardar datas em formato ISO 8601.
- Escolher o tipo certo para cada campo (número para cálculo, string para identificadores como CEP e matrícula).
- Pensar na modelagem a partir de **como os dados serão consultados**, e não só de como são organizados.

## Como validar os arquivos

Para conferir se o JSON está bem formado, pelo terminal, usando o Node.js:

```bash
node -e "JSON.parse(require('fs').readFileSync('aluno-escola.json', 'utf8')); console.log('JSON válido')"
```

Ou abra o arquivo no VS Code: erros de sintaxe aparecem sublinhados.

## Autor

**Leonardo Queiroz** — Técnico em Desenvolvimento de Sistemas (SENAI)