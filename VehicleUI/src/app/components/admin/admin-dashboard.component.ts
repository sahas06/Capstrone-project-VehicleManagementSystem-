import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { HttpClient } from '@angular/common/http';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  userCount = 0;
  categoryCount = 0;


  constructor(private adminService: AdminService, private http: HttpClient) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // 1. Get Users Count
    this.adminService.getAllUsers().subscribe(users => {
      this.userCount = users.length;
    });

    // 2. Get Categories Count
    this.adminService.getCategories().subscribe(cats => {
      this.categoryCount = cats.length;
    });


  }
}
