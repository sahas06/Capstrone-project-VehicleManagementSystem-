import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VehicleService } from '../../services/vehicle.service';
import { jwtDecode } from 'jwt-decode';

@Component({
    selector: 'app-add-vehicle',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './add-vehicle.component.html',
    styleUrls: ['./add-vehicle.component.scss']
})
export class AddVehicleComponent implements OnInit {
    vehicleForm: FormGroup;
    loading = false;
    vehicleTypes = ['Car', 'Bike', 'Truck'];

    constructor(
        private formBuilder: FormBuilder,
        private vehicleService: VehicleService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.vehicleForm = this.formBuilder.group({
            vehicleNumber: ['', Validators.required],
            brand: ['', Validators.required],
            model: ['', Validators.required],
            year: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
            vehicleType: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        const token = localStorage.getItem('token');
        if (!token) {
            this.router.navigate(['/login']);
            return;
        }

        try {
            const decoded: any = jwtDecode(token);
            const role = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            if (role !== 'Customer') {
                this.snackBar.open('Access denied.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
                this.router.navigate(['/login']);
            }
        } catch (e) {
            this.router.navigate(['/login']);
        }
    }

    onSubmit() {
        if (this.vehicleForm.invalid) {
            return;
        }

        this.loading = true;
        const formValue = this.vehicleForm.value;

        // Mapping to Backend VehicleDto (PascalCase as requested by user)
        const payload = {
            VehicleNumber: formValue.vehicleNumber,
            Brand: formValue.brand,
            Model: formValue.model,
            Year: Number(formValue.year), // Convert to number
            VehicleType: formValue.vehicleType
        };

        this.vehicleService.addVehicle(payload).subscribe({
            next: (res) => {
                this.loading = false;
                this.snackBar.open('Vehicle added successfully!', 'Close', { duration: 3000 });
                this.vehicleForm.reset();
                // this.router.navigate(['/customer/my-vehicles']);
            },
            error: (err) => {
                this.loading = false;
                const msg = err.error?.message || err.statusText || 'Failed to add vehicle';
                this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
            }
        });
    }

    goBack() {
        this.router.navigate(['/customer-dashboard']);
    }
}
