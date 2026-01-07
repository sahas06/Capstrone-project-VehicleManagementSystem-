import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VehicleService {

  private baseUrl = 'https://localhost:7290/api/vehicles';

  constructor(private http: HttpClient) { }

  addVehicle(data: any) {
    return this.http.post(this.baseUrl, data);
  }

  getMyVehicles() {
    return this.http.get<any[]>(this.baseUrl);
  }
}
