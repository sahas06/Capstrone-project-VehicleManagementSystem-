import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReportsService } from '../../services/reports.service';
import { jwtDecode } from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
    role: string = '';
    servicesReport: any[] = [];
    revenueReport: any[] = [];
    workloadReport: any[] = [];
    loading = true;

    constructor(private reportsService: ReportsService, private snackBar: MatSnackBar) { }

    ngOnInit(): void {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded: any = jwtDecode(token);
            this.role = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            this.loadReports();
        }
    }

    loadReports() {
        this.loading = true;

        if (this.role === 'Admin') {
            this.reportsService.getRevenueReport().subscribe({
                next: (data) => this.revenueReport = data,
                error: () => this.snackBar.open('Failed to load revenue data', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
            });

            this.reportsService.getServicesPerMonth().subscribe({
                next: (data) => this.servicesReport = data,
                error: () => this.snackBar.open('Failed to load services data', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
            });
        }

        if (this.role === 'Manager') {
            this.reportsService.getTechnicianWorkload().subscribe({
                next: (data) => this.workloadReport = data,
                error: () => this.snackBar.open('Failed to load workload data', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
            });
        }

        this.loading = false;
    }
}
