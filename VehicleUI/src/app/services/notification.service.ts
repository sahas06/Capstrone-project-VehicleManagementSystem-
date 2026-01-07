import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = 'https://localhost:7290/api/notifications';

    constructor(private http: HttpClient) { }

    getMyNotifications(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/my`);
    }

    getUnreadCount(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/unread-count`);
    }

    markAsRead(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/read`, {});
    }
}
