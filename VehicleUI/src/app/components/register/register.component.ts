import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, MaterialModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    registerForm: FormGroup;
    loading = false;
    submitted = false;
    errorMessage = '';

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        // Clear any existing session when accessing register page
        if (this.authService.currentUserValue) {
            this.authService.logout();
        }

        this.registerForm = this.formBuilder.group({
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    // Convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;
        this.errorMessage = '';

        // Stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }

        const payload = {
            fullName: this.registerForm.value.fullName.trim(),
            email: this.registerForm.value.email.trim(),
            password: this.registerForm.value.password.trim()
        };

        console.log('Register Payload:', payload);

        this.loading = true;
        this.authService.register(payload)
            .subscribe({
                next: () => {
                    this.loading = false;
                    // On success, redirect to login page (or show a success message then redirect)
                    this.router.navigate(['/login'], { queryParams: { registered: true } });
                },
                error: (err) => {
                    this.loading = false;
                    console.error('Registration execution error:', err);

                    if (Array.isArray(err.error)) {
                        // Handle Identity result.Errors array
                        this.errorMessage = err.error.map((e: any) => e.description).join(', ');
                    } else if (err.error && typeof err.error === 'object') {
                        // Handle standard ValidationProblemDetails
                        if (err.error.errors) {
                            // Validation errors are usually in errors object
                            this.errorMessage = Object.values(err.error.errors).flat().join(', ');
                        } else {
                            this.errorMessage = err.error.message || 'Registration failed.';
                        }
                    } else {
                        // Fallback: Dump the whole error to see what's wrong
                        this.errorMessage = 'Error: ' + JSON.stringify(err.error || err);
                    }
                }
            });
    }
}
