import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const snackBar = inject(MatSnackBar);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error) => {
            let message = 'An unexpected error occurred';

            if (error.status === 401) {
                message = 'Session expired. Please login again.';
                router.navigate(['/login']);
            } else if (error.status === 403) {
                message = 'You do not have permission to access this resource.';
            } else if (error.status === 400) {
                if (error.error && typeof error.error === 'string') {
                    message = error.error;
                } else if (error.error?.message) {
                    message = error.error.message;
                } else {
                    message = 'Invalid request.';
                }
            } else if (error.status === 500) {
                message = 'Server error. Please try again later.';
            }

            snackBar.open(`${message} (Error ${error.status})`, 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
            return throwError(() => error);
        })
    );
};
