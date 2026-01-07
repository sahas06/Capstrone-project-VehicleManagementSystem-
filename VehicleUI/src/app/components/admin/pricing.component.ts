import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialModule],
  styleUrls: ['./pricing.component.scss'],
  templateUrl: './pricing.component.html'
})
export class PricingComponent implements OnInit {
  categories: any[] = [];
  pricingForm: FormGroup;
  isEditing = false;
  selectedCategoryId: number | null = null;
  selectedCategoryName = '';

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.pricingForm = this.fb.group({
      labourCharge: [0, [Validators.required, Validators.min(1)]],
      estimatedTimeHours: [1, [Validators.required, Validators.min(1)]]
      // Note: We don't edit Name or Description here, only pricing/time
    });
  }

  get f() { return this.pricingForm.controls; }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.adminService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: () => alert('Failed to load categories')
    });
  }

  editPricing(cat: any) {
    this.isEditing = true;
    this.selectedCategoryId = cat.serviceCategoryId;
    this.selectedCategoryName = cat.categoryName;

    // We only patch pricing fields
    this.pricingForm.patchValue({
      labourCharge: cat.labourCharge,
      estimatedTimeHours: cat.estimatedTimeHours
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.selectedCategoryId = null;
    this.pricingForm.reset();
  }

  onSubmit() {
    if (this.pricingForm.invalid || !this.selectedCategoryId) return;

    // We need to send the whole object or partial? The backend UpdateCategory expects a full DTO usually.
    // Let's find the original object and merge.
    const original = this.categories.find(c => c.serviceCategoryId === this.selectedCategoryId);
    if (!original) return;

    const updatedDto = {
      ...original,
      labourCharge: this.pricingForm.value.labourCharge,
      estimatedTimeHours: this.pricingForm.value.estimatedTimeHours
    };

    this.adminService.updateCategory(this.selectedCategoryId, updatedDto).subscribe({
      next: () => {
        this.loadCategories();
        this.cancelEdit();
      },
      error: () => alert('Failed to update pricing')
    });
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }
}
