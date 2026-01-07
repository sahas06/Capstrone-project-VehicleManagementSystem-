import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ManagerService {
    private apiUrl = 'https://localhost:7290/api';

    constructor(private http: HttpClient) { }

    // Service Requests
    getPendingRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/manager/requests`);
    }

    getActiveTechnicians(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/manager/technicians`);
    }

    getTechnicianAvailability(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/manager/technicians/availability`);
    }

    assignTechnician(requestId: number, technicianId: string): Observable<any> {
        // Send technicianId as JSON string as per backend expectation ([FromBody] string)
        return this.http.put(`${this.apiUrl}/manager/assign/${requestId}`, JSON.stringify(technicianId), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    getLowStockParts(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/manager/parts/low-stock`);
    }

    getDashboardStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/manager/stats`);
    }

    updatePart(id: number, part: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/manager/parts/${id}`, part);
    }

    // Reports
    getDailyTrend(from?: string, to?: string, category?: string, techId?: string, priority?: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/reports/daily-trend`, { params: this.buildParams(from, to, category, techId, priority) });
    }

    getMonthlyRevenue(from?: string, to?: string, category?: string, techId?: string, priority?: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/reports/monthly-revenue`, { params: this.buildParams(from, to, category, techId, priority) });
    }

    getTechnicianPerformance(from?: string, to?: string, category?: string, priority?: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/reports/technician-performance`, { params: this.buildParams(from, to, category, undefined, priority) });
    }

    getStatusDistribution(from?: string, to?: string, category?: string, techId?: string, priority?: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/reports/status-distribution`, { params: this.buildParams(from, to, category, techId, priority) });
    }

    getCategoryAnalysis(from?: string, to?: string, techId?: string, priority?: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/reports/category-analysis`, { params: this.buildParams(from, to, undefined, techId, priority) });
    }

    getServiceHistory(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/services/${id}/history`);
    }

    private buildParams(from?: string, to?: string, category?: string, techId?: string, priority?: string): any {
        let params: any = {};
        if (from) params.from = from;
        if (to) params.to = to;
        if (category) params.category = category;
        if (techId) params.technicianId = techId;
        if (priority) params.priority = priority;
        return params;
    }
}
