import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ServiceRequestService } from '../../../services/service-request.service';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-service-history-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule],
  template: `
    <h2 mat-dialog-title>Service History (Request #{{data.serviceRequestId}})</h2>
    <mat-dialog-content>
      <div *ngIf="loading">Loading history...</div>
      
      <table *ngIf="!loading && history.length > 0" mat-table [dataSource]="history" class="w-100">
         <!-- Old Status -->
        <ng-container matColumnDef="oldStatus">
            <th mat-header-cell *matHeaderCellDef> Old Status </th>
            <td mat-cell *matCellDef="let element"> {{element.oldStatus}} </td>
        </ng-container>

         <!-- New Status -->
        <ng-container matColumnDef="newStatus">
            <th mat-header-cell *matHeaderCellDef> New Status </th>
            <td mat-cell *matCellDef="let element"> {{element.newStatus}} </td>
        </ng-container>
        
         <!-- Changed By -->
        <ng-container matColumnDef="changedBy">
            <th mat-header-cell *matHeaderCellDef> Changed By </th>
            <td mat-cell *matCellDef="let element"> {{element.changedBy}} </td>
        </ng-container>

         <!-- Date -->
        <ng-container matColumnDef="changedAt">
            <th mat-header-cell *matHeaderCellDef> Date </th>
            <td mat-cell *matCellDef="let element"> {{element.changedAt | date:'medium'}} </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <div *ngIf="!loading && history.length === 0" class="alert alert-info mt-2">
        No history found for this request.
      </div>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `
})
export class ServiceHistoryDialogComponent implements OnInit {
  history: any[] = [];
  loading = true;
  displayedColumns = ['oldStatus', 'newStatus', 'changedBy', 'changedAt'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { serviceRequestId: number }, private serviceRequestService: ServiceRequestService) { }

  ngOnInit() {
    this.serviceRequestService.getServiceHistory(this.data.serviceRequestId).subscribe({
      next: (data) => {
        this.history = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
