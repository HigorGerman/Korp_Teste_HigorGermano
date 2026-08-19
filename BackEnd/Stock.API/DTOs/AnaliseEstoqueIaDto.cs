namespace Stock.API.DTOs;

public class AnaliseEstoqueIaDto
{
    public string ResumoGeral { get; set; } = string.Empty;
    public List<ProdutoCriticoDto> ProdutosCriticos { get; set; } = new();
    public List<SugestaoReposicaoDto> SugestoesReposicao { get; set; } = new();
}

public class ProdutoCriticoDto
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public int SaldoAtual { get; set; }
    public string NivelRisco { get; set; } = string.Empty;
}

public class SugestaoReposicaoDto
{
    public int ProdutoId { get; set; }
    public string Produto { get; set; } = string.Empty;
    public int SaldoAtual { get; set; }
    public int QuantidadeRecomendada { get; set; }
    public string Prioridade { get; set; } = string.Empty;
    public string Justificativa { get; set; } = string.Empty;
}
