import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MaterialModule } from '../../shared/material.module';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialModule],
  styleUrls: ['./manage-users.component.scss'],
  templateUrl: './manage-users.component.html'
})
export class ManageUsersComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  userForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      error: () => this.errorMessage = 'Failed to load users'
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.adminService.createUser(this.userForm.value).subscribe({
      next: () => {
        this.successMessage = 'User created successfully!';
        this.errorMessage = '';
        this.userForm.reset();
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create user. Email may be taken.';
        this.successMessage = '';
      }
    });
  }

  deactivateUser(id: string, name: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Confirm Deactivation', message: `Are you sure you want to deactivate ${name}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deactivateUser(id).subscribe({
          next: () => {
            this.loadUsers();
            this.successMessage = 'User deactivated.';
          },
          error: () => this.errorMessage = 'Failed to deactivate user.'
        });
      }
    });
  }

  activateUser(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Confirm Activation', message: 'Are you sure you want to activate this user?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.activateUser(id).subscribe({
          next: () => {
            this.loadUsers();
            this.successMessage = 'User activated.';
          },
          error: () => this.errorMessage = 'Failed to activate user.'
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }
}
