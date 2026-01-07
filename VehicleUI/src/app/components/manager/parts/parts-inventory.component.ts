import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MaterialModule } from '../../../shared/material.module';

@Component({
  selector: 'app-parts-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialModule],
  templateUrl: './parts-inventory.component.html',
  styleUrls: ['./parts-inventory.component.scss']
})
export class PartsInventoryComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['id', 'name', 'price', 'stock', 'actions'];
  isEditing = false;
  editId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  partForm: FormGroup;
  private apiUrl = 'https://localhost:7290/api/manager/parts';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.partForm = this.fb.group({
      partName: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get f() { return this.partForm.controls; }

  ngOnInit(): void {
    this.loadParts();
  }

  loadParts() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      error: () => this.showError('Failed to load parts')
    });
  }

  startEdit(part: any) {
    this.isEditing = true;
    this.editId = part.partId;
    this.partForm.patchValue({
      partName: part.partName,
      price: part.price,
      stockQuantity: part.stockQuantity
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.isEditing = false;
    this.editId = null;
    this.partForm.reset({ price: 0, stockQuantity: 0 });
  }

  onSubmit() {
    if (this.partForm.invalid) return;

    // Preserve the original object's ID field name if needed, or rely on API to just take body
    // The API likely expects { partName, price, stockQuantity } which form provides

    if (this.isEditing && this.editId) {
      this.http.put(`${this.apiUrl}/${this.editId}`, this.partForm.value).subscribe({
        next: () => {
          this.showSuccess('Part updated successfully');
          this.cancelEdit();
          this.loadParts();
        },
        error: (err) => {
          console.error(err);
          this.showError('Failed to update part');
        }
      });
    } else {
      this.http.post(this.apiUrl, this.partForm.value).subscribe({
        next: (res) => {
          this.showSuccess('Part added successfully');
          this.partForm.reset({ price: 0, stockQuantity: 0 });
          this.loadParts();
        },
        error: (err) => {
          console.error(err);
          this.showError('Failed to add part');
        }
      });
    }
  }

  deletePart(id: number) {
    if (!confirm('Are you sure you want to delete this part?')) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.showSuccess('Part deleted');
        this.loadParts();
      },
      error: () => this.showError('Failed to delete part')
    });
  }

  goBack() {
    this.router.navigate(['/manager-dashboard']);
  }

  showSuccess(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['bg-success', 'text-white'] });
  }

  showError(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['bg-danger', 'text-white'] });
  }
}
