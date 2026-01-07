import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BillingService {

    private baseUrl = 'https://localhost:7290/api/billing';

    constructor(private http: HttpClient) { }

    getMyBills() {
        return this.http.get<any[]>(`${this.baseUrl}/my-bills`);
    }

    payBill(billId: number) {
        return this.http.post(`${this.baseUrl}/pay/${billId}`, {});
    }
}
