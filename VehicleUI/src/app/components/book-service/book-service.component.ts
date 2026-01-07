import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';

import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
// Services
import { MatSnackBar } from '@angular/material/snack-bar';
import { VehicleService } from '../../services/vehicle.service';
import { ServiceRequestService } from '../../services/service-request.service';
import { jwtDecode } from 'jwt-decode';

@Component({
    selector: 'app-book-service',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCardModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './book-service.component.html',
    styleUrls: ['./book-service.component.scss']
})
export class BookServiceComponent implements OnInit {
    bookingForm: FormGroup;
    loading = false;
    vehicles: any[] = [];
    priorities = ['Normal', 'Urgent'];

    constructor(
        private formBuilder: FormBuilder,
        private vehicleService: VehicleService,
        private serviceRequestService: ServiceRequestService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.bookingForm = this.formBuilder.group({
            vehicleId: ['', Validators.required],
            issueDescription: ['', [Validators.required, Validators.minLength(10)]],
            priority: ['Normal', Validators.required],
            requestDate: [new Date(), Validators.required]
        });
    }

    ngOnInit(): void {
        // 1. Auth Check (Customer only)
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
        } catch {
            this.router.navigate(['/login']);
            return;
        }

        // 2. Load Vehicles
        this.loadVehicles();
    }

    loadVehicles() {
        this.vehicleService.getMyVehicles().subscribe({
            next: (data) => {
                // We only really need vehicleId and model info
                this.vehicles = data;
                if (this.vehicles.length === 0) {
                    this.snackBar.open('Please add a vehicle first!', 'Close', { duration: 5000 });
                    this.router.navigate(['/customer/add-vehicle']);
                }
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Failed to load vehicles', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
            }
        });
    }

    onSubmit() {
        if (this.bookingForm.invalid) return;

        this.loading = true;
        const formValue = this.bookingForm.value;

        const payload = {
            VehicleId: Number(formValue.vehicleId),
            IssueDescription: formValue.issueDescription,
            Priority: formValue.priority,
            RequestDate: formValue.requestDate
        };

        this.serviceRequestService.bookService(payload).subscribe({
            next: (res) => {
                this.loading = false;
                this.snackBar.open('Service booked successfully!', 'Close', { duration: 3000 });
                this.router.navigate(['/customer-dashboard']);
            },
            error: (err) => {
                this.loading = false;
                console.error(err);
                this.snackBar.open(err.error || 'Booking failed', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
            }
        });
    }

    goBack() {
        this.router.navigate(['/customer-dashboard']);
    }
}
