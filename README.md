# 🚀 Projeto Técnico: Gestão de Estoque & Emissão de Notas Fiscais com IA Preditiva

Sistema distribuído de alta performance para controle de estoque, faturamento fiscal e diagnóstico preditivo automatizado por Inteligência Artificial. Solução desenvolvida com arquitetura de microsserviços desacoplados em **.NET 8/10**, frontend **Angular 19** e bancos de dados **PostgreSQL** isolados executados em **Docker Containers**.

---

## 📐 1. Visão Geral do Projeto & Arquitetura de Microsserviços

O projeto adota o padrão de **Arquitetura de Microsserviços Desacoplados**, onde a gestão de estoque e o faturamento operam como domínios independentes, cada um possuindo seu próprio banco de dados relacional isolado (*Database-per-Service*).

### Componentes do Sistema

* **Stock.API (Porta 5001)**: Microsserviço responsável pela gestão de produtos, controle de saldos, concorrência atômica, idempotência de requisições e análise preditiva de reposição via IA (`StockAiService`).
* **Invoice.API (Porta 5002)**: Microsserviço responsável pelo faturamento, registro de Notas Fiscais e itens associados. Integra-se via HTTP síncrono com a `Stock.API` para debitar saldos no momento da emissão/impressão da nota fiscal.
* **FrontEnd client-app (Porta 4200)**: Aplicação SPA em Angular 19 no formato *Dashboard SaaS*, oferecendo interface reativa e intuitiva para monitoramento de estoque, emissão de notas e visualização dos diagnósticos de IA.
* **Bancos de Dados PostgreSQL (Portas 5434 e 5433)**: Instâncias isoladas em containers Docker (`stock_db` e `invoice_db`).

### Diagrama de Arquitetura

```
                                  ┌──────────────────────────────────┐
                                  │   FrontEnd Angular (client-app)  │
                                  │      http://localhost:4200       │
                                  └────────────────┬─────────────────┘
                                                   │
                         ┌─────────────────────────┴─────────────────────────┐
                         │ HTTP / REST                                       │ HTTP / REST
                         ▼                                                   ▼
          ┌──────────────────────────────┐                   ┌──────────────────────────────┐
          │         Invoice.API          │   HTTP Síncrono   │          Stock.API           │
          │    (http://localhost:5002)   │ ────────────────► │    (http://localhost:5001)   │
          └──────────────┬───────────────┘                   └──────────────┬───────────────┘
                         │                                                  │
                         ▼                                                  ▼
          ┌──────────────────────────────┐                   ┌──────────────────────────────┐
          │  PostgreSQL Container        │                   │  PostgreSQL Container        │
          │  invoice_db (Porta 5433)     │                   │  stock_db (Porta 5434)       │
          └──────────────────────────────┘                   └──────────────────────────────┘
```

---

## 💻 2. Frontend (Angular 19)

O frontend foi desenvolvido utilizando **Angular 19** no padrão **Standalone Components**, proporcionando modularidade, carregamento eficiente e ausência de `NgModules` legados.

