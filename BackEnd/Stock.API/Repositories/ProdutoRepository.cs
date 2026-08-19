namespace Stock.API.Repositories;

using Stock.API.Models;
using Microsoft.Extensions.Configuration;
using Npgsql;

public class ProdutoRepository : IProdutoRepository
{
    private readonly string _connectionString;

    public ProdutoRepository(IConfiguration configuration)
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
                CREATE TABLE IF NOT EXISTS produtos (
                    id SERIAL PRIMARY KEY,
                    codigo VARCHAR(50) NOT NULL,
                    descricao VARCHAR(255) NOT NULL,
                    saldo INT NOT NULL
                );
            ";

            using var cmdCreate = new NpgsqlCommand(sqlCreate, connection);
            cmdCreate.ExecuteNonQuery();

            var sqlCount = "SELECT COUNT(*) FROM produtos;";
            using var cmdCount = new NpgsqlCommand(sqlCount, connection);
            var count = Convert.ToInt32(cmdCount.ExecuteScalar());

            if (count == 0)
            {
                var sqlSeed = @"
                    INSERT INTO produtos (codigo, descricao, saldo) VALUES
                    ('PRD-001', 'Cabo HDMI 2.1 — 2m', 148),
                    ('PRD-002', 'Teclado mecânico ABNT2', 32),
                    ('PRD-003', 'Monitor 24"" Full HD', 12),
                    ('PRD-004', 'Suporte articulado para monitor', 0);
                ";
                using var cmdSeed = new NpgsqlCommand(sqlSeed, connection);
                cmdSeed.ExecuteNonQuery();
            }
        }
        catch
        {
            // Evita falha no construtor caso o PostgreSQL ainda não esteja disponível no startup
        }
    }

    public async Task<IEnumerable<Produto>> ObterTodosAsync()
    {
        var produtos = new List<Produto>();

        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var sql = "SELECT id, codigo, descricao, saldo FROM produtos ORDER BY id;";
        using var command = new NpgsqlCommand(sql, connection);
        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            produtos.Add(new Produto
            {
                Id = reader.GetInt32(0),
                Codigo = reader.GetString(1),
                Descricao = reader.GetString(2),
                Saldo = reader.GetInt32(3)
            });
        }

        return produtos;
    }

    public async Task<Produto?> ObterPorIdAsync(int id)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var sql = "SELECT id, codigo, descricao, saldo FROM produtos WHERE id = @id;";
        using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("@id", id);

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new Produto
            {
                Id = reader.GetInt32(0),
                Codigo = reader.GetString(1),
                Descricao = reader.GetString(2),
                Saldo = reader.GetInt32(3)
            };
        }

        return null;
    }

    public async Task<int> CriarAsync(Produto produto)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var sql = @"
            INSERT INTO produtos (codigo, descricao, saldo)
            VALUES (@codigo, @descricao, @saldo)
            RETURNING id;
        ";

        using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("@codigo", produto.Codigo);
        command.Parameters.AddWithValue("@descricao", produto.Descricao);
        command.Parameters.AddWithValue("@saldo", produto.Saldo);

        var result = await command.ExecuteScalarAsync();
        return Convert.ToInt32(result);
    }

    /// <summary>
    /// Atualiza o saldo do produto de forma ATÔMICA no banco de dados PostgreSQL.
    /// A instrução UPDATE com a condição 'AND saldo >= @quantidade' garante que a verificação
    /// e a decretação do saldo ocorram em um único comando indivisível no nível de linha (Row-Level Lock).
    /// </summary>
    public async Task<bool> AbaterSaldoAsync(int id, int quantidade)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        // SQL defensivo para concorrência atômica:
        // Garante que o saldo só é deduzido se saldo for maior ou igual à quantidade no momento exato do commit/execução.
        var sql = "UPDATE produtos SET saldo = saldo - @quantidade WHERE id = @id AND saldo >= @quantidade;";
        using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("@quantidade", quantidade);
        command.Parameters.AddWithValue("@id", id);

        // ExecuteNonQueryAsync() retorna o número de linhas afetadas.
        // Se retornar 0, significa que no momento exato da atualização o saldo era menor que a quantidade
        // ou o produto não foi encontrado, prevenindo Race Conditions e Estoque Negativo.
        var rowsAffected = await command.ExecuteNonQueryAsync();
        return rowsAffected > 0;
    }
}
