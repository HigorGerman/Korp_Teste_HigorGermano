namespace Stock.API.Repositories;

using Stock.API.Models;
using Microsoft.Extensions.Configuration;
using Npgsql;

public class IdempotenciaRepository : IIdempotenciaRepository
{
    private readonly string _connectionString;

    public IdempotenciaRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' não configurada.");
        
        InicializarTabela();
    }

    private void InicializarTabela()
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            connection.Open();

            var sqlCreate = @"
                CREATE TABLE IF NOT EXISTS idempotencia_chaves (
                    chave VARCHAR(255) PRIMARY KEY,
                    resultado_json TEXT NOT NULL,
                    status_code INT NOT NULL,
                    data_criacao TIMESTAMP NOT NULL
                );
            ";

            using var cmdCreate = new NpgsqlCommand(sqlCreate, connection);
            cmdCreate.ExecuteNonQuery();
        }
        catch
        {
            // Resiliente para não interromper a inicialização da API se a base ainda não estiver pronta
        }
    }

    public async Task<IdempotenciaRegistro?> ObterPorChaveAsync(string chave)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var sql = "SELECT chave, resultado_json, status_code, data_criacao FROM idempotencia_chaves WHERE chave = @chave;";
        using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("@chave", chave);

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new IdempotenciaRegistro
            {
                Chave = reader.GetString(0),
                ResultadoJson = reader.GetString(1),
                StatusCode = reader.GetInt32(2),
                DataCriacao = reader.GetDateTime(3)
            };
        }

        return null;
    }

    public async Task SalvarAsync(IdempotenciaRegistro registro)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var sql = @"
            INSERT INTO idempotencia_chaves (chave, resultado_json, status_code, data_criacao)
            VALUES (@chave, @resultadoJson, @statusCode, @dataCriacao)
            ON CONFLICT (chave) DO NOTHING;
        ";

        using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("@chave", registro.Chave);
        command.Parameters.AddWithValue("@resultadoJson", registro.ResultadoJson);
        command.Parameters.AddWithValue("@statusCode", registro.StatusCode);
        command.Parameters.AddWithValue("@dataCriacao", registro.DataCriacao);

        await command.ExecuteNonQueryAsync();
    }
}
