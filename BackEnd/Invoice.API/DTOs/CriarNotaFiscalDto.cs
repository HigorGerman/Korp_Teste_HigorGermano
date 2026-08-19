namespace Invoice.API.DTOs;

public class CriarNotaFiscalDto
{
    public List<CriarItemNotaFiscalDto> Itens { get; set; } = new();
}
