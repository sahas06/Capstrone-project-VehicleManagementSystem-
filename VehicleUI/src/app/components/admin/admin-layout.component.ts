import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatMenuModule, MatButtonModule, MatDividerModule],
  template: `
    <div class="layout-wrapper">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="brand">
          <mat-icon>security</mat-icon>
          <span>Admin</span>
        </div>

        <nav class="nav-links">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <mat-icon>dashboard</mat-icon> <span>Dashboard</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <mat-icon>group</mat-icon> <span>Users</span>
          </a>
          <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item">
            <mat-icon>category</mat-icon> <span>Service Categories</span>
          </a>
          <a routerLink="/admin/pricing" routerLinkActive="active" class="nav-item">
            <mat-icon>attach_money</mat-icon> <span>Pricing</span>
          </a>
        </nav>

        <div class="logout-section">
          <button (click)="logout()" class="logout-btn">
            <mat-icon>logout</mat-icon> <span>Logout</span>
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="main-content">
        <!-- HEADER -->
        <header class="top-header">
           <!-- Global Search -->
           <div class="search-bar">
             <mat-icon class="search-icon">search</mat-icon>
             <input type="text" placeholder="Search..." />
           </div>
          <div class="user-profile">
            <button mat-icon-button routerLink="/admin/notifications" class="notification-btn" aria-label="Notifications">
              <mat-icon>notifications</mat-icon>
            </button>
            <div class="avatar" [matMenuTriggerFor]="userMenu">AD</div>
            <mat-menu #userMenu="matMenu" xPosition="before">
                <div class="brand d-flex align-items-center gap-2 mb-4 px-3" routerLink="/admin" style="cursor: pointer">
                    <mat-icon class="text-primary" style="transform: scale(1.2)">security</mat-icon>
                    <span class="h4 mb-0 fw-bold" style="color: var(--primary-accent); letter-spacing: -0.5px;">Admin</span>
                </div>
                <button mat-menu-item routerLink="/admin/profile">
                    <mat-icon>person</mat-icon>
                    <span>My Profile</span>
                </button>
                <button mat-menu-item routerLink="/admin/profile" [queryParams]="{action: 'change-password'}">
                    <mat-icon>lock</mat-icon>
                    <span>Change Password</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="logout()">
                    <mat-icon>logout</mat-icon>
                    <span>Logout</span>
                </button>
            </mat-menu>
          </div>
        </header>

        <!-- ROUTER OUTLET -->
        <div class="content-body">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* GLOBAL & LAYOUT */
    .layout-wrapper {
      display: flex;
      height: 100vh;
      background-color: var(--page-bg);
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    }

    /* SIDEBAR */
    .sidebar {
      width: 260px;
      background-color: var(--sidebar-bg); /* #FFEDD5 */
      color: var(--text-primary);
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      border-right: 1px solid var(--border-color);
      transition: width 0.3s ease;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 2.5rem;
      color: var(--primary-accent); /* #FB923C */
    }

    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 8px;
      border-left: 4px solid transparent;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background-color: rgba(251, 146, 60, 0.1);
      color: var(--primary-dark);
    }

    .nav-item.active {
      background-color: #FED7AA; /* Active highlight */
      border-left-color: var(--primary-accent);
      color: var(--text-primary);
      font-weight: 600;
    }

    .logout-section {
      margin-top: auto;
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      background: none;
      border: none;
      color: var(--danger-color);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      padding: 10px;
      width: 100%;
      text-align: left;
      border-radius: 8px;
    }
    .logout-btn:hover { background-color: #FEE2E2; } /* faint red */

    /* MAIN CONTENT */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--page-bg);
    }

    /* HEADER */
    .top-header {
      height: 72px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    /* Global Search Bar */
    .search-bar {
      position: relative;
      width: 300px;
    }
    .search-bar input {
      width: 100%;
      padding: 10px 16px 10px 40px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background: #FFF;
      color: var(--text-primary);
      font-size: 14px;
      outline: none;
      transition: 0.2s;
    }
    .search-bar input:focus {
      border-color: var(--primary-accent);
      box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.1);
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 18px;
      pointer-events: none;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      background: var(--primary-accent);
      color: #FFF;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      box-shadow: 0 4px 10px rgba(251, 146, 60, 0.2);
      cursor: pointer;
    }

    /* CONTENT BODY */
    .content-body {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }

    /* 📱 RESPONSIVE */
    @media (max-width: 768px) {
      .sidebar {
        position: absolute;
        left: -260px;
        height: 100%;
        z-index: 50;
      }
      .sidebar.open { left: 0; }
      
      .top-header { padding: 0 1rem; }
      .search-bar { display: none; } /* Hide search on mobile for now */
    }
  `]
})
export class AdminLayoutComponent {
  constructor(private authService: AuthService, private router: Router) { }

  logout() {
    this.authService.logout();
  }
}
