export interface Produto {
  id: number;
  codigo: string;
  descricao: string;
  saldo: number;
}

export interface CriarProdutoDto {
  codigo: string;
  descricao: string;
  saldoInicial: number;
}
