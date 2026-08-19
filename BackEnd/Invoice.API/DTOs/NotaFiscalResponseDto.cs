namespace Invoice.API.DTOs;

public class NotaFiscalResponseDto
{
    public int Id { get; set; }
    public int Numero { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; }
    public List<ItemNotaFiscalResponseDto> Itens { get; set; } = new();
}
