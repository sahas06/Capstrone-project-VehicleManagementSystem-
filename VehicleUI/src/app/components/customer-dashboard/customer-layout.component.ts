import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  template: `
    <div class="layout-wrapper">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="brand">
          <mat-icon>directions_car</mat-icon>
          <span>Customer</span>
        </div>

        <nav class="nav-links">
          <a routerLink="/customer/dashboard" routerLinkActive="active" class="nav-item">
            <mat-icon>dashboard</mat-icon> <span>My Dashboard</span>
          </a>
          <a routerLink="/customer/my-vehicles" routerLinkActive="active" class="nav-item">
             <mat-icon>garage</mat-icon> <span>My Vehicles</span>
          </a>
          <a routerLink="/customer/book-service" routerLinkActive="active" class="nav-item">
            <mat-icon>add_circle_outline</mat-icon> <span>Book Service</span>
          </a>
          <a routerLink="/customer/add-vehicle" routerLinkActive="active" class="nav-item">
             <mat-icon>directions_car</mat-icon> <span>Add Vehicle</span>
          </a>
          <a routerLink="/customer/my-bills" routerLinkActive="active" class="nav-item">
             <mat-icon>receipt</mat-icon> <span>My Bills</span>
          </a>
          <a routerLink="/customer/my-bookings" routerLinkActive="active" class="nav-item">
            <mat-icon>history</mat-icon> <span>My Bookings</span>
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
             <input type="text" placeholder="Search vehicle or booking ID..." (keyup.enter)="onSearch($event)" />
           </div>
          <div class="user-profile">
            <button mat-icon-button routerLink="/customer/notifications" class="notification-btn" aria-label="Notifications">
              <mat-icon>notifications</mat-icon>
            </button>
            <div class="avatar" [matMenuTriggerFor]="userMenu">Me</div>
            <mat-menu #userMenu="matMenu" xPosition="before">
                <button mat-menu-item routerLink="/customer/profile">
                    <mat-icon>person</mat-icon>
                    <span>My Profile</span>
                </button>
                <button mat-menu-item routerLink="/customer/profile" [queryParams]="{action: 'change-password'}">
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
export class CustomerLayoutComponent {
  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) { }

  onSearch(event: any) {
    const term = event.target.value;
    if (term) {
      this.snackBar.open(`Searching for: ${term}`, 'Close', { duration: 2000 });
    }
  }

  logout() {
    this.authService.logout();
  }
}