### Ciclos de Vida (`ngOnInit`)
O ciclo de vida `ngOnInit` é amplamente utilizado nos componentes para carregamento inicial de dados reativos:
* [`estoque.component.ts`](file:///Users/germano/Documents/ProjetoTecnico/FrontEnd/client-app/src/app/components/estoque/estoque.component.ts): Dispara a busca da lista de produtos e saldos via `ProdutoService`.
* [`notas-fiscais.component.ts`](file:///Users/germano/Documents/ProjetoTecnico/FrontEnd/client-app/src/app/components/notas-fiscais/notas-fiscais.component.ts): Inicializa as listagens de notas fiscais, calcula KPIs financeiros e verifica alertas de saldos críticos.
* [`stock-ai-card.component.ts`](file:///Users/germano/Documents/ProjetoTecnico/FrontEnd/client-app/src/app/components/stock-ai-card/stock-ai-card.component.ts): Executa a consulta ao endpoint de inteligência preditiva para exibir os relatórios de diagnóstico no carregamento da tela.

### Manipulação Assíncrona com RxJS e HttpClient
A comunicação com as APIs backend é intermediada por Serviços Angular (`Injectable`) que utilizam operadores reativos da biblioteca **RxJS**:
* **`Observable<T>`**: Retorno tipado em chamadas como `obterProdutos()`, `obterNotas()` e `obterAnaliseIa()`.
* **`pipe()` & `catchError()`**: Tratamento centralizado de erros em requisições HTTP, utilizando `throwError` ou fornecendo respostas de fallback gracioso para manter a estabilidade da UI caso algum serviço esteja indisponível.

### UI & Experiência do Usuário (Tailwind CSS + Angular Material)
* **Tailwind CSS v4**: Estilização baseada em utilitários de alta performance no padrão *Dashboard SaaS* moderno (estilo glassmorphism, gradientes dark mode elegantes, tipografia refinada e chips de status HSL).
* **Angular Material**: Integração do `MatDialogModule` para renderização de modais flutuantes ([`CadastrarProdutoDialogComponent`](file:///Users/germano/Documents/ProjetoTecnico/FrontEnd/client-app/src/app/components/cadastrar-produto-dialog/cadastrar-produto-dialog.component.ts) e [`CriarNotaFiscalDialogComponent`](file:///Users/germano/Documents/ProjetoTecnico/FrontEnd/client-app/src/app/components/criar-nota-fiscal-dialog/criar-nota-fiscal-dialog.component.ts)) e `MatSnackBarModule` para notificações toast em tempo real.

---

## ⚙️ 3. Backend (C# / .NET 8/10) & Banco de Dados

### Arquitetura em 3 Camadas (*3-Tier Architecture*)
Ambos os microsserviços foram estruturados em camadas bem definidas e desacopladas por Interfaces:
1. **Controllers (Camada de Apresentação / API)**: Expõe os endpoints REST (`[ApiController]`, `[Route]`), realiza validações de entrada e trata o mapeamento dos códigos de status HTTP.
2. **Services (Camada de Regras de Negócio)**: Processa as validações de domínio, orquestra integrações de rede e aplica regras operacionais.
3. **Repositories (Camada de Acesso a Dados)**: Executa operações diretas no banco de dados via consultas SQL otimizadas.

### Persistência Nativa com ADO.NET (Npgsql + PostgreSQL)
Em vez de ORMs pesados, a persistência foi construída com **ADO.NET** nativo utilizando o driver de alta performance `Npgsql`:
* Conexões otimizadas com `NpgsqlConnection` e comandos preparados com `NpgsqlCommand`.
* **Inicialização Automática de Tabelas**: Os repositórios executam DDLs automáticas (`CREATE TABLE IF NOT EXISTS`) e inserção de dados iniciais (*Seed*) na inicialização da aplicação, tornando o ambiente autorrecuperável.
* **Transações SQL ACID**: Na `Invoice.API`, o método `CriarAsync` utiliza `BeginTransactionAsync()`, `CommitAsync()` e `RollbackAsync()` para garantir a inserção atômica da nota e de seus respectivos itens.

### Uso de LINQ na Camada de IA (`StockAiService`)
No microsserviço [`StockAiService.cs`](file:///Users/germano/Documents/ProjetoTecnico/BackEnd/Stock.API/Services/StockAiService.cs), consultas declarativas com **LINQ** são empregadas para processar o diagnóstico em memória com máxima eficiência:
```csharp
var totalProdutos = produtos.Count;
var produtosCriticosList = produtos.Where(p => p.Saldo <= 5).ToList();
var produtosZerados = produtos.Count(p => p.Saldo == 0);
var saldoTotal = produtos.Sum(p => p.Saldo);
```

### Tratamento de Exceções & Mapeamento de Status HTTP
A API traduz exceções de domínio em códigos de status HTTP semânticos e padronizados no [`ProdutosController.cs`](file:///Users/germano/Documents/ProjetoTecnico/BackEnd/Stock.API/Controllers/ProdutosController.cs):

| Exceção Lançada | Status HTTP Retornado | Descrição do Caso de Uso |
| :--- | :--- | :--- |
| `ArgumentException` | `400 Bad Request` | Parâmetros inválidos (ex: quantidade $\le 0$ ou campos obrigatórios vazios). |
| `KeyNotFoundException` | `404 Not Found` | Produto ou Nota Fiscal não encontrados pelo ID informado. |
| `EstoqueInsuficienteException` | `409 Conflict` | Tentativa de abater saldo superior à quantidade disponível em estoque. |
| Operação Concluída | `200 OK` / `201 Created` | Sucesso no processamento (`CreatedAtAction` para novas entidades). |

---

## 🌟 4. Requisitos Opcionais Implementados

### 🔒 A. Concorrência Atômica no PostgreSQL
Para prevenir *Race Conditions* e impedir estoque negativo em cenários de requisições simultâneas concorrentes, a dedução de saldo no [`ProdutoRepository.cs`](file:///Users/germano/Documents/ProjetoTecnico/BackEnd/Stock.API/Repositories/ProdutoRepository.cs#L135-L152) é feita em comando SQL indivisível no nível de linha (*Row-Level Lock*):

```sql
UPDATE produtos 
SET saldo = saldo - @quantidade 
WHERE id = @id AND saldo >= @quantidade;
```
* Se duas transações tentarem abater o mesmo item concorrentemente e o saldo restante for insuficiente para a segunda, a consulta retorna `0 linhas afetadas`.
* O repositório detecta o retorno zero e lança a exceção `EstoqueInsuficienteException`, resultando no status `HTTP 409 Conflict`.

### 🧠 B. Inteligência Preditiva de Estoque (Stock AI)
Endpoint `GET /api/produtos/analise-ia` implementado no [`StockAiController.cs`](file:///Users/germano/Documents/ProjetoTecnico/BackEnd/Stock.API/Controllers/StockAiController.cs):
* Analisa continuamente o saldo atual dos produtos cadastrados.
* Classifica os itens em categorias de risco (`ALERTA MÁXIMO (ZERADO)` vs `ALERTA MODERADO (BAIXO)`).
* Gera automaticamente sugestões de ordens de reposição com calculadoras de *Estoque de Segurança* (Target: 30 unidades) e justificativas de compra operacionais.

### 🔑 C. Controle de Idempotência (`X-Idempotency-Key`)
Para evitar duplicidade de abatimento de estoque decorrente de retentativas de rede, o endpoint `POST /api/produtos/{id}/abater-saldo` implementa verificação de idempotência no [`IdempotencyService.cs`](file:///Users/germano/Documents/ProjetoTecnico/BackEnd/Stock.API/Services/IdempotencyService.cs):
1. **Leitura da Chave**: Extrai a chave enviada no cabeçalho HTTP `X-Idempotency-Key`.
2. **Cache Multinível**: Verifica primeiramente em um cache rápido em memória (`ConcurrentDictionary`) e, em seguida, na tabela `idempotencia_chaves` no PostgreSQL.
3. **Replay de Resposta**: Se a chave já foi processada anteriormente, retorna instantaneamente o `StatusCode` e o `ResultadoJson` idênticos à primeira chamada, sem alterar a base de dados novamente.

---

## 🛠️ 5. Instruções para Execução

### Pré-requisitos
* [.NET 8 SDK ou .NET 10 SDK](https://dotnet.microsoft.com/) instalado.
* [Node.js](https://nodejs.org/) (v18+) e NPM instalados.
* [Docker & Docker Compose](https://www.docker.com/) em execução.

---

### Passo 1: Subir os Bancos de Dados PostgreSQL via Docker
Na raiz do projeto (`/ProjetoTecnico`), execute:

```bash
docker compose up -d
```
*Isso iniciará o `stock_db` na porta **5434** e o `invoice_db` na porta **5433**.*

---

### Passo 2: Executar as APIs Backend (.NET)

Abra dois terminais distintos:

**Terminal 1 — Stock.API (Porta 5001):**
```bash
cd BackEnd/Stock.API
dotnet run
```

**Terminal 2 — Invoice.API (Porta 5002):**
```bash
cd BackEnd/Invoice.API
dotnet run
```

---

### Passo 3: Executar o Frontend Angular (Porta 4200)

Em um terceiro terminal:

```bash
cd FrontEnd/client-app
npm install
npm start
```

Acesse a aplicação no seu navegador em: **`http://localhost:4200`**

---

## 📊 Resumo das Portas do Sistema

| Serviço | Tipo / Tecnologia | URL / Porta |
| :--- | :--- | :--- |
| **FrontEnd App** | Angular 19 SPA | `http://localhost:4200` |
| **Stock.API** | Web API C# .NET | `http://localhost:5001` |
| **Invoice.API** | Web API C# .NET | `http://localhost:5002` |
| **PostgreSQL Stock** | Banco `stock_db` | `localhost:5434` |
| **PostgreSQL Invoice** | Banco `invoice_db` | `localhost:5433` |
