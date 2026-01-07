import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container mt-4 animate-fade-in">
      <h3>
        <mat-icon>notifications</mat-icon> Notifications
      </h3>
      
      <div *ngIf="notifications.length === 0" class="alert alert-info">
        No notifications found.
      </div>

      <div class="notification-list">
        <mat-card *ngFor="let n of notifications" class="mb-2" [class.unread]="!n.isRead">
          <mat-card-content class="d-flex justify-content-between align-items-center">
            <div>
              <p class="mb-1 message">{{n.message}}</p>
              <small class="text-muted">{{n.createdAt | date:'medium'}}</small>
            </div>
            <button *ngIf="!n.isRead" mat-icon-button color="primary" (click)="markAsRead(n.notificationId)" title="Mark as Read">
              <mat-icon>check_circle_outline</mat-icon>
            </button>
             <mat-icon *ngIf="n.isRead" class="text-muted" title="Read">check_circle</mat-icon>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .unread {
      border-left: 5px solid #007bff; // Blue accent for unread
      background-color: #f8f9fa;
    }
    .message {
        font-weight: 500;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];

  constructor(private notificationService: NotificationService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.getMyNotifications().subscribe({
      next: (data) => this.notifications = data,
      error: () => this.snackBar.open('Failed to load notifications', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        // Update local state
        const n = this.notifications.find(x => x.notificationId === id);
        if (n) n.isRead = true;
        this.snackBar.open('Marked as read', 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }
}
