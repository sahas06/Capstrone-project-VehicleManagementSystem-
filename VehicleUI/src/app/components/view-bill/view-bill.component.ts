import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { BillingService } from '../../services/billing.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { jwtDecode } from 'jwt-decode';

@Component({
    selector: 'app-view-bill',
    standalone: true,
    imports: [CommonModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule],
    templateUrl: './view-bill.component.html',
    styleUrls: ['./view-bill.component.scss']
})
export class ViewBillComponent implements OnInit {
    displayedColumns: string[] = ['bookingId', 'vehicle', 'date', 'amount', 'status', 'action'];
    dataSource: any[] = [];
    loading = true;

    constructor(
        private billingService: BillingService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        // Auth Check
        const token = localStorage.getItem('token');
        if (!token) {
            this.router.navigate(['/login']);
            return;
        }
        try {
            const decoded: any = jwtDecode(token);
            const role = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (role !== 'Customer') {
                this.router.navigate(['/login']);
                return;
            }
        } catch {
            this.router.navigate(['/login']);
            return;
        }

        this.loadBills();
    }

    loadBills() {
        this.loading = true;
        this.billingService.getMyBills().subscribe({
            next: (data) => {
                this.dataSource = data;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Failed to load bills', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
                this.loading = false;
            }
        });
    }

    payBill(billId: number) {
        if (!confirm('Are you sure you want to pay this bill?')) return;

        this.billingService.payBill(billId).subscribe({
            next: () => {
                this.snackBar.open('Payment Successful!', 'Close', { duration: 3000 });
                this.loadBills(); // Refresh table
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open(err.error?.message || 'Payment Failed', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
            }
        });
    }

    goBack() {
        this.router.navigate(['/customer-dashboard']);
    }
}
