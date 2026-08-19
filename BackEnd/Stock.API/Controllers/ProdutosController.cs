namespace Stock.API.Controllers;

using Stock.API.DTOs;
using Stock.API.Exceptions;
using Stock.API.Models;
using Stock.API.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/produtos")]
public class ProdutosController : ControllerBase
{
    private readonly IProdutoService _service;
    private readonly IIdempotencyService _idempotencyService;

    public ProdutosController(IProdutoService service, IIdempotencyService idempotencyService)
    {
        _service = service;
        _idempotencyService = idempotencyService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Produto>>> ObterTodos()
    {
        var produtos = await _service.ObterTodosAsync();
        return Ok(produtos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Produto>> ObterPorId(int id)
    {
        var produto = await _service.ObterPorIdAsync(id);
        if (produto == null)
        {
            return NotFound(new { message = $"Produto com ID {id} não encontrado." });
        }

        return Ok(produto);
    }

    [HttpPost]
    public async Task<ActionResult<Produto>> Criar([FromBody] CriarProdutoDto dto)
    {
        try
        {
            var produto = await _service.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = produto.Id }, produto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Rota HTTP para débito/atualização de estoque com idempotência (X-Idempotency-Key) e concorrência atômica.
    /// Leitura direta do header HTTP via Request.Headers para evitar problemas de casing ou binding.
    /// </summary>
    [HttpPost("{id:int}/abater-saldo")]
    public async Task<IActionResult> AbaterSaldo(int id, [FromBody] AbaterSaldoDto dto)
    {
        // 1. Leitura direta da chave de idempotência do cabeçalho da requisição HTTP
        var idempotencyKey = Request.Headers["X-Idempotency-Key"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(idempotencyKey))
        {
            idempotencyKey = Request.Headers["x-idempotency-key"].FirstOrDefault();
        }

        // 2. Verificação de Idempotência: Se a chave foi enviada e já foi processada anteriormente,
        // retorna exatamente a mesma resposta armazenada sem alterar o estoque novamente.
        if (!string.IsNullOrWhiteSpace(idempotencyKey))
        {
            var registroSalvo = await _idempotencyService.ObterPorChaveAsync(idempotencyKey);
            if (registroSalvo != null)
            {
                return new ContentResult
                {
                    Content = registroSalvo.ResultadoJson,
                    ContentType = "application/json",
                    StatusCode = registroSalvo.StatusCode
                };
            }
        }

        // 3. Processamento normal da transação de abater saldo
        try
        {
            var novoSaldo = await _service.AbaterSaldoAsync(id, dto.Quantidade);
            var respostaSucesso = new 
            { 
                message = "Saldo abatido com sucesso.", 
                produtoId = id, 
                novoSaldo 
            };

            if (!string.IsNullOrWhiteSpace(idempotencyKey))
            {
                await _idempotencyService.SalvarAsync(idempotencyKey, 200, respostaSucesso);
            }

            return Ok(respostaSucesso);
        }
        catch (KeyNotFoundException ex)
        {
            var respostaErro = new { message = ex.Message };
            if (!string.IsNullOrWhiteSpace(idempotencyKey))
            {
                await _idempotencyService.SalvarAsync(idempotencyKey, 404, respostaErro);
            }
            return NotFound(respostaErro);
        }
        catch (ArgumentException ex)
        {
            var respostaErro = new { message = ex.Message };
            if (!string.IsNullOrWhiteSpace(idempotencyKey))
            {
                await _idempotencyService.SalvarAsync(idempotencyKey, 400, respostaErro);
            }
            return BadRequest(respostaErro);
        }
        catch (EstoqueInsuficienteException ex)
        {
            var respostaErro = new { message = ex.Message };
            if (!string.IsNullOrWhiteSpace(idempotencyKey))
            {
                await _idempotencyService.SalvarAsync(idempotencyKey, 409, respostaErro);
            }
            return Conflict(respostaErro);
        }
    }
}
