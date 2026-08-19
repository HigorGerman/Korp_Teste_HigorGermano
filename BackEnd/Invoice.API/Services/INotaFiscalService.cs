namespace Invoice.API.Services;

using Invoice.API.DTOs;
using Invoice.API.Models;

public interface INotaFiscalService
{
    Task<IEnumerable<NotaFiscal>> ObterTodasAsync();
    Task<NotaFiscal?> ObterPorIdAsync(int id);
    Task<NotaFiscal> CriarAsync(CriarNotaFiscalDto dto);
    Task<(bool Sucesso, string Mensagem)> ImprimirAsync(int id);
}
