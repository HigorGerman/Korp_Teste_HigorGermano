namespace Stock.API.Repositories;

using Stock.API.Models;

public interface IProdutoRepository
{
    Task<IEnumerable<Produto>> ObterTodosAsync();
    Task<Produto?> ObterPorIdAsync(int id);
    Task<int> CriarAsync(Produto produto);
    /// <summary>
    /// Executa a atualização de estoque de forma atômica no banco de dados.
    /// </summary>
    /// <returns>True se o saldo foi abatido com sucesso (rowsAffected > 0); False se o saldo for insuficiente ou o registro não existir (rowsAffected == 0).</returns>
    Task<bool> AbaterSaldoAsync(int id, int quantidade);
}
