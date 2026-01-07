import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-service-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialModule],
  styleUrls: ['./service-categories.component.scss'],
  templateUrl: './service-categories.component.html'
})
export class ServiceCategoriesComponent implements OnInit {
  categories: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['id', 'name', 'description', 'labour', 'time', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categoryForm: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: number | null = null;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.categoryForm = this.fb.group({
      categoryName: ['', Validators.required],
      description: ['', [Validators.maxLength(200)]],
      labourCharge: [0, [Validators.required, Validators.min(1)]],
      estimatedTimeHours: [1, [Validators.required, Validators.min(1)]]
    });
  }

  get f() { return this.categoryForm.controls; }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.adminService.getCategories().subscribe(res => {
      this.categories = res;
      this.dataSource.data = res;
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    });
  }

  initCreate() {
    this.showForm = true;
    this.isEditing = false;
    this.categoryForm.reset({ labourCharge: 0, estimatedTimeHours: 1 });
  }

  editCategory(cat: any) {
    this.showForm = true;
    this.isEditing = true;
    this.editingId = cat.serviceCategoryId;
    this.categoryForm.patchValue(cat);
  }

  cancelEdit() {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;

    if (this.isEditing && this.editingId) {
      this.adminService.updateCategory(this.editingId, this.categoryForm.value).subscribe(() => {
        this.loadCategories();
        this.cancelEdit();
      });
    } else {
      this.adminService.createCategory(this.categoryForm.value).subscribe(() => {
        this.loadCategories();
        this.cancelEdit();
      });
    }
  }

  deleteCategory(id: number) {
    if (confirm('Delete this category?')) {
      this.adminService.deleteCategory(id).subscribe(() => this.loadCategories());
    }
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }
}
