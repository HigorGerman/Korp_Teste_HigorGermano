namespace Stock.API.Models;

public class IdempotenciaRegistro
{
    public string Chave { get; set; } = string.Empty;
    public string ResultadoJson { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
