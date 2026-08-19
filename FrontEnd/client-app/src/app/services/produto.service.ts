import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Produto, CriarProdutoDto } from '../models/produto.model';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5001/api/produtos';

  obterProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl).pipe(
      catchError((err) => {
        console.error('Erro ao buscar produtos:', err);
        return throwError(() => err);
      })
    );
  }

  cadastrarProduto(dto: CriarProdutoDto): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, dto).pipe(
      catchError((err) => {
        console.error('Erro ao cadastrar produto:', err);
        return throwError(() => err);
      })
    );
  }
}
