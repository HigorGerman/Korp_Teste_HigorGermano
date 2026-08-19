import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ProdutoService } from '../../services/produto.service';
import { NotaFiscalService } from '../../services/nota-fiscal.service';
import { Produto } from '../../models/produto.model';
import { ItemNotaFiscal } from '../../models/nota-fiscal.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-criar-nota-fiscal-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="p-2">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 m-0">Nova nota fiscal</h2>
          <p class="text-sm text-slate-500 mt-1 mb-0">Numeração sequencial automática. Adicione os itens da nota.</p>
        </div>
        <button type="button" (click)="cancelar()" class="text-slate-400 hover:text-slate-600 bg-transparent border-0 text-xl cursor-pointer p-1">
          ✕
        </button>
      </div>

      <!-- Field: Número da nota (Sequencial) -->
      <div class="mb-4">
        <label class="form-label">Número da nota</label>
        <input 
          type="text" 
          [value]="numeroSequencialEstimado" 
          readonly 
          disabled 
          class="form-input font-medium bg-slate-50 border-blue-200 text-slate-700" 
        />
      </div>

      <!-- Item Addition Row -->
      <div class="grid grid-cols-12 gap-2 items-end mb-4">
        <div class="col-span-6">
          <label class="form-label">Produto</label>
          <select [(ngModel)]="produtoSelecionadoId" class="form-input">
            <option [ngValue]="null" disabled selected>Selecionar produto</option>
            <option *ngFor="let p of produtos" [value]="p.id">
              {{ p.codigo }} — {{ p.descricao }} (Saldo: {{ p.saldo }})
            </option>
          </select>
        </div>

        <div class="col-span-3">
          <label class="form-label">Qtd.</label>
          <input 
            type="number" 
            [(ngModel)]="quantidade" 
            min="1" 
            class="form-input" 
          />
        </div>

        <div class="col-span-3">
          <button 
            type="button" 
            (click)="adicionarItem()" 
            [disabled]="!produtoSelecionadoId || quantidade < 1" 
            class="btn-secondary w-full"
          >
            Adicionar
          </button>
        </div>
      </div>

      <!-- Added Items Table Container -->
      <div class="border border-slate-200 rounded-xl p-4 min-h-[120px] max-h-[220px] overflow-y-auto mb-6 bg-slate-50/55">
        <div *ngIf="itens.length === 0" class="flex items-center justify-center h-24 text-slate-400 text-sm">
          Nenhum item adicionado.
        </div>

        <table *ngIf="itens.length > 0" class="w-full text-sm text-left">
          <thead class="text-xs text-slate-500 uppercase bg-slate-100/80 rounded-lg">
            <tr>
              <th class="px-3 py-2">Produto</th>
              <th class="px-3 py-2 text-center">Qtd</th>
              <th class="px-3 py-2 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of itens; let i = index" class="border-b border-slate-100 last:border-0 bg-white">
              <td class="px-3 py-2 font-medium text-slate-800">
                {{ item.produtoCodigo }} — {{ item.produtoDescricao }}
              </td>
              <td class="px-3 py-2 text-center text-slate-700 font-semibold">
                {{ item.quantidade }}
              </td>
              <td class="px-3 py-2 text-right">
                <button 
                  type="button" 
                  (click)="removerItem(i)" 
                  class="text-red-500 hover:text-red-700 bg-transparent border-0 font-medium cursor-pointer text-xs"
                >
                  Remover
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <button type="button" (click)="cancelar()" class="btn-secondary">
          Cancelar
        </button>
        <button 
          type="button" 
          (click)="emitirNota()" 
          [disabled]="itens.length === 0 || emitindo" 
          class="btn-primary"
        >
          {{ emitindo ? 'Emitindo...' : 'Emitir nota' }}
        </button>
      </div>
    </div>
  `
})
export class CriarNotaFiscalDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<CriarNotaFiscalDialogComponent>);
  private produtoService = inject(ProdutoService);
  private notaFiscalService = inject(NotaFiscalService);
  private snackBar = inject(MatSnackBar);

  produtos: Produto[] = [];
  itens: ItemNotaFiscal[] = [];
  
  produtoSelecionadoId: number | null = null;
  quantidade = 1;
  numeroSequencialEstimado = 'Gerado automaticamente ao emitir';
  emitindo = false;

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarProximoNumero();
  }

  carregarProdutos(): void {
    this.produtoService.obterProdutos().subscribe({
      next: (res) => (this.produtos = res),
      error: () => this.snackBar.open('Erro ao carregar lista de produtos.', 'Fechar', { duration: 3000 })
    });
  }

  carregarProximoNumero(): void {
    this.notaFiscalService.obterNotas().subscribe({
      next: (notas) => {
        const maxNum = notas.length > 0 ? Math.max(...notas.map((n) => n.numero)) : 1024;
        this.numeroSequencialEstimado = `${maxNum + 1}`;
      },
      error: () => {
        this.numeroSequencialEstimado = 'Gerado automaticamente';
      }
    });
  }

  adicionarItem(): void {
    if (!this.produtoSelecionadoId || this.quantidade < 1) return;

    const prod = this.produtos.find((p) => p.id == this.produtoSelecionadoId);
    if (!prod) return;

    const indexExistente = this.itens.findIndex((i) => i.produtoId === prod.id);
    if (indexExistente >= 0) {
      this.itens[indexExistente].quantidade += this.quantidade;
    } else {
      this.itens.push({
        produtoId: prod.id,
        quantidade: this.quantidade,
        produtoCodigo: prod.codigo,
        produtoDescricao: prod.descricao
      });
    }

    this.produtoSelecionadoId = null;
    this.quantidade = 1;
  }

  removerItem(index: number): void {
    this.itens.splice(index, 1);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  emitirNota(): void {
    if (this.itens.length === 0) return;

    this.emitindo = true;
    const dto = {
      itens: this.itens.map((i) => ({
        produtoId: Number(i.produtoId),
        quantidade: Number(i.quantidade)
      }))
    };

    this.notaFiscalService.criarNota(dto).subscribe({
      next: (res) => {
        this.snackBar.open(`Nota fiscal nº ${res.numero} emitida com sucesso!`, 'Fechar', { duration: 3500 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.emitindo = false;
        const msg = err?.error?.message || 'Erro ao emitir nota fiscal.';
        this.snackBar.open(msg, 'Fechar', { duration: 4000 });
      }
    });
  }
}
