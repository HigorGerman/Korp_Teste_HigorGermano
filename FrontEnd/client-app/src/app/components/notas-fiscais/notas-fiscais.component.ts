import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotaFiscalService } from '../../services/nota-fiscal.service';
import { ProdutoService } from '../../services/produto.service';
import { NotaFiscal } from '../../models/nota-fiscal.model';
import { CriarNotaFiscalDialogComponent } from '../criar-nota-fiscal-dialog/criar-nota-fiscal-dialog.component';

@Component({
  selector: 'app-notas-fiscais',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatSnackBarModule, DatePipe, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <!-- Section Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-900 m-0">Notas Fiscais</h2>
          <p class="text-xs text-slate-500 mt-1 mb-0 font-medium">
            Emissão de faturamento integrado com débito atômico e idempotência no estoque
          </p>
        </div>
        <button (click)="abrirModalCriarNota()" class="btn-primary">
          <span class="text-lg font-semibold leading-none">+</span>
          Nova Nota Fiscal
        </button>
      </div>

      <!-- 3 Metrics KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- KPI 1: Total Faturado -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Faturado</span>
            <span class="text-2xl font-extrabold text-slate-900 mt-1 block">
              {{ calcularTotalFaturado() | currency:'BRL':'symbol':'1.2-2' }}
            </span>
            <span class="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              Notas Fechadas
            </span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>

        <!-- KPI 2: Quantidade de Notas -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Notas Emitidas</span>
            <span class="text-2xl font-extrabold text-slate-900 mt-1 block">
              {{ notas.length }} <span class="text-xs text-slate-500 font-normal">nota(s)</span>
            </span>
            <span class="text-[11px] text-slate-500 font-medium mt-1 block">
              {{ getNotasAbertasCount() }} aberta(s) | {{ getNotasFechadasCount() }} fechada(s)
            </span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
        </div>

        <!-- KPI 3: Alertas de Estoque -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Alertas de Estoque</span>
            <span class="text-2xl font-extrabold text-slate-900 mt-1 block">
              {{ produtosCriticosCount }} <span class="text-xs text-amber-600 font-semibold">item(ns) crítico(s)</span>
            </span>
            <span class="text-[11px] text-slate-500 font-medium mt-1 block">
              Disponibilidade em tempo real
            </span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
        </div>
      </div>

      <!-- Table Container -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 class="text-sm font-bold text-slate-800 m-0 uppercase tracking-wider">Histórico de Faturamento</h3>
          <span class="text-xs text-slate-500 font-medium">Mostrando todas as notas registradas</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th class="py-3.5 px-6">Número da Nota</th>
                <th class="py-3.5 px-6">Data/Hora</th>
                <th class="py-3.5 px-6">Status</th>
                <th class="py-3.5 px-6">Valor Estimado</th>
                <th class="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr *ngIf="carregando" class="hover:bg-transparent">
                <td colspan="5" class="py-12 text-center text-slate-400">
                  <div class="inline-flex items-center gap-2">
                    <svg class="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Carregando notas fiscais...</span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!carregando && notas.length === 0" class="hover:bg-transparent">
                <td colspan="5" class="py-12 text-center text-slate-400">
                  Nenhuma nota fiscal registrada no sistema.
                </td>
              </tr>
              <tr *ngFor="let n of notas" class="hover:bg-slate-50/60 transition-colors">
                <td class="py-4 px-6">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" [class.bg-emerald-500]="n.status === 'Fechada'" [class.bg-amber-500]="n.status === 'Aberta'"></span>
                    <span class="font-bold text-slate-900">Nota nº {{ n.numero }}</span>
                  </div>
                  <span class="text-[11px] text-slate-400 block mt-0.5">{{ n.itens?.length || 0 }} item(ns)</span>
                </td>
                <td class="py-4 px-6 text-slate-600 font-medium">
                  {{ n.dataCriacao | date: 'dd/MM/yyyy HH:mm' }}
                </td>
                <td class="py-4 px-6">
                  <span [class]="n.status === 'Fechada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border">
                    <span class="w-1.5 h-1.5 rounded-full" [class.bg-emerald-600]="n.status === 'Fechada'" [class.bg-amber-600]="n.status === 'Aberta'"></span>
                    {{ n.status }}
                  </span>
                </td>
                <td class="py-4 px-6 font-bold text-slate-800">
                  {{ calcularValorNota(n) | currency:'BRL':'symbol':'1.2-2' }}
                </td>
                <td class="py-4 px-6 text-right">
                  <!-- Dynamic Action Buttons -->
                  <button 
                    *ngIf="n.status === 'Aberta'" 
                    (click)="imprimirNota(n)" 
                    [disabled]="imprimindoId === n.id" 
                    class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-all shadow-xs border-0 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <svg *ngIf="imprimindoId === n.id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg *ngIf="imprimindoId !== n.id" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    Emitir / Fechar
                  </button>

                  <button 
                    *ngIf="n.status === 'Fechada'" 
                    (click)="imprimirPdfSimulado(n)" 
                    class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                    Imprimir PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class NotasFiscaisComponent implements OnInit {
  private notaFiscalService = inject(NotaFiscalService);
  private produtoService = inject(ProdutoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  notas: NotaFiscal[] = [];
  carregando = true;
  imprimindoId: number | null = null;
  produtosCriticosCount = 0;

  ngOnInit(): void {
    this.carregarNotas();
    this.carregarEstoqueAlertas();
  }

  carregarNotas(): void {
    this.carregando = true;
    this.notaFiscalService.obterNotas().subscribe({
      next: (res) => {
        this.notas = res;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.snackBar.open('Erro ao carregar notas fiscais do servidor.', 'Fechar', { duration: 4000 });
      }
    });
  }

  carregarEstoqueAlertas(): void {
    this.produtoService.obterProdutos().subscribe({
      next: (prods) => {
        this.produtosCriticosCount = prods.filter(p => p.saldo <= 5).length;
      },
      error: () => {}
    });
  }

  getNotasAbertasCount(): number {
    return this.notas.filter(n => n.status === 'Aberta').length;
  }

  getNotasFechadasCount(): number {
    return this.notas.filter(n => n.status === 'Fechada').length;
  }

  calcularValorNota(nota: NotaFiscal): number {
    if (!nota.itens || nota.itens.length === 0) return 150.00;
    return nota.itens.reduce((sum, item) => sum + (item.quantidade * 120), 0);
  }

  calcularTotalFaturado(): number {
    return this.notas
      .filter(n => n.status === 'Fechada')
      .reduce((sum, n) => sum + this.calcularValorNota(n), 0);
  }

  abrirModalCriarNota(): void {
    const dialogRef = this.dialog.open(CriarNotaFiscalDialogComponent, {
      width: '520px',
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.carregarNotas();
        this.carregarEstoqueAlertas();
      }
    });
  }

  imprimirNota(nota: NotaFiscal): void {
    if (this.imprimindoId === nota.id) return;

    this.imprimindoId = nota.id;

    this.notaFiscalService.imprimirNota(nota.id).subscribe({
      next: (res) => {
        this.imprimindoId = null;
        const msg = res?.message || `Nota fiscal nº ${nota.numero} emitida com sucesso e estoque abatido!`;
        this.snackBar.open(msg, 'Fechar', { duration: 4500 });
        this.carregarNotas();
        this.carregarEstoqueAlertas();
      },
      error: (err) => {
        this.imprimindoId = null;
        const msg = err?.error?.message || `Erro ao emitir nota fiscal nº ${nota.numero}. Saldo insuficiente ou erro de concorrência.`;
        this.snackBar.open(msg, 'Fechar', { duration: 5000 });
      }
    });
  }

  imprimirPdfSimulado(nota: NotaFiscal): void {
    this.snackBar.open(`Gerando PDF da Nota Fiscal nº ${nota.numero}...`, 'Fechar', { duration: 3000 });
  }
}
