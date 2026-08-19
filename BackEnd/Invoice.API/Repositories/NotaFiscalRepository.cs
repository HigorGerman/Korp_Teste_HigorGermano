namespace Invoice.API.Repositories;

using Invoice.API.Models;
using Microsoft.Extensions.Configuration;
using Npgsql;

public class NotaFiscalRepository : INotaFiscalRepository
{
    private readonly string _connectionString;

    public NotaFiscalRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' não configurada.");
        
        InicializarTabelas();
    }

    private void InicializarTabelas()
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            connection.Open();

            var sql = @"
                CREATE TABLE IF NOT EXISTS notas_fiscais (
                    id SERIAL PRIMARY KEY,
                    numero INT NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL
                );

                CREATE TABLE IF NOT EXISTS itens_nota_fiscal (
                    id SERIAL PRIMARY KEY,
                    nota_fiscal_id INT NOT NULL REFERENCES notas_fiscais(id) ON DELETE CASCADE,
                    produto_id INT NOT NULL,
                    quantidade INT NOT NULL
                );
            ";

            using var command = new NpgsqlCommand(sql, connection);
            command.ExecuteNonQuery();
        }
        catch
        {
            // Permite falha silenciosa no ctor se o DB ainda não estiver online no startup
        }
    }

    public async Task<IEnumerable<NotaFiscal>> ObterTodasAsync()
    {
        var notas = new List<NotaFiscal>();

        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var sqlNotas = "SELECT id, numero, status, data_criacao FROM notas_fiscais ORDER BY id DESC;";
        using (var cmdNotas = new NpgsqlCommand(sqlNotas, connection))
        using (var reader = await cmdNotas.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                notas.Add(new NotaFiscal
                {
                    Id = reader.GetInt32(0),
                    Numero = reader.GetInt32(1),
                    Status = reader.GetString(2),
                    DataCriacao = reader.GetDateTime(3),
                    Itens = new List<ItemNotaFiscal>()
                });
            }
        }

        foreach (var nota in notas)
        {
            var sqlItens = "SELECT id, nota_fiscal_id, produto_id, quantidade FROM itens_nota_fiscal WHERE nota_fiscal_id = @notaFiscalId;";
            using var cmdItens = new NpgsqlCommand(sqlItens, connection);
            cmdItens.Parameters.AddWithValue("@notaFiscalId", nota.Id);

            using var readerItens = await cmdItens.ExecuteReaderAsync();
            while (await readerItens.ReadAsync())
            {
                nota.Itens.Add(new ItemNotaFiscal
                {
                    Id = readerItens.GetInt32(0),
                    NotaFiscalId = readerItens.GetInt32(1),
                    ProdutoId = readerItens.GetInt32(2),
                    Quantidade = readerItens.GetInt32(3)
                });
            }
        }

        return notas;
    }

    public async Task<NotaFiscal?> ObterPorIdAsync(int id)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        NotaFiscal? nota = null;
        var sqlNota = "SELECT id, numero, status, data_criacao FROM notas_fiscais WHERE id = @id;";
        using (var cmdNota = new NpgsqlCommand(sqlNota, connection))
        {
            cmdNota.Parameters.AddWithValue("@id", id);
            using var reader = await cmdNota.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                nota = new NotaFiscal
                {
                    Id = reader.GetInt32(0),
                    Numero = reader.GetInt32(1),
                    Status = reader.GetString(2),
                    DataCriacao = reader.GetDateTime(3),
                    Itens = new List<ItemNotaFiscal>()
                };
            }
        }

        if (nota == null) return null;

        var sqlItens = "SELECT id, nota_fiscal_id, produto_id, quantidade FROM itens_nota_fiscal WHERE nota_fiscal_id = @notaFiscalId;";
        using (var cmdItens = new NpgsqlCommand(sqlItens, connection))
        {
            cmdItens.Parameters.AddWithValue("@notaFiscalId", id);
            using var readerItens = await cmdItens.ExecuteReaderAsync();
            while (await readerItens.ReadAsync())
            {
                nota.Itens.Add(new ItemNotaFiscal
                {
                    Id = readerItens.GetInt32(0),
                    NotaFiscalId = readerItens.GetInt32(1),
                    ProdutoId = readerItens.GetInt32(2),
                    Quantidade = readerItens.GetInt32(3)
                });
            }
        }

        return nota;
    }

    public async Task<int> CriarAsync(NotaFiscal nota)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        using var transaction = await connection.BeginTransactionAsync();

        try
        {
            var sqlNextNumero = "SELECT COALESCE(MAX(numero), 0) + 1 FROM notas_fiscais;";
            using var cmdNumero = new NpgsqlCommand(sqlNextNumero, connection, transaction);
            var nextNumeroObj = await cmdNumero.ExecuteScalarAsync();
            var nextNumero = Convert.ToInt32(nextNumeroObj);

            nota.Numero = nextNumero;
            if (nota.DataCriacao == default)
            {
                nota.DataCriacao = DateTime.UtcNow;
            }

            var sqlInsertNota = @"
                INSERT INTO notas_fiscais (numero, status, data_criacao)
                VALUES (@numero, @status, @dataCriacao)
                RETURNING id;
            ";

            using var cmdInsertNota = new NpgsqlCommand(sqlInsertNota, connection, transaction);
            cmdInsertNota.Parameters.AddWithValue("@numero", nota.Numero);
            cmdInsertNota.Parameters.AddWithValue("@status", nota.Status ?? "Aberta");
            cmdInsertNota.Parameters.AddWithValue("@dataCriacao", nota.DataCriacao);

            var newIdObj = await cmdInsertNota.ExecuteScalarAsync();
            var newId = Convert.ToInt32(newIdObj);
            nota.Id = newId;

            if (nota.Itens != null && nota.Itens.Any())
            {
                foreach (var item in nota.Itens)
                {
                    var sqlInsertItem = @"
                        INSERT INTO itens_nota_fiscal (nota_fiscal_id, produto_id, quantidade)
                        VALUES (@notaFiscalId, @produtoId, @quantidade)
                        RETURNING id;
                    ";
                    using var cmdInsertItem = new NpgsqlCommand(sqlInsertItem, connection, transaction);
                    cmdInsertItem.Parameters.AddWithValue("@notaFiscalId", newId);
                    cmdInsertItem.Parameters.AddWithValue("@produtoId", item.ProdutoId);
                    cmdInsertItem.Parameters.AddWithValue("@quantidade", item.Quantidade);

                    var itemIdObj = await cmdInsertItem.ExecuteScalarAsync();
                    item.Id = Convert.ToInt32(itemIdObj);
                    item.NotaFiscalId = newId;
                }
            }

            await transaction.CommitAsync();
            return newId;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> AtualizarStatusAsync(int id, string novoStatus)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var sql = "UPDATE notas_fiscais SET status = @status WHERE id = @id;";
        using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("@status", novoStatus);
        command.Parameters.AddWithValue("@id", id);

        var rowsAffected = await command.ExecuteNonQueryAsync();
        return rowsAffected > 0;
    }
}
