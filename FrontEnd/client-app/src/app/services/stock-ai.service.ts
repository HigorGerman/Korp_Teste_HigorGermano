import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AnaliseEstoqueIa } from '../models/stock-ai.model';

@Injectable({
  providedIn: 'root'
})
export class StockAiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5001/api/produtos/analise-ia';

  obterAnaliseIa(): Observable<AnaliseEstoqueIa> {
    return this.http.get<AnaliseEstoqueIa>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Erro ao buscar análise de IA do estoque:', error);
        return of({
          resumoGeral: 'Não foi possível conectar ao serviço de IA no momento. Certifique-se de que a Stock.API está em execução na porta 5001.',
          produtosCriticos: [],
          sugestoesReposicao: []
        });
      })
    );
  }
}
