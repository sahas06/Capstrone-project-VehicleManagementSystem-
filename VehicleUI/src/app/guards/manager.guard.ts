import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const managerGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.getRole() === 'Manager') {
        return true;
    }

    // Redirect to login or home if not authorized
    router.navigate(['/login']);
    return false;
};
