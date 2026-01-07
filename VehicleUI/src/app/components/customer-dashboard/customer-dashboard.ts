import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../../services/auth.service';
import { ServiceRequestService } from '../../services/service-request.service';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  templateUrl: './customer-dashboard.html',
  styleUrls: ['./customer-dashboard.scss']
})
export class CustomerDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('statusChart') statusChartRef!: ElementRef;

  activeServices = 0;
  myVehicles = 0;
  pendingBills = 0;
  totalSpent = 0; // New KPI
  unreadCount = 0; // Mock unread notification count
  userName = 'Customer';
  chart: Chart | undefined;

  constructor(private serviceRequestService: ServiceRequestService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.serviceRequestService.getDashboardStats().subscribe(data => {
      this.activeServices = data.activeServices;
      this.myVehicles = data.myVehicles;
      this.pendingBills = data.pendingBills;

      // Mock data for visual completeness as per request
      this.totalSpent = 1250;
      this.updateChart([data.activeServices, 5, 2]); // Example distribution
    });
  }

  ngAfterViewInit() {
    // Initial chart render with empty or mock data
    this.initChart();
  }

  initChart() {
    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Completed', 'Pending'],
        datasets: [{
          data: [1, 1, 1], // Placeholder
          backgroundColor: [
            '#FDBA74', // Orange-300 (Active)
            '#4ADE80', // Green-400 (Success)
            '#FACC15'  // Yellow-400 (Warning)
          ],
          hoverOffset: 4,
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              font: { family: 'Inter', size: 12 }
            }
          }
        }
      }
    };
    this.chart = new Chart(ctx, config);
  }

  updateChart(data: number[]) {
    if (this.chart) {
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
