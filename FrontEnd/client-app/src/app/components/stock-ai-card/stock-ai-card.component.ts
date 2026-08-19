import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockAiService } from '../../services/stock-ai.service';
import { AnaliseEstoqueIa } from '../../models/stock-ai.model';

@Component({
  selector: 'app-stock-ai-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
      <!-- Glow Accent Effect -->
      <div class="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header -->
      <div class="flex items-center justify-between mb-4 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-white m-0">Análise Preditiva de Estoque (IA)</h3>
              <span class="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30 uppercase tracking-wider">GET /api/produtos/analise-ia</span>
            </div>
            <p class="text-xs text-indigo-200/70 mt-0.5 mb-0">Diagnóstico preditivo automatizado integrado à Stock.API</p>
          </div>
        </div>

        <button (click)="carregarAnalise()" [disabled]="carregando" class="text-xs text-indigo-200 hover:text-white bg-indigo-900/50 hover:bg-indigo-800/60 px-3 py-1.5 rounded-lg border border-indigo-700/50 transition-all cursor-pointer flex items-center gap-1.5">
          <svg [class.animate-spin]="carregando" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Atualizar IA
        </button>
      </div>

      <!-- Resumo Geral Box -->
      <div class="bg-slate-900/80 border border-indigo-900/60 rounded-xl p-4 mb-5 relative z-10">
        <p class="text-sm text-indigo-100 leading-relaxed m-0" *ngIf="!carregando && analise">
          {{ analise.resumoGeral }}
        </p>
        <div *ngIf="carregando" class="flex items-center gap-3 py-2 text-indigo-300 text-sm">
          <svg class="w-4 h-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Analisando saldos e padrões de estoque...
        </div>
      </div>

      <!-- Content Grid: Produtos Críticos & Sugestões de Reposição -->
      <div *ngIf="!carregando && analise" class="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <!-- List: Produtos Críticos -->
        <div class="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Produtos Críticos (Saldo ≤ 5)</span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {{ analise.produtosCriticos.length }} item(ns)
            </span>
          </div>

          <div *ngIf="analise.produtosCriticos.length === 0" class="text-xs text-slate-400 py-3 text-center">
            Nenhum produto em nível crítico no momento.
          </div>

          <div class="space-y-2">
            <div *ngFor="let item of analise.produtosCriticos" class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <div>
                <span class="font-bold text-white block">{{ item.codigo }} — {{ item.descricao }}</span>
                <span class="text-[11px] text-slate-400">Saldo atual: <strong class="text-amber-400">{{ item.saldoAtual }} un.</strong></span>
              </div>
              <span [class]="item.saldoAtual === 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'" class="px-2 py-0.5 rounded text-[10px] font-bold border">
                {{ item.nivelRisco }}
              </span>
            </div>
          </div>
        </div>

        <!-- List: Sugestões de Reposição -->
        <div class="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Sugestões de Reposição</span>
            <span class="text-xs font-semibold text-indigo-300">Target: 30 un.</span>
          </div>

          <div *ngIf="analise.sugestoesReposicao.length === 0" class="text-xs text-slate-400 py-3 text-center">
            Nenhuma ordem de compra recomendada.
          </div>

          <div class="space-y-2">
            <div *ngFor="let sug of analise.sugestoesReposicao" class="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-indigo-200">{{ sug.produto }}</span>
                <span class="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">
                  +{{ sug.quantidadeRecomendada }} un.
                </span>
              </div>
              <p class="text-[11px] text-slate-400 m-0 leading-tight">{{ sug.justificativa }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StockAiCardComponent implements OnInit {
  private aiService = inject(StockAiService);

  analise: AnaliseEstoqueIa | null = null;
  carregando = true;

  ngOnInit(): void {
    this.carregarAnalise();
  }

  carregarAnalise(): void {
    this.carregando = true;
    this.aiService.obterAnaliseIa().subscribe({
      next: (data) => {
        this.analise = data;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }
}
