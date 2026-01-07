import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TechnicianService {

    private baseUrl = 'https://localhost:7290/api/technician';

    constructor(private http: HttpClient) { }

    getTasks(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/tasks`);
    }

    updateJobStatus(serviceRequestId: number, status: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/services/${serviceRequestId}/status`, { status });
    }

    useParts(serviceRequestId: number, parts: any[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/services/${serviceRequestId}/parts`, { parts });
    }

    getParts(): Observable<any[]> {
        // Accessing Manager API as Technician (allowed by RBAC)
        return this.http.get<any[]>('https://localhost:7290/api/manager/parts');
    }

    getUsedParts(serviceRequestId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/services/${serviceRequestId}/parts`);
    }
}
