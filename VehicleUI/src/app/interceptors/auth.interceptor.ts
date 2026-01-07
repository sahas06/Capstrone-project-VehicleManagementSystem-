import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const router = inject(Router);
    const snackBar = inject(MatSnackBar);
    const token = localStorage.getItem('token');

    let authReq = req;
    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                router.navigate(['/login']);
                snackBar.open('Session expired. Please login again.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
            } else if (error.status === 403) {
                snackBar.open('You do not have permission to perform this action.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
            }
            return throwError(() => error);
        })
    );
};
