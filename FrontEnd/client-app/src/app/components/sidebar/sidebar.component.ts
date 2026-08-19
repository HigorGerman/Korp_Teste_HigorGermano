import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; display: flex; flex-direction: column; gap: 16px; background-color: #0f172a; height: 100%; font-family: system-ui, -apple-system, sans-serif;">
      <!-- Logo Header -->
      <div style="border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
        <h2 style="color: white; font-weight: bold; font-size: 1.1rem; margin: 0;">Stock & Invoice</h2>
        <span style="color: #94a3b8; font-size: 0.75rem;">SaaS Platform</span>
      </div>

      <!-- Navigation Links -->
      <nav style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
        <button 
          type="button"
          (click)="selectTab('overview')" 
          [style.background-color]="activeTab === 'overview' ? '#1e293b' : 'transparent'"
          style="color: #cbd5e1; text-decoration: none; padding: 10px 12px; border-radius: 6px; border: none; cursor: pointer; text-align: left; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 10px;"
        >
          <svg style="width: 18px; height: 18px; color: #94a3b8;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
          <span style="color: white; font-weight: 600;">Visão Geral</span>
        </button>

        <button 
          type="button"
          (click)="selectTab('notas')" 
          [style.background-color]="activeTab === 'notas' ? '#1e293b' : 'transparent'"
          style="color: #cbd5e1; text-decoration: none; padding: 10px 12px; border-radius: 6px; border: none; cursor: pointer; text-align: left; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 10px;"
        >
          <svg style="width: 18px; height: 18px; color: #94a3b8;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span style="color: white; font-weight: 600;">Notas Fiscais</span>
        </button>

        <button 
          type="button"
          (click)="selectTab('estoque')" 
          [style.background-color]="activeTab === 'estoque' ? '#1e293b' : 'transparent'"
          style="color: #cbd5e1; text-decoration: none; padding: 10px 12px; border-radius: 6px; border: none; cursor: pointer; text-align: left; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 10px;"
        >
          <svg style="width: 18px; height: 18px; color: #94a3b8;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <span style="color: white; font-weight: 600;">Estoque</span>
        </button>

        <button 
          type="button"
          (click)="selectTab('ia')" 
          [style.background-color]="activeTab === 'ia' ? '#1e1b4b' : 'transparent'"
          style="color: #cbd5e1; text-decoration: none; padding: 10px 12px; border-radius: 6px; border: 1px solid rgba(99, 102, 241, 0.3); cursor: pointer; text-align: left; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; justify-content: space-between; margin-top: 8px;"
        >
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg style="width: 18px; height: 18px; color: #818cf8;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span style="color: white; font-weight: 600;">Análise de IA</span>
          </div>
          <span style="background-color: rgba(99, 102, 241, 0.2); color: #a5b4fc; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">IA</span>
        </button>
      </nav>

      <!-- Footer Info -->
      <div style="border-top: 1px solid #1e293b; padding-top: 12px; font-size: 0.75rem; color: #94a3b8;">
        <strong style="color: #e2e8f0; display: block;">Backend .NET 10</strong>
        <span>ADO.NET / PostgreSQL</span>
      </div>
    </div>
  `
})
export class SidebarComponent {
  @Input() activeTab = 'notas';
  @Output() tabChange = new EventEmitter<string>();

  selectTab(tab: string): void {
    this.tabChange.emit(tab);
  }
}
