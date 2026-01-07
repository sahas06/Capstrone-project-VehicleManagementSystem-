import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // GuestGuard now handles redirection if already logged in.
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = 'Login successful! Redirecting...';
        // Detailed log to debug role
        console.log('Login Response:', res);

        // Store token
        this.authService.storeToken(res.token);

        // Redirect based on role
        const role = this.authService.getRole();
        console.log('Detected Role:', role);

        if (role === 'Admin') {
          this.router.navigate(['/admin'], { replaceUrl: true });
        } else if (role === 'Manager') {
          this.router.navigate(['/manager'], { replaceUrl: true });
        } else if (role === 'Technician') {
          this.router.navigate(['/technician'], { replaceUrl: true });
        } else {
          this.router.navigate(['/customer'], { replaceUrl: true });
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Login Error:', err);
        this.errorMessage = err.error?.message || 'Invalid email or password.';
      }
    });
  }
}
