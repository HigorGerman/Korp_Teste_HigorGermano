namespace Stock.API.Services;

using Stock.API.DTOs;
using Stock.API.Models;

public interface IProdutoService
{
    Task<IEnumerable<Produto>> ObterTodosAsync();
    Task<Produto?> ObterPorIdAsync(int id);
    Task<Produto> CriarAsync(CriarProdutoDto dto);
    Task<int> AbaterSaldoAsync(int id, int quantidade);
}
