import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './manager-layout.component.html',
  styleUrls: ['./manager-layout.component.scss']
})
export class ManagerLayoutComponent {
  isSidebarOpen = false;

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) { }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onSearch(event: any) {
    const term = event.target.value;
    if (term) {
      // Implement search logic here
      this.snackBar.open(`Searching for: ${term}`, 'Close', { duration: 2000 });
    }
  }

  showProfile() {
    this.snackBar.open('Profile feature coming soon!', 'OK', { duration: 2000 });
  }

  logout() {
    this.authService.logout();
  }
}
