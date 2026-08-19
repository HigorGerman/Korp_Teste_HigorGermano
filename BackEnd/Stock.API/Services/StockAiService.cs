namespace Stock.API.Services;

using Stock.API.DTOs;
using Stock.API.Repositories;

public class StockAiService : IStockAiService
{
    private readonly IProdutoRepository _repository;

    public StockAiService(IProdutoRepository repository)
    {
        _repository = repository;
    }

    public async Task<AnaliseEstoqueIaDto> GerarAnaliseEstoqueAsync()
    {
        var produtos = (await _repository.ObterTodosAsync()).ToList();

        var totalProdutos = produtos.Count;
        var produtosCriticosList = produtos.Where(p => p.Saldo <= 5).ToList();
        var produtosZerados = produtos.Count(p => p.Saldo == 0);
        var saldoTotal = produtos.Sum(p => p.Saldo);

        string resumoGeral;
        if (totalProdutos == 0)
        {
            resumoGeral = "Nenhum produto cadastrado no estoque para análise.";
        }
        else if (produtosCriticosList.Count == 0)
        {
            resumoGeral = $"Diagnóstico de IA: Estoque em estado ideal. {totalProdutos} produtos ativos com saldo total de {saldoTotal} unidades. Nenhum item necessita de reposição urgente no momento.";
        }
        else
        {
            resumoGeral = $"Diagnóstico de IA: Atenção operacional necessária. Dos {totalProdutos} produtos cadastrados, {produtosCriticosList.Count} estão em nível crítico (saldo <= 5 unidades), dos quais {produtosZerados} estão totalmente zerados. Recomenda-se emissão imediata de ordens de reposição.";
        }

        var criticosDto = produtosCriticosList.Select(p => new ProdutoCriticoDto
        {
            Id = p.Id,
            Codigo = p.Codigo,
            Descricao = p.Descricao,
            SaldoAtual = p.Saldo,
            NivelRisco = p.Saldo == 0 ? "ALERTA MÁXIMO (ZERADO)" : "ALERTA MODERADO (BAIXO)"
        }).ToList();

        var sugestoesDto = produtosCriticosList.Select(p =>
        {
            const int metaEstoqueSeguranca = 30;
            int quantidadeRecomendada = metaEstoqueSeguranca - p.Saldo;

            return new SugestaoReposicaoDto
            {
                ProdutoId = p.Id,
                Produto = $"{p.Codigo} - {p.Descricao}",
                SaldoAtual = p.Saldo,
                QuantidadeRecomendada = quantidadeRecomendada,
                Prioridade = p.Saldo == 0 ? "Alta" : "Média",
                Justificativa = p.Saldo == 0
                    ? $"Produto zerado no estoque. Comprar urgentemente {quantidadeRecomendada} unidades para atender pedidos de emissão."
                    : $"Estoque atual ({p.Saldo}) abaixo da margem de segurança (5). Recomendada compra de {quantidadeRecomendada} unidades."
            };
        }).ToList();

        return new AnaliseEstoqueIaDto
        {
            ResumoGeral = resumoGeral,
            ProdutosCriticos = criticosDto,
            SugestoesReposicao = sugestoesDto
        };
    }
}
