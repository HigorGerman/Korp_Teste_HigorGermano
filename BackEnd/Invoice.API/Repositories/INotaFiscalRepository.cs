namespace Invoice.API.Repositories;

using Invoice.API.Models;

public interface INotaFiscalRepository
{
    Task<IEnumerable<NotaFiscal>> ObterTodasAsync();
    Task<NotaFiscal?> ObterPorIdAsync(int id);
    Task<int> CriarAsync(NotaFiscal nota);
    Task<bool> AtualizarStatusAsync(int id, string novoStatus);
}
