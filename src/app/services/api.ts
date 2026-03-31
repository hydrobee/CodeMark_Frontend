import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Api {

  private baseUrl = 'http://127.0.0.1:8000/auth';

  constructor(private http: HttpClient) {}

  // ✅ LOGIN (FormData for FastAPI OAuth2)
  login(email: string, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('username', email);   // ⚠️ MUST be "username"
    formData.append('password', password);

    return this.http.post(`${this.baseUrl}/login`, formData);
  }

  // ✅ REGISTER (JSON)
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  // ✅ GET CURRENT USER
  getMe(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`);
  }
}
