import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
  <div class="home-container">
    <!-- Overlay for better text readability -->
    <div class="overlay"></div>

    <!-- Navigation -->
    <nav class="navbar animate-slide-down">
      <div class="brand">
        <mat-icon>directions_car</mat-icon> 
        <span>VMS</span>
      </div>
      <div class="nav-links">
        <ng-container *ngIf="!currentUser">
          <a routerLink="/login" class="nav-link">Login</a>
          <a routerLink="/register" class="nav-link btn-register">Register</a>
        </ng-container>
        
        <ng-container *ngIf="currentUser">
             <a [routerLink]="dashboardLink" class="nav-link">Dashboard</a>
             <a (click)="logout()" class="nav-link btn-register" style="cursor: pointer;">Logout</a>
        </ng-container>

        <mat-icon class="search-icon">search</mat-icon>
        <mat-icon class="menu-icon">menu</mat-icon>
      </div>
    </nav>

    <!-- Hero Content -->
    <div class="hero-content animate-fade-in">
      <h1 class="main-title">VEHICLE<br>MANAGEMENT</h1>
      <p class="subtitle">Complete care for your fleet. Service, Track, and Maintain with ease.</p>
    </div>

    <!-- Footer / Intro Text -->
    <div class="hero-footer animate-slide-up">
      <div class="intro-blurb">
        <span class="small-label">Power & Performance</span>
        <h3>Experience the Ultimate Control</h3>
        <p>From routine checks to complex repairs, we ensure your vehicle is always road-ready. Join thousands of satisfied customers today.</p>
      </div>
      
      <div class="cta-group" *ngIf="!currentUser">
        <button mat-stroked-button class="cta-btn secondary" routerLink="/login">Login</button>
        <button mat-flat-button class="cta-btn primary" routerLink="/register">Register</button>
      </div>

      <button *ngIf="currentUser" mat-flat-button class="cta-btn primary" [routerLink]="dashboardLink">Go to Dashboard</button>
    </div>

  </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Montserrat:wght@300;400;600&display=swap');

    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .home-container {
      position: relative;
      height: 100vh;
      width: 100%;
      background-image: url('/assets/home_hero.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: white;
      font-family: 'Montserrat', sans-serif;
    }

    /* Dark Overlay Gradient */
    .overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%);
      z-index: 1;
    }

    /* Navbar */
    .navbar {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem 4rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Oswald', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 30px;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      text-transform: uppercase;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 1px;
      transition: opacity 0.3s;
    }

    .nav-link:hover { opacity: 0.8; }

    .btn-register {
      border: 1px solid white;
      padding: 8px 20px;
      border-radius: 30px;
    }
    
    .btn-register:hover {
        background: white;
        color: black;
    }

    .search-icon, .menu-icon {
      cursor: pointer;
      opacity: 0.9;
    }

    /* Hero Center */
    .hero-content {
      position: relative;
      z-index: 10;
      text-align: center;
      margin-top: -5vh; /* Visual center */
    }

    .main-title {
      font-family: 'Oswald', sans-serif;
      font-size: 12rem; /* Massive Text */
      line-height: 0.85;
      font-weight: 700;
      text-transform: uppercase;
      margin: 0;
      letter-spacing: -2px;
      text-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .subtitle {
      font-size: 1.2rem;
      margin-top: 2rem;
      opacity: 0.9;
      font-weight: 300;
      letter-spacing: 1px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Footer Overlay */
    .hero-footer {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 3rem 4rem;
    }

    .intro-blurb {
      max-width: 500px;
    }

    .small-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.8;
      display: block;
      margin-bottom: 1rem;
      border-left: 2px solid var(--primary-color, #FDBA74);
      padding-left: 10px;
    }

    .intro-blurb h3 {
      font-size: 2rem;
      font-family: 'Oswald', sans-serif;
      margin: 0 0 1rem 0;
      font-weight: 500;
    }

    .intro-blurb p {
      font-size: 0.95rem;
      line-height: 1.6;
      opacity: 0.8;
    }

    .cta-group {
        display: flex;
        gap: 1.5rem;
    }

    .cta-btn {
      padding: 1rem 2.5rem !important;
      font-size: 1rem !important;
      font-weight: 700 !important;
      border-radius: 0 !important; /* Sharp edges/Premium feel */
      transition: all 0.3s;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .cta-btn.primary {
      background-color: white !important;
      color: black !important;
    }

    .cta-btn.secondary {
      background-color: transparent !important;
      color: white !important;
      border: 2px solid white !important;
    }

    .cta-btn:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    
    .cta-btn.secondary:hover {
        background-color: rgba(255,255,255,0.1) !important;
    }

    /* Responsiveness */
    @media (max-width: 1024px) {
      .main-title { font-size: 8rem; }
    }
    
    @media (max-width: 768px) {
      .navbar { padding: 1.5rem; }
      .hero-footer { padding: 1.5rem; flex-direction: column; align-items: flex-start; gap: 2rem; }
      .main-title { font-size: 5rem; }
      .cta-btn { width: 100%; }
      .nav-links a { display: none; } /* Hide links on mobile, keep menu */
      .menu-icon { display: block; }
    }

    /* Animations */
    .animate-fade-in { animation: fadeIn 1.5s ease-out; }
    .animate-slide-down { animation: slideDown 1s ease-out; }
    .animate-slide-up { animation: slideUp 1s ease-out; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class HomeComponent {
  currentUser: any = null;
  dashboardLink = '/';

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.setDashboardLink(user.role);
      }
    });
  }

  setDashboardLink(role: string) {
    switch (role) {
      case 'Admin': this.dashboardLink = '/admin'; break;
      case 'Manager': this.dashboardLink = '/manager'; break;
      case 'Technician': this.dashboardLink = '/technician'; break;
      case 'Customer': this.dashboardLink = '/customer'; break;
    }
  }

  logout() {
    this.authService.logout();
    // window.location.reload(); // Not strictly needed, router redirect in authService should suffice, checking that
  }
}
