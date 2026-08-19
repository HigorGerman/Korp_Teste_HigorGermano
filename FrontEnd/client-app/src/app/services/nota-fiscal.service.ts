import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotaFiscal, CriarNotaFiscalDto } from '../models/nota-fiscal.model';

@Injectable({
  providedIn: 'root'
})
export class NotaFiscalService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5002/api/notas';

  obterNotas(): Observable<NotaFiscal[]> {
    return this.http.get<NotaFiscal[]>(this.apiUrl).pipe(
      catchError((err) => {
        console.error('Erro ao carregar lista de notas fiscais:', err);
        return throwError(() => err);
      })
    );
  }

  obterPorId(id: number): Observable<NotaFiscal> {
    return this.http.get<NotaFiscal>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error(`Erro ao buscar nota fiscal #${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  criarNota(dto: CriarNotaFiscalDto): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(this.apiUrl, dto).pipe(
      catchError((err) => {
        console.error('Erro ao criar nota fiscal:', err);
        return throwError(() => err);
      })
    );
  }

  imprimirNota(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/imprimir`, {}).pipe(
      catchError((err) => {
        console.error(`Erro ao imprimir nota fiscal #${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
