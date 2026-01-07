import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { jwtDecode } from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-my-vehicles',
    standalone: true,
    imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule],
    templateUrl: './my-vehicles.component.html',
    styleUrls: ['./my-vehicles.component.scss']
})
export class MyVehiclesComponent implements OnInit {
    displayedColumns: string[] = ['vehicleNumber', 'brand', 'model', 'year', 'vehicleType'];
    dataSource: any[] = [];
    loading = true;

    constructor(
        private vehicleService: VehicleService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        // 1. Auth Check
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
        } catch (e) {
            this.router.navigate(['/login']);
            return;
        }

        // 2. Fetch Data
        this.vehicleService.getMyVehicles().subscribe({
            next: (data) => {
                // Backend returns: { registrationNumber, model (combined), vehicleType, ... }
                // We need to parse 'model' string: "Brand Model Year"
                this.dataSource = data.map(v => {
                    const parts = v.model ? v.model.split(' ') : [];
                    // Simple parsing strategy: 
                    // Last part is Year (if numeric)
                    // First part is Brand
                    // Middle is Model
                    let year = '';
                    let brand = '';
                    let modelName = '';

                    if (parts.length > 0) {
                        // Check if last is year
                        let last = parts[parts.length - 1];
                        // Remove parentheses and trim
                        last = last.replace(/[()]/g, '').trim();

                        if (/^\d{4}$/.test(last)) {
                            year = last;
                            parts.pop(); // remove year
                        }

                        if (parts.length > 0) {
                            brand = parts[0];
                            parts.shift(); // remove brand
                            modelName = parts.join(' ');
                        }
                    }

                    return {
                        vehicleNumber: v.registrationNumber,
                        brand: brand || '-',
                        model: modelName || '-',
                        year: year || '-',
                        vehicleType: v.vehicleType
                    };
                });
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                this.snackBar.open('Failed to load vehicles', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
                console.error(err);
            }
        });
    }

    goBack() {
        this.router.navigate(['/customer-dashboard']);
    }
}
