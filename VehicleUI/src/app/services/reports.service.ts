import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportsService {

    private baseUrl = 'https://localhost:7290/api/reports';

    constructor(private http: HttpClient) { }

    getServicesPerMonth(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/services-per-month`);
    }

    getRevenueReport(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/revenue`);
    }

    getTechnicianWorkload(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/technician-workload`);
    }
}
