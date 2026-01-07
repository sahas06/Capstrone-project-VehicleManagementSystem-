import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-my-bills',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatSortModule],
  template: `
    <div class="container mt-4 animate-fade-in">
      <div class="d-flex justify-content-between mb-3 align-items-center">
        <h3>My Bills</h3>
      </div>

      <mat-card class="glass-card">
        <mat-card-header>
          <mat-card-title>Invoice History</mat-card-title>
          <mat-card-subtitle>View and pay your service invoices</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="table-responsive">
            <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z8 glass-table">
              
              <!-- ID Column -->
              <ng-container matColumnDef="billId">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Invoice # </th>
                <td mat-cell *matCellDef="let bill"> #{{bill.billingId || bill.BillingId}} </td>
              </ng-container>

              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Date </th>
                <td mat-cell *matCellDef="let bill"> {{bill.date | date}} </td>
              </ng-container>

              <!-- Vehicle Column -->
              <ng-container matColumnDef="vehicle">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Vehicle </th>
                <td mat-cell *matCellDef="let bill"> {{bill.vehicleNumber}} </td>
              </ng-container>

              <!-- Amount Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Amount </th>
                <td mat-cell *matCellDef="let bill"> \${{bill.totalAmount | number:'1.2-2'}} </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
                <td mat-cell *matCellDef="let bill"> 
                  <span class="badge" [class.bg-success]="bill.paymentStatus === 'Paid'" [class.bg-warning]="bill.paymentStatus === 'Pending'">
                    {{bill.paymentStatus}}
                  </span>
                </td>
              </ng-container>

              <!-- Action Column -->
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef> Action </th>
                <td mat-cell *matCellDef="let bill">
                  <button *ngIf="bill.paymentStatus === 'Pending'" mat-raised-button color="primary" (click)="payBill(bill.billingId)">
                    Pay Now
                  </button>
                  <button *ngIf="bill.paymentStatus === 'Paid'" mat-stroked-button disabled>
                    Paid
                  </button>
                  <button mat-icon-button color="accent" (click)="viewInvoice(bill)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="6" class="text-center p-3">No bills found.</td>
              </tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .glass-card { background: rgba(255, 255, 255, 0.9); margin-bottom: 20px; }
    .glass-table { width: 100%; }
    .badge { padding: 5px 10px; border-radius: 12px; color: white; }
    .bg-success { background-color: #28a745; }
    .bg-warning { background-color: #ffc107; color: #333; }
  `]
})
export class MyBillsComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['billId', 'date', 'vehicle', 'amount', 'status', 'action'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private router: Router) { }

  ngOnInit() {
    this.loadBills();
  }

  loadBills() {
    this.http.get<any[]>('https://localhost:7290/api/billing/my-bills').subscribe({
      next: (data) => {
        console.log('Billing Data:', data);
        this.dataSource.data = data;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      error: () => this.snackBar.open('Failed to load bills', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }

  payBill(id: number) {
    if (!confirm('Proceed with payment?')) return;

    this.http.post(`https://localhost:7290/api/billing/pay/${id}`, {}).subscribe({
      next: () => {
        this.snackBar.open('Payment Successful!', 'Close', { duration: 3000 });
        this.loadBills();
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Payment Failed', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }

  viewInvoice(bill: any) {
    // Open a new window with print layout
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.snackBar.open('Pop-up blocked. Please allow pop-ups.', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      return;
    }

    const invoiceContent = `
      <html>
        <head>
          <title>Invoice #${bill.billingId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #7C2D12; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .meta-box { background: #f9fafb; padding: 20px; border-radius: 8px; width: 45%; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th { text-align: left; padding: 12px; border-bottom: 2px solid #ddd; color: #555; }
            .table td { padding: 12px; border-bottom: 1px solid #eee; }
            .total { text-align: right; margin-top: 30px; font-size: 1.5em; font-weight: bold; color: #7C2D12; }
            .footer { margin-top: 50px; text-align: center; font-size: 0.9em; color: #777; }
            .status { font-weight: bold; color: ${bill.paymentStatus === 'Paid' ? 'green' : 'orange'}; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Vehicle Service Invoice</h1>
            <p>Vehicle Management System</p>
          </div>
          
          <div class="meta">
            <div class="meta-box">
              <strong>Invoice To:</strong><br>
              User ID: ${bill.userId || 'Customer'}<br>
              Date: ${new Date(bill.date).toLocaleDateString()}
            </div>
            <div class="meta-box">
              <strong>Invoice Details:</strong><br>
              Invoice #: ${bill.billingId}<br>
              Vehicle: ${bill.vehicleNumber || 'N/A'}<br>
              Status: <span class="status">${bill.paymentStatus}</span>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Service Charge</td>
                <td style="text-align: right">$${(bill.totalAmount)?.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total: $${(bill.totalAmount)?.toFixed(2)}
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceContent);
    printWindow.document.close();
  }
}
