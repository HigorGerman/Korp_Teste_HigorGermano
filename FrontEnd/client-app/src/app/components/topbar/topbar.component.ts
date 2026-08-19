import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 font-sans shadow-xs">
      <!-- Left Info -->
      <div class="flex items-center gap-3">
        <h1 class="text-sm font-bold text-slate-900 m-0">Sistema de Emissão de Notas & Estoque</h1>
        <span class="text-slate-300">|</span>
        <span class="text-xs text-slate-500 font-medium">Arquitetura .NET 10 em 3 Camadas</span>
      </div>

      <!-- Right Connection Badges -->
      <div class="flex items-center gap-4">
        <!-- Badge: Stock.API -->
        <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="font-semibold text-slate-700">Stock.API</span>
          <span class="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">Online (5001)</span>
        </div>

        <!-- Badge: Invoice.API -->
        <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="font-semibold text-slate-700">Invoice.API</span>
          <span class="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">Online (5002)</span>
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent {}
