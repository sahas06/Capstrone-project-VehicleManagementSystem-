import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerService } from '../../services/manager.service';
import { MaterialModule } from '../../shared/material.module';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss']
})
export class ManagerDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('workloadChart') workloadChartRef!: ElementRef;
  @ViewChild('volumeChart') volumeChartRef!: ElementRef;

  pendingRequests = 0;
  activeTechs = 0;
  lowStockParts: any[] = [];
  displayedColumns: string[] = ['partName', 'remainingQty', 'status'];

  workloadChart: Chart | undefined;
  volumeChart: Chart | undefined;

  closedThisMonth = 0;
  revenueEst = 0;

  constructor(private managerService: ManagerService) { }

  ngOnInit() {
    this.managerService.getDashboardStats().subscribe(stats => {
      this.pendingRequests = stats.newRequests;
      this.activeTechs = stats.activeTechnicians;
      this.closedThisMonth = stats.closedThisMonth;
      this.revenueEst = stats.revenue;
    });

    this.managerService.getLowStockParts().subscribe(data => {
      this.lowStockParts = data;
    });
  }

  ngAfterViewInit() {
    this.initChartsWithData();
  }

  initChartsWithData() {
    // 1. Technician Workload
    this.managerService.getTechnicianPerformance().subscribe({
      next: (data) => {
        const labels = data.map(d => d.label);
        const values = data.map(d => d.value);
        this.initWorkloadChart(labels, values);
      },
      error: (err) => console.error(err)
    });

    // 2. Monthly Service Volume (Using Status Distribution or Daily Trend for now as proxy or implement actual monthly endpoint)
    // For now let's use Daily Trend to show activity
    this.managerService.getDailyTrend().subscribe({
      next: (data) => {
        // Aggregate by month or just show last 7 days? 
        // Let's just show what the API returns (Daily Trend)
        const labels = data.map(d => d.label);
        const values = data.map(d => d.value);
        this.initVolumeChart(labels, values);
      },
      error: (err) => console.error(err)
    });
  }

  initWorkloadChart(labels: string[], data: number[]) {
    if (!this.workloadChartRef) return;
    const ctx = this.workloadChartRef.nativeElement.getContext('2d');
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Completed Jobs',
          data: data,
          backgroundColor: '#FDBA74',
          borderRadius: 8,
          barThickness: 20
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#F3F4F6' } },
          x: { grid: { display: false } }
        }
      }
    };
    this.workloadChart = new Chart(ctx, config);
  }

  initVolumeChart(labels: string[], data: number[]) {
    if (!this.volumeChartRef) return;
    const ctx = this.volumeChartRef.nativeElement.getContext('2d');
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Service Trend',
          data: data,
          borderColor: '#FB923C',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#F3F4F6' } },
          x: { grid: { display: false } }
        }
      }
    };
    this.volumeChart = new Chart(ctx, config);
  }
}
