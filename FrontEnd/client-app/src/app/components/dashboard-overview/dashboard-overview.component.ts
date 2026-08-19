import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockAiCardComponent } from '../stock-ai-card/stock-ai-card.component';
import { EstoqueComponent } from '../estoque/estoque.component';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, StockAiCardComponent, EstoqueComponent],
  template: `
    <div class="space-y-6">
      <!-- AI Preditiva Highlight Card -->
      <app-stock-ai-card></app-stock-ai-card>

      <!-- Estoque Table View -->
      <app-estoque></app-estoque>
    </div>
  `
})
export class DashboardOverviewComponent {}
