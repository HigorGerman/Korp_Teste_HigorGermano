export interface ItemNotaFiscal {
  id?: number;
  notaFiscalId?: number;
  produtoId: number;
  quantidade: number;
  produtoDescricao?: string;
  produtoCodigo?: string;
}

export interface NotaFiscal {
  id: number;
  numero: number;
  status: string;
  dataCriacao: string;
  itens: ItemNotaFiscal[];
}

export interface CriarItemNotaFiscalDto {
  produtoId: number;
  quantidade: number;
}

export interface CriarNotaFiscalDto {
  itens: CriarItemNotaFiscalDto[];
}
