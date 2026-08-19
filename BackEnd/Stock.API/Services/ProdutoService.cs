namespace Stock.API.Services;

using Stock.API.DTOs;
using Stock.API.Exceptions;
using Stock.API.Models;
using Stock.API.Repositories;

public class ProdutoService : IProdutoService
{
    private readonly IProdutoRepository _repository;

    public ProdutoService(IProdutoRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Produto>> ObterTodosAsync()
    {
        return await _repository.ObterTodosAsync();
    }

    public async Task<Produto?> ObterPorIdAsync(int id)
    {
        return await _repository.ObterPorIdAsync(id);
    }

    public async Task<Produto> CriarAsync(CriarProdutoDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Codigo) || string.IsNullOrWhiteSpace(dto.Descricao))
        {
            throw new ArgumentException("Código e Descrição são obrigatórios.");
        }

        var produto = new Produto
        {
            Codigo = dto.Codigo.Trim(),
            Descricao = dto.Descricao.Trim(),
            Saldo = dto.SaldoInicial
        };

        var id = await _repository.CriarAsync(produto);
        produto.Id = id;
        return produto;
    }

    /// <summary>
    /// Abate o saldo de um produto de forma segura para concorrência.
    /// Lança EstoqueInsuficienteException caso a instrução SQL atômica retorne 0 linhas afetadas no repositório.
    /// </summary>
    public async Task<int> AbaterSaldoAsync(int id, int quantidade)
    {
        if (quantidade <= 0)
        {
            throw new ArgumentException("A quantidade a ser abatida deve ser maior que zero.");
        }

        var produto = await _repository.ObterPorIdAsync(id);
        if (produto == null)
        {
            throw new KeyNotFoundException($"Produto com ID {id} não foi encontrado no estoque.");
        }

        // Tenta abater o saldo com a query SQL atômica no banco de dados.
        // Se duas transações concorrentes tentarem abater o estoque simultaneamente e o saldo restante
        // for insuficiente no momento do commit da segunda, AbaterSaldoAsync retornará false (0 linhas afetadas).
        var sucesso = await _repository.AbaterSaldoAsync(id, quantidade);
        if (!sucesso)
        {
            throw new EstoqueInsuficienteException(
                $"Saldo insuficiente ou conflito de concorrência para o produto '{produto.Descricao}' (Código: {produto.Codigo}, ID: {id}). " +
                $"Saldo disponível no momento do início da operação: {produto.Saldo}, quantidade solicitada: {quantidade}."
            );
        }

        var produtoAtualizado = await _repository.ObterPorIdAsync(id);
        return produtoAtualizado?.Saldo ?? (produto.Saldo - quantidade);
    }
}
