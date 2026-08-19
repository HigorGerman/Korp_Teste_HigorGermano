namespace Stock.API.DTOs;

public class CriarProdutoDto
{
    public string Codigo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public int SaldoInicial { get; set; }
}
