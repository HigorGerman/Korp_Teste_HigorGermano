namespace Stock.API.Services;

using System.Collections.Concurrent;
using System.Text.Json;
using Stock.API.Models;
using Stock.API.Repositories;

public class IdempotencyService : IIdempotencyService
{
    private readonly IIdempotenciaRepository _repository;
    private static readonly ConcurrentDictionary<string, IdempotenciaRegistro> _cacheInMemory = new();

    public IdempotencyService(IIdempotenciaRepository repository)
    {
        _repository = repository;
    }

    public async Task<IdempotenciaRegistro?> ObterPorChaveAsync(string chave)
    {
        if (string.IsNullOrWhiteSpace(chave))
            return null;

        var chaveTrimmed = chave.Trim();

        // 1. Busca primeiro no cache em memória para garantia de resposta imediata
        if (_cacheInMemory.TryGetValue(chaveTrimmed, out var registroMemoria))
        {
            return registroMemoria;
        }

        // 2. Se não estiver em memória, consulta a tabela do PostgreSQL
        try
        {
            var registroDb = await _repository.ObterPorChaveAsync(chaveTrimmed);
            if (registroDb != null)
            {
                _cacheInMemory.TryAdd(chaveTrimmed, registroDb);
                return registroDb;
            }
        }
        catch
        {
            // Resiliente a falhas temporárias de conexão com o banco
        }

        return null;
    }

    public async Task SalvarAsync(string chave, int statusCode, object resultado)
    {
        if (string.IsNullOrWhiteSpace(chave))
            return;

        var chaveTrimmed = chave.Trim();

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        var registro = new IdempotenciaRegistro
        {
            Chave = chaveTrimmed,
            StatusCode = statusCode,
            ResultadoJson = JsonSerializer.Serialize(resultado, jsonOptions),
            DataCriacao = DateTime.UtcNow
        };

        // Atualiza imediatamente o cache em memória
        _cacheInMemory[chaveTrimmed] = registro;

        // Persiste de forma resiliente no PostgreSQL
        try
        {
            await _repository.SalvarAsync(registro);
        }
        catch
        {
            // Ignora exceções de persistência se a base não estiver acessível
        }
    }
}
