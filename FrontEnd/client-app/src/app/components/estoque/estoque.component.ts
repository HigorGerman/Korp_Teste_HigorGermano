import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/produto.model';
import { CadastrarProdutoDialogComponent } from '../cadastrar-produto-dialog/cadastrar-produto-dialog.component';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <!-- Card Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-100">
        <div>
          <h2 class="text-lg font-bold text-slate-900 m-0">Produtos em estoque</h2>
          <p class="text-xs text-slate-500 mt-1 mb-0 font-medium">
            {{ produtos.length }} produto(s) cadastrado(s)
          </p>
        </div>
        <button (click)="abrirModalCadastrar()" class="btn-primary">
          <span class="text-base font-semibold leading-none">+</span>
          Cadastrar Produto
        </button>
      </div>

      <!-- Table Container -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-6 w-1/4">Código</th>
              <th class="py-3.5 px-6 w-1/2">Descrição</th>
              <th class="py-3.5 px-6 text-right w-1/4">Saldo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr *ngIf="carregando" class="hover:bg-transparent">
              <td colspan="3" class="py-8 text-center text-slate-400">
                Carregando produtos...
              </td>
            </tr>
            <tr *ngIf="!carregando && produtos.length === 0" class="hover:bg-transparent">
              <td colspan="3" class="py-8 text-center text-slate-400">
                Nenhum produto cadastrado no estoque.
              </td>
            </tr>
            <tr *ngFor="let p of produtos" class="hover:bg-slate-50/50 transition-colors">
              <td class="py-4 px-6 text-slate-400 font-semibold">
                {{ p.codigo }}
              </td>
              <td class="py-4 px-6 text-slate-900 font-semibold">
                {{ p.descricao }}
              </td>
              <td class="py-4 px-6 text-right">
                <span [class]="p.saldo > 0 ? 'chip-saldo-positive' : 'chip-saldo-zero'">
                  <svg class="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  {{ p.saldo }} un.
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class EstoqueComponent implements OnInit {
  private produtoService = inject(ProdutoService);
  private dialog = inject(MatDialog);

  produtos: Produto[] = [];
  carregando = true;

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.carregando = true;
    this.produtoService.obterProdutos().subscribe({
      next: (res) => {
        this.produtos = res;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  abrirModalCadastrar(): void {
    const dialogRef = this.dialog.open(CadastrarProdutoDialogComponent, {
      width: '460px',
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.carregarProdutos();
      }
    });
  }
}
