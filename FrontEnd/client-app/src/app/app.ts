import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { NotasFiscaisComponent } from './components/notas-fiscais/notas-fiscais.component';
import { EstoqueComponent } from './components/estoque/estoque.component';
import { StockAiCardComponent } from './components/stock-ai-card/stock-ai-card.component';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    TopbarComponent,
    NotasFiscaisComponent,
    EstoqueComponent,
    StockAiCardComponent,
    DashboardOverviewComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  activeTab = 'notas';

  setTab(tab: string): void {
    this.activeTab = tab;
  }
}
