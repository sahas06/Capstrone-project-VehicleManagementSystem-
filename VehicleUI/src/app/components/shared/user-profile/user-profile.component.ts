import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-profile.component.html',
  styles: [`
    .profile-container { padding: 2rem; display: flex; justify-content: center; }
    .profile-card { max-width: 800px; width: 100%; }
    .profile-avatar { background-color: var(--primary-color); color: white; }
    .profile-details { margin-top: 1.5rem; }
    .row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .col { flex: 1; min-width: 300px; }
    .full-width { width: 100%; margin-bottom: 1rem; }
    .loading-spinner { display: flex; justify-content: center; padding: 2rem; }
  `]
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  isEditing = false;
  showPasswordChange = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private authService: AuthService,
    private location: Location,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],
      phoneNumber: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  ngOnInit() {
    this.loadProfile();
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'change-password') {
        this.showPasswordChange = true;
        // Scroll to password section if needed
        setTimeout(() => {
          const element = document.getElementById('passwordSection');
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });
  }

  loadProfile() {
    this.loading = true;
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.profileForm.patchValue({
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          phoneNumber: data.phoneNumber
        });
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form if cancelled
      this.profileForm.patchValue({
        fullName: this.user.fullName,
        phoneNumber: this.user.phoneNumber
      });
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (res) => {
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        this.isEditing = false;
        this.loadProfile();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
      }
    });
  }

  togglePasswordChange() {
    this.showPasswordChange = !this.showPasswordChange;
    this.passwordForm.reset();
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (res) => {
        this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
        this.togglePasswordChange();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open(err.error?.message || 'Failed to change password', 'Close', { duration: 3000 });
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
