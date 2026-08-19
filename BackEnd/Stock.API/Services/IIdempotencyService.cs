namespace Stock.API.Services;

using Stock.API.Models;

public interface IIdempotencyService
{
    Task<IdempotenciaRegistro?> ObterPorChaveAsync(string chave);
    Task SalvarAsync(string chave, int statusCode, object resultado);
}
