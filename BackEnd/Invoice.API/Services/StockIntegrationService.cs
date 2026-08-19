namespace Invoice.API.Services;

using System.Net.Http.Json;
using Microsoft.Extensions.Logging;

public interface IStockIntegrationService
{
    Task<bool> AbaterSaldoEstoqueAsync(int produtoId, int quantidade);
}

public class StockIntegrationService : IStockIntegrationService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<StockIntegrationService> _logger;

    public StockIntegrationService(HttpClient httpClient, ILogger<StockIntegrationService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> AbaterSaldoEstoqueAsync(int produtoId, int quantidade)
    {
        try
        {
            var requestUri = $"api/produtos/{produtoId}/abater-saldo";
            var payload = new { quantidade };

            var response = await _httpClient.PostAsJsonAsync(requestUri, payload);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Falha ao abater saldo do produto {ProdutoId}. Status: {StatusCode}, Erro: {Error}", 
                    produtoId, response.StatusCode, errorContent);
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro de comunicação ao tentar abater saldo do produto {ProdutoId} na Stock.API", produtoId);
            return false;
        }
    }
}
