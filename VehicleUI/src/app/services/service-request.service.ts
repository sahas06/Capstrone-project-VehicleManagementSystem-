import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServiceRequestService {

    private baseUrl = 'https://localhost:7290/api/services';

    constructor(private http: HttpClient) { }

    bookService(data: any) {
        return this.http.post(`${this.baseUrl}/book`, data);
    }

    getMyHistory() {
        return this.http.get<any[]>(`${this.baseUrl}/history`);
    }

    // For generic dashboard stats
    getDashboardStats() {
        return this.http.get<any>(`${this.baseUrl}/stats`);
    }

    // For specific request history (Technician/Manager view)
    getServiceHistory(id: number) {
        return this.http.get<any[]>(`${this.baseUrl}/${id}/history`);
    }

    cancelService(id: number): Observable<any> {
        return this.http.put(`${this.baseUrl}/cancel/${id}`, {});
    }

    rescheduleService(id: number, newDate: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/reschedule/${id}`, JSON.stringify(newDate), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
