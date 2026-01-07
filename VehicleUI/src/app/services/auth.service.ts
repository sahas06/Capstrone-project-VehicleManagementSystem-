import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:7290/api/auth';   // ✅ FIXED

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>;

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    this.currentUserSubject = new BehaviorSubject<any>(token ? this.decodeToken(token) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(this.decodeToken(response.token));
        }
        return response;
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  private decodeToken(token: string): any {
    try {
      const decoded: any = jwtDecode(token);
      return {
        ...decoded,
        email: decoded.email,
        role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      };
    } catch {
      return null;
    }
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, data);
  }

  getRole(): string {
    return this.currentUserValue?.role || '';
  }

  getUserName(): string {
    const user = this.currentUserValue;
    return user ? (user.unique_name || user.email || user.sub || 'User') : 'User';
  }

  storeToken(token: string) {
    localStorage.setItem('token', token);
    this.currentUserSubject.next(this.decodeToken(token));
  }

  storeUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}
