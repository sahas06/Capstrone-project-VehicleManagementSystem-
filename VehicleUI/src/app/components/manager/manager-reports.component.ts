import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../services/manager.service';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { MaterialModule } from '../../shared/material.module';

Chart.register(...registerables);

@Component({
    selector: 'app-manager-reports',
    standalone: true,
    imports: [CommonModule, FormsModule, MaterialModule],
    templateUrl: './manager-reports.component.html',
    styleUrls: ['./manager-reports.component.scss']
})
export class ManagerReportsComponent implements OnInit, AfterViewInit {
    @ViewChildren('dailyTrendChart') dailyTrendCanvas!: QueryList<ElementRef>;
    @ViewChildren('revenueChart') revenueCanvas!: QueryList<ElementRef>;
    @ViewChildren('techPerformanceChart') techPerformanceCanvas!: QueryList<ElementRef>;
    @ViewChildren('statusChart') statusCanvas!: QueryList<ElementRef>;
    @ViewChildren('categoryChart') categoryCanvas!: QueryList<ElementRef>;

    charts: any = {};
    filters: any = { from: '', to: '', category: '', technicianId: '', priority: '' };
    technicians: any[] = [];
    categories: any[] = []; // Populate if AdminService allows or from hardcoded list for now

    constructor(private managerService: ManagerService, private adminService: AdminService, private router: Router) { }

    ngOnInit() {
        this.loadMetaData();
    }

    ngAfterViewInit() {
        // Initial load
        this.loadReports();
    }

    loadMetaData() {
        this.managerService.getActiveTechnicians().subscribe(data => this.technicians = data);
        this.adminService.getCategories().subscribe(data => this.categories = data);
    }

    loadReports() {
        const { from, to, category, technicianId, priority } = this.filters;

        // 1. Daily Trend
        this.managerService.getDailyTrend(from, to, category, technicianId, priority).subscribe(data => {
            this.renderChart('dailyTrend', this.dailyTrendCanvas.first, 'line', data, 'Services Count', 'x', 'y');
        });

        // 2. Revenue - Note: Revenue logic joins bills so tech/cat filters apply if backend supports
        this.managerService.getMonthlyRevenue(from, to, category, technicianId, priority).subscribe(data => {
            this.renderChart('revenue', this.revenueCanvas.first, 'bar', data, 'Revenue', 'label', 'value');
        });

        // 3. Tech Performance
        this.managerService.getTechnicianPerformance(from, to, category, priority).subscribe(data => {
            this.renderChart('tech', this.techPerformanceCanvas.first, 'pie', data, 'Completed Jobs', 'label', 'value');
        });

        // 4. Status
        this.managerService.getStatusDistribution(from, to, category, technicianId, priority).subscribe(data => {
            this.renderChart('status', this.statusCanvas.first, 'doughnut', data, 'Status', 'label', 'value');
        });

        // 5. Category
        this.managerService.getCategoryAnalysis(from, to, technicianId, priority).subscribe(data => {
            this.renderChart('category', this.categoryCanvas.first, 'bar', data, 'Bookings', 'label', 'value');
        });
    }

    renderChart(key: string, canvasRef: ElementRef, type: any, data: any[], label: string, labelKey: string = 'label', valueKey: string = 'value') {
        if (this.charts[key]) {
            this.charts[key].destroy();
            delete this.charts[key]; // Ensure removed
        }

        if (!data || data.length === 0) {
            return; // Don't create chart, UI shows "No data"
        }

        if (!canvasRef) return;

        const labels = data.map(d => d[labelKey] || d.label || d.Label || d.Date || d.Month);
        const values = data.map(d => d[valueKey] || d.value || d.Value || d.Count || d.Revenue);

        this.charts[key] = new Chart(canvasRef.nativeElement, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: values,
                    borderWidth: 1,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    goBack() {
        this.router.navigate(['/manager-dashboard']);
    }
}
