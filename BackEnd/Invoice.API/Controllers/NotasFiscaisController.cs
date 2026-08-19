namespace Invoice.API.Controllers;

using Invoice.API.DTOs;
using Invoice.API.Models;
using Invoice.API.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/notas")]
public class NotasFiscaisController : ControllerBase
{
    private readonly INotaFiscalService _service;

    public NotasFiscaisController(INotaFiscalService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotaFiscalResponseDto>>> ObterTodas()
    {
        var notas = await _service.ObterTodasAsync();
        var response = notas.Select(MapToResponseDto);
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<NotaFiscalResponseDto>> ObterPorId(int id)
    {
        var nota = await _service.ObterPorIdAsync(id);
        if (nota == null)
        {
            return NotFound(new { message = $"Nota fiscal com ID {id} não encontrada." });
        }

        return Ok(MapToResponseDto(nota));
    }

    [HttpPost]
    public async Task<ActionResult<NotaFiscalResponseDto>> Criar([FromBody] CriarNotaFiscalDto dto)
    {
        try
        {
            var notaCriada = await _service.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = notaCriada.Id }, MapToResponseDto(notaCriada));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/imprimir")]
    public async Task<IActionResult> Imprimir(int id)
    {
        var (sucesso, mensagem) = await _service.ImprimirAsync(id);
        if (!sucesso)
        {
            if (mensagem.Contains("não encontrada"))
            {
                return NotFound(new { message = mensagem });
            }
            return BadRequest(new { message = mensagem });
        }

        return Ok(new { message = mensagem, status = "Fechada" });
    }

    private static NotaFiscalResponseDto MapToResponseDto(NotaFiscal nota)
    {
        return new NotaFiscalResponseDto
        {
            Id = nota.Id,
            Numero = nota.Numero,
            Status = nota.Status,
            DataCriacao = nota.DataCriacao,
            Itens = nota.Itens.Select(i => new ItemNotaFiscalResponseDto
            {
                Id = i.Id,
                NotaFiscalId = i.NotaFiscalId,
                ProdutoId = i.ProdutoId,
                Quantidade = i.Quantidade
            }).ToList()
        };
    }
}
