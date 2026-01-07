import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { ServiceRequestService } from '../../services/service-request.service';
import { jwtDecode } from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ServiceHistoryDialogComponent } from '../shared/service-history-dialog/service-history-dialog.component';

@Component({
    selector: 'app-my-bookings',
    standalone: true,
    imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatPaginatorModule, MatSortModule, MatDialogModule],
    templateUrl: './my-bookings.component.html',
    styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {

    displayedColumns: string[] = ['bookingId', 'vehicleNumber', 'issueDescription', 'status', 'assignedTechnician', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    loading = true;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private bookingService: BookingService,
        private serviceRequestService: ServiceRequestService,
        private router: Router,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        // 1. Auth Check
        const token = localStorage.getItem('token');
        if (!token) {
            this.router.navigate(['/login']);
            return;
        }

        try {
            const decoded: any = jwtDecode(token);
            const role = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (role !== 'Customer') {
                this.snackBar.open('Access denied', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
                this.router.navigate(['/login']);
                return;
            }
        } catch (e) {
            this.router.navigate(['/login']);
            return;
        }

        // 2. Fetch Data
        this.bookingService.getMyBookings().subscribe({
            next: (data) => {
                // Map backend ServiceRequest to display format
                this.dataSource.data = data.map(b => ({
                    bookingId: b.serviceRequestId,
                    vehicleNumber: b.vehicleNumber || '-',
                    issueDescription: b.issueDescription,
                    status: b.status,
                    assignedTechnician: b.technicianName || 'Unassigned'
                }));
                setTimeout(() => {
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                });
                this.loading = false;
            },
            error: (err: any) => {
                this.loading = false;
                this.snackBar.open('Failed to load bookings', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
                console.error(err);
            }
        });
    }

    goBack() {
        this.router.navigate(['/customer-dashboard']);
    }

    cancelRequest(id: number) {
        if (!confirm('Are you sure you want to cancel this service request?')) return;

        this.serviceRequestService.cancelService(id).subscribe({
            next: () => {
                this.snackBar.open('Service cancelled successfully', 'Close', { duration: 3000 });
                this.ngOnInit(); // Refresh list
            },
            error: (err: any) => {
                this.snackBar.open('Failed to cancel service', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
                console.error(err);
            }
        });
    }

    rescheduleRequest(id: number) {
        const dateStr = prompt("Enter new date (YYYY-MM-DD):");
        if (!dateStr) return;

        // Basic validation
        if (isNaN(Date.parse(dateStr))) {
            this.snackBar.open("Invalid Date Format", 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
            return;
        }

        this.serviceRequestService.rescheduleService(id, dateStr).subscribe({
            next: () => {
                this.snackBar.open('Service rescheduled successfully', 'Close', { duration: 3000 });
                this.ngOnInit(); // Refresh list
            },
            error: (err: any) => {
                this.snackBar.open(err.error?.message || 'Failed to reschedule', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
                console.error(err);
            }
        });
    }

    viewHistory(requestId: number) {
        this.dialog.open(ServiceHistoryDialogComponent, {
            data: { serviceRequestId: requestId },
            width: '600px'
        });
    }
}
