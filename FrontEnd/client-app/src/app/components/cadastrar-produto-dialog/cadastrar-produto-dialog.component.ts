import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ProdutoService } from '../../services/produto.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cadastrar-produto-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="p-2">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 m-0">Cadastrar produto</h2>
          <p class="text-sm text-slate-500 mt-1 mb-0">Informe os dados do produto e o saldo inicial em estoque.</p>
        </div>
        <button type="button" (click)="cancelar()" class="text-slate-400 hover:text-slate-600 bg-transparent border-0 text-xl cursor-pointer p-1">
          ✕
        </button>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="salvar()" class="space-y-4">
        <div>
          <label class="form-label">Código</label>
          <input 
            type="text" 
            formControlName="codigo" 
            placeholder="PRD-005" 
            class="form-input" 
          />
        </div>

        <div>
          <label class="form-label">Descrição</label>
          <input 
            type="text" 
            formControlName="descricao" 
            placeholder="Nome do produto" 
            class="form-input" 
          />
        </div>

        <div>
          <label class="form-label">Saldo inicial</label>
          <input 
            type="number" 
            formControlName="saldoInicial" 
            min="0" 
            class="form-input" 
          />
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button type="button" (click)="cancelar()" class="btn-secondary">
            Cancelar
          </button>
          <button type="submit" [disabled]="form.invalid || salvando" class="btn-primary">
            {{ salvando ? 'Salvando...' : 'Salvar produto' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class CadastrarProdutoDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CadastrarProdutoDialogComponent>);
  private produtoService = inject(ProdutoService);
  private snackBar = inject(MatSnackBar);

  salvando = false;

  form: FormGroup = this.fb.group({
    codigo: ['', [Validators.required]],
    descricao: ['', [Validators.required]],
    saldoInicial: [0, [Validators.required, Validators.min(0)]]
  });

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (this.form.invalid) return;

    this.salvando = true;
    const value = this.form.value;

    this.produtoService.cadastrarProduto({
      codigo: value.codigo,
      descricao: value.descricao,
      saldoInicial: value.saldoInicial
    }).subscribe({
      next: (res) => {
        this.snackBar.open('Produto cadastrado com sucesso!', 'Fechar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.salvando = false;
        const msg = err?.error?.message || 'Erro ao cadastrar produto.';
        this.snackBar.open(msg, 'Fechar', { duration: 4000 });
      }
    });
  }
}
