namespace Stock.API.Repositories;

using Stock.API.Models;

public interface IIdempotenciaRepository
{
    Task<IdempotenciaRegistro?> ObterPorChaveAsync(string chave);
    Task SalvarAsync(IdempotenciaRegistro registro);
}
