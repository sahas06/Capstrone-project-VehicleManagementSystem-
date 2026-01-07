import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BookingService {

    private baseUrl = 'https://localhost:7290/api/services';

    constructor(private http: HttpClient) { }

    getMyBookings() {
        return this.http.get<any[]>(`${this.baseUrl}/history`);
    }
}
