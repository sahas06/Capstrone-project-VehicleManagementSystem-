import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * GuestGuard: Prevents authenticated users from accessing Login/Register pages.
 * If logged in, redirects to the appropriate dashboard.
 */
export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.currentUserValue) {
        const role = authService.getRole();

        // Redirect based on role
        if (role === 'Admin') {
            router.navigate(['/admin'], { replaceUrl: true });
        } else if (role === 'Manager') {
            router.navigate(['/manager'], { replaceUrl: true });
        } else if (role === 'Technician') {
            router.navigate(['/technician'], { replaceUrl: true });
        } else {
            router.navigate(['/customer'], { replaceUrl: true });
        }
        return false;
    }

    return true;
};
