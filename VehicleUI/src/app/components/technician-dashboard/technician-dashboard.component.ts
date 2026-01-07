import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { TechnicianService } from '../../services/technician.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RecordPartsDialogComponent } from './record-parts-dialog/record-parts-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './technician-dashboard.component.html',
  styleUrls: ['./technician-dashboard.component.scss']
})
export class TechnicianDashboardComponent implements OnInit {
  tasks: any[] = [];
  displayedColumns: string[] = ['serviceRequestId', 'vehicle', 'issue', 'priority', 'status', 'actions'];
  userName = 'Technician';

  constructor(
    private technicianService: TechnicianService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }


  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.loadTasks();
  }

  loadTasks() {
    this.technicianService.getTasks().subscribe({
      next: (data) => this.tasks = data,
      error: () => this.showError('Failed to load active tasks')
    });
  }

  startJob(id: number) {
    this.technicianService.updateJobStatus(id, 'In Progress').subscribe({
      next: () => {
        this.showSuccess('Job started successfully');
        this.loadTasks();
      },
      error: () => this.showError('Failed to start job')
    });
  }

  recordParts(id: number) {
    const dialogRef = this.dialog.open(RecordPartsDialogComponent, {
      width: '600px',
      data: { serviceRequestId: id }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // Optional: reload if needed, but recording parts doesn't change status
      }
    });
  }

  completeJob(id: number) {
    if (!confirm('Are you sure you want to complete this job? This will deduct stock and generate the bill.')) return;

    this.technicianService.updateJobStatus(id, 'Completed').subscribe({
      next: () => {
        this.showSuccess('Job completed successfully');
        this.loadTasks(); // Should remove the row
      },
      error: (err) => this.showError(err.error || 'Failed to complete job')
    });
  }

  showSuccess(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['bg-success', 'text-white'] });
  }

  showError(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['bg-danger', 'text-white'] });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
