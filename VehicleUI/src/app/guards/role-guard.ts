import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUserValue;
  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  // Check expected roles if passed in route data
  const allowedRoles = route.data['roles'] as Array<string>;
  const userRole = authService.getRole();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Role mismatch - redirect to login
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  return true;
};
