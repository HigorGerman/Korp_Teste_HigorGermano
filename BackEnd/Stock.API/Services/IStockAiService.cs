namespace Stock.API.Services;

using Stock.API.DTOs;

public interface IStockAiService
{
    Task<AnaliseEstoqueIaDto> GerarAnaliseEstoqueAsync();
}
