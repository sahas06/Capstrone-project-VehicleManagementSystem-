import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-empty-state',
    standalone: true,
    imports: [CommonModule, MatButtonModule, RouterLink],
    template: `
    <div class="empty-state-container text-center p-5">
      <div class="empty-illustration mb-4">
        <!-- SVG Icon or Image -->
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#FDBA74" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-700 mb-2">{{ title }}</h3>
      <p class="text-muted mb-4">{{ message }}</p>
      <button *ngIf="actionLabel" mat-raised-button color="primary" [routerLink]="actionLink">
        {{ actionLabel }}
      </button>
    </div>
  `,
    styles: [`
    .empty-state-container {
      background: var(--card-bg);
      border-radius: var(--card-radius);
      border: 1px dashed var(--border-color);
    }
    .empty-illustration svg {
      opacity: 0.8;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
  `]
})
export class EmptyStateComponent {
    @Input() title: string = 'No Data Found';
    @Input() message: string = 'There is nothing here yet.';
    @Input() actionLabel?: string;
    @Input() actionLink?: string | any[];
}
