export interface ProdutoCritico {
  id: number;
  codigo: string;
  descricao: string;
  saldoAtual: number;
  nivelRisco: string;
}

export interface SugestaoReposicao {
  produtoId: number;
  produto: string;
  saldoAtual: number;
  quantidadeRecomendada: number;
  prioridade: string;
  justificativa: string;
}

export interface AnaliseEstoqueIa {
  resumoGeral: string;
  produtosCriticos: ProdutoCritico[];
  sugestoesReposicao: SugestaoReposicao[];
}
