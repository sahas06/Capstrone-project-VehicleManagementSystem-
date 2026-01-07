import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const technicianGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const snackBar = inject(MatSnackBar);
    const authService = inject(AuthService);

    const role = authService.getRole();

    if (role === 'Technician') {
        return true;
    }

    snackBar.open('Access Denied. Technicians only.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
    router.navigate(['/login']);
    return false;
};
