import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../services/manager.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ServiceHistoryDialogComponent } from '../shared/service-history-dialog/service-history-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MaterialModule } from '../../shared/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-assign-technician',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ],
  templateUrl: './assign-technician.component.html',
  styleUrls: ['./assign-technician.component.scss']
})
export class AssignTechnicianComponent implements OnInit {
  displayedColumns: string[] = ['serviceRequestId', 'requestDate', 'vehicle', 'issue', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  technicians: any[] = []; // Now stores { technicianId, technicianName, activeJobs }
  message = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private managerService: ManagerService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.managerService.getPendingRequests().subscribe({
      next: (data) => {
        const enrichedData = data.map(r => ({ ...r, selectedTechId: r.technicianId || '' }));
        this.dataSource.data = enrichedData;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        // Custom sorting for nested objects (vehicle)
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'vehicle': return item.vehicle?.registrationNumber || '';
            case 'issue': return item.issueDescription;
            default: return item[property];
          }
        };
      },
      error: () => this.showError('Failed to load requests.')
    });

    // Use the Availability API
    this.managerService.getTechnicianAvailability().subscribe({
      next: (data) => {
        this.technicians = data;
      },
      error: (err) => {
        // If 400 Bad Request ("No technician currently available" is a possible global error on assignment, but here we are just loading list)
        // If loading fails, just show generic error. The global check is primarily on assignment.
        this.showError('Failed to load technician availability.');
      }
    });
  }

  assign(req: any) {
    if (!req.selectedTechId) return;

    // optimistic check
    const tech = this.technicians.find(t => t.technicianId === req.selectedTechId);
    if (tech && tech.activeJobs >= 3) {
      this.showError(`Technician ${tech.technicianName} is overloaded! Cannot assign.`);
      return;
    }

    this.managerService.assignTechnician(req.serviceRequestId, req.selectedTechId).subscribe({
      next: () => {
        // INSTANT FEEDBACK: Update local state without reload
        const rowIndex = this.dataSource.data.findIndex(r => r.serviceRequestId === req.serviceRequestId);
        if (rowIndex > -1) {
          const updatedRow = { ...this.dataSource.data[rowIndex] };
          updatedRow.status = 'Assigned';
          updatedRow.technicianName = tech?.technicianName;
          // No need to clear selectedTechId because we want to show who is assigned

          // Update the data source array
          const newData = [...this.dataSource.data];
          newData[rowIndex] = updatedRow;
          this.dataSource.data = newData;

          // Optional: Highlight the row (can be handled via CSS class on row based on status change timestamp or similar, or just relying on "Assigned" status style)
        }

        this.showSuccess(`Technician assigned successfully`);

        // Refresh availability only (lighter than full reload) to keep counts accurate
        this.managerService.getTechnicianAvailability().subscribe(data => this.technicians = data);
      },
      error: (err) => {
        // Handle "No technician currently available" or "Technician overloaded"
        this.showError(err.error?.message || typeof err.error === 'string' ? err.error : 'Failed to assign technician.');
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatIssue(description: string): string {
    return description.startsWith(',') ? description.substring(1) : description;
  }

  viewHistory(requestId: number) {
    this.dialog.open(ServiceHistoryDialogComponent, {
      data: { serviceRequestId: requestId },
      width: '600px'
    });
  }

  showSuccess(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['bg-success', 'text-white'] });
  }

  showError(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['bg-danger', 'text-white'] });
  }

  goBack() {
    this.router.navigate(['/manager-dashboard']);
  }
}
