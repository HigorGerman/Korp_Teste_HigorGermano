namespace Stock.API.Controllers;

using Stock.API.DTOs;
using Stock.API.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/produtos/analise-ia")]
public class StockAiController : ControllerBase
{
    private readonly IStockAiService _aiService;

    public StockAiController(IStockAiService aiService)
    {
        _aiService = aiService;
    }

    /// <summary>
    /// Endpoint de IA para análise preditiva do estoque e recomendações de reposição.
    /// GET /api/produtos/analise-ia
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<AnaliseEstoqueIaDto>> ObterAnaliseEstoque()
    {
        var analise = await _aiService.GerarAnaliseEstoqueAsync();
        return Ok(analise);
    }
}
