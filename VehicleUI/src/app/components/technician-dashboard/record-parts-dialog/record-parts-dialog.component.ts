import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/material.module';
import { TechnicianService } from '../../../services/technician.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-record-parts-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Manage Parts: Request #{{data.serviceRequestId}}</h2>
    <mat-dialog-content>
      
      <!-- SECTION 1: PREVIOUSLY USED PARTS -->
      <div class="mb-4" *ngIf="usedParts.length > 0">
        <h3 class="h6 text-muted mb-2">Previously Recorded Parts</h3>
        <table class="table table-sm table-bordered">
            <thead class="table-light">
                <tr>
                    <th>Part Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let p of usedParts">
                    <td>{{p.partName}}</td>
                    <td>{{p.price | currency}}</td>
                    <td>{{p.quantity}}</td>
                    <td>{{(p.price * p.quantity) | currency}}</td>
                </tr>
            </tbody>
        </table>
      </div>

      <div class="mb-4" *ngIf="usedParts.length === 0">
        <p class="text-muted small fst-italic">No parts recorded yet.</p>
      </div>

      <mat-divider class="mb-4"></mat-divider>

      <!-- SECTION 2: ADD NEW PARTS -->
      <h3 class="h6 mb-3 text-primary">Add New Parts</h3>
      
      <form [formGroup]="partsForm">
        <div formArrayName="parts">
            <div *ngFor="let part of parts.controls; let i=index" [formGroupName]="i" class="row align-items-center mb-2 g-2">
            
                <!-- Part Selection -->
                <div class="col-8">
                    <mat-form-field appearance="outline" class="w-100">
                        <mat-label>Select Part</mat-label>
                        <mat-select formControlName="partId">
                            <mat-option *ngFor="let p of availableParts" [value]="p.partId">
                                <div class="d-flex justify-content-between">
                                    <span>{{p.partName}}</span>
                                    <span class="text-muted small">({{p.stockQuantity}} left) - {{p.price | currency}}</span>
                                </div>
                            </mat-option>
                            <mat-option *ngIf="availableParts.length === 0" disabled>No parts available</mat-option>
                        </mat-select>
                        <mat-error>Required</mat-error>
                    </mat-form-field>
                </div>

                <!-- Quantity -->
                <div class="col-3">
                    <mat-form-field appearance="outline" class="w-100">
                        <mat-label>Qty</mat-label>
                        <input matInput type="number" formControlName="quantity" min="1">
                        <mat-error>Min 1</mat-error>
                    </mat-form-field>
                </div>

                <!-- Remove Button -->
                <div class="col-1 text-end">
                    <button mat-icon-button color="warn" (click)="removePart(i)" *ngIf="parts.length > 1 || i > 0" type="button">
                        <mat-icon>delete</mat-icon>
                    </button>
                </div>
            </div>
        </div>
      </form>

      <button mat-stroked-button color="primary" (click)="addPart()">
        <mat-icon>add</mat-icon> Add Another Part
      </button>

    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-flat-button color="primary" [disabled]="partsForm.invalid || parts.length === 0 || loading" (click)="submit()">
        <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
        Save Records
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field { width: 100%; }
    .table { font-size: 0.9rem; }
  `]
})
export class RecordPartsDialogComponent implements OnInit {
  partsForm: FormGroup;
  availableParts: any[] = [];
  usedParts: any[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RecordPartsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { serviceRequestId: number },
    private techService: TechnicianService,
    private snackBar: MatSnackBar
  ) {
    this.partsForm = this.fb.group({
      parts: this.fb.array([])
    });
    // Start with one empty row
    this.addPart();
  }

  ngOnInit() {
    this.loadData();
  }

  get parts() {
    return this.partsForm.get('parts') as FormArray;
  }

  addPart() {
    const partGroup = this.fb.group({
      partId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.parts.push(partGroup);
  }

  removePart(index: number) {
    this.parts.removeAt(index);
  }

  loadData() {
    // Load Availability
    this.techService.getParts().subscribe({
      next: (data) => this.availableParts = data,
      error: () => this.snackBar.open('Failed to load inventory', 'Close', { duration: 3000 })
    });

    // Load Used History
    this.techService.getUsedParts(this.data.serviceRequestId).subscribe({
      next: (data) => this.usedParts = data,
      error: () => console.error('Failed to load used parts')
    });
  }

  submit() {
    if (this.partsForm.invalid) return;

    // Filter out empty rows if any (though validators prevent this)
    const partsData = this.partsForm.value.parts;
    if (partsData.length === 0) return;

    this.loading = true;

    this.techService.useParts(this.data.serviceRequestId, partsData).subscribe({
      next: () => {
        this.snackBar.open('Parts recorded successfully', 'Close', { duration: 3000, panelClass: ['bg-success', 'text-white'] });
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.loading = false;
        this.snackBar.open('Failed to record parts', 'Close', { duration: 3000, panelClass: ['bg-danger', 'text-white'] });
      }
    });
  }
}
