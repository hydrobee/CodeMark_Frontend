import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return { Authorization: `Bearer ${token}` };
  }

  // ======================
  // Auth & Common Methods
  // ======================
  login(email: string, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return this.http.post(`${this.baseUrl}/auth/login`, formData);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`, { headers: this.getAuthHeaders() });
  }

  // ======================
  // Student Endpoints
  // ======================
  getAssignments(): Observable<any[]> {
    return this.getWithErrorHandling('http://127.0.0.1:8000/student/', 'Assignments');
  }

  getFeedback(): Observable<any[]> {
    return this.getWithErrorHandling('http://127.0.0.1:8000/student/my-submissions', 'Feedback');
  }

  getStudentFeedbackDetail(submissionId: number): Observable<any> {
    return this.getWithErrorHandling(
      `${this.baseUrl}/student/my-submissions`,
      'Student feedback detail',
    ).pipe(
      map(
        (submissions: any[]) => submissions.find((s) => s.submission_id === submissionId) || null,
      ),
    );
  }

  getPerformance(): Observable<any[]> {
    return this.getWithErrorHandling('http://127.0.0.1:8000/student/performance', 'Performance');
  }

  getProfile(): Observable<any> {
    return this.getWithErrorHandling('http://127.0.0.1:8000/student/profile', 'Profile');
  }

  // ======================
  // Lecturer Endpoints
  // ======================
  getLecturerPendingFeedback(): Observable<any[]> {
    return this.getWithErrorHandling(`${this.baseUrl}/lecturer/pending`, 'Pending feedback');
  }

  getLecturerSubmissions(): Observable<any[]> {
    return this.getWithErrorHandling(`${this.baseUrl}/lecturer/view-submission`, 'Submissions');
  }

  getLecturerPerformance(): Observable<any[]> {
    return this.getWithErrorHandling(
      `${this.baseUrl}/lecturer/performance`,
      'Lecturer performance',
    );
  }

  getPendingFeedbackDetail(feedbackId: number): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/lecturer/pending/${feedbackId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap({
          next: (res) => console.log('Pending feedback detail:', res),
          error: (err) => console.error('Pending feedback detail error:', err),
        }),
        catchError((err) => {
          console.error('API Error in getPendingFeedbackDetail:', err);
          return throwError(() => err);
        }),
      );
  }

  // ======================
  // Feedback Actions
  // ======================
  generateFeedback(submissionId: number): Observable<any> {
    return this.http
      .post<any>(
        `${this.baseUrl}/lecturer/submission/${submissionId}/generate-feedback`,
        {},
        { headers: this.getAuthHeaders() },
      )
      .pipe(
        tap({
          next: (res) => console.log('Generated feedback:', res),
          error: (err) => console.error('Generate feedback error:', err),
        }),
        catchError((err) => {
          console.error('API Error in generateFeedback:', err);
          return throwError(() => err);
        }),
      );
  }

  editFeedback(feedbackId: number, data: any): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}/lecturer/edit/${feedbackId}`, data, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap({
          next: (res) => console.log('Edit feedback success:', res),
          error: (err) => console.error('Edit feedback error:', err),
        }),
      );
  }

  approveFeedback(feedbackId: number): Observable<any> {
    return this.http
      .put<any>(
        `${this.baseUrl}/lecturer/approve/${feedbackId}`,
        {},
        { headers: this.getAuthHeaders() },
      )
      .pipe(
        tap({
          next: () => console.log(`Feedback ${feedbackId} approved`),
          error: (err) => console.error('Approve feedback error:', err),
        }),
      );
  }

  rejectFeedback(feedbackId: number): Observable<any> {
    return this.http
      .put<any>(
        `${this.baseUrl}/lecturer/reject/${feedbackId}`,
        {},
        { headers: this.getAuthHeaders() },
      )
      .pipe(
        tap({
          next: () => console.log(`Feedback ${feedbackId} rejected`),
          error: (err) => console.error('Reject feedback error:', err),
        }),
      );
  }

  // ======================
  // Admin Endpoints
  // ======================
  getSystemLogs(
    filters: {
      action?: string;
      actor_id?: number;
      target_type?: string;
      status?: string;
      from_date?: string;
      to_date?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Observable<any> {
    let params = new HttpParams();
    if (filters.action) params = params.set('action', filters.action);
    if (filters.actor_id) params = params.set('actor_id', filters.actor_id.toString());
    if (filters.target_type) params = params.set('target_type', filters.target_type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.from_date) params = params.set('from_date', filters.from_date);
    if (filters.to_date) params = params.set('to_date', filters.to_date);
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.offset) params = params.set('offset', filters.offset.toString());

    return this.http
      .get<any>(`${this.baseUrl}/admin/system-logs`, {
        headers: this.getAuthHeaders(),
        params,
      })
      .pipe(
        catchError((err) => {
          console.error('API Error in getSystemLogs:', err);
          return throwError(() => err);
        }),
      );
  }

  // ======================
  // Private Helper Method
  // ======================
  private getWithErrorHandling(url: string, operation: string): Observable<any[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Not in browser environment'));
    }

    return this.http.get<any[]>(url, { headers: this.getAuthHeaders() }).pipe(
      tap({
        next: (res) => console.log(`${operation}:`, res),
        error: (err) => console.error(`${operation} error:`, err),
      }),
      catchError((err) => {
        console.error(`API Error in ${operation}:`, err);
        return throwError(() => err);
      }),
    );
  }

  submitAssignment(assignmentId: number, formData: FormData, groupNo?: string) {
    let url = `${this.baseUrl}/student/submit-assignment?assignment_id=${assignmentId}`;
    if (groupNo) {
      url += `&group_no=${encodeURIComponent(groupNo)}`;
    }
    return this.http.post(url, formData, { headers: this.getAuthHeaders() });
  }

  deleteAssignment(assignmentId: number) {
    return this.http.delete(`${this.baseUrl}/lecturer/delete-assignment/${assignmentId}`);
  }

  getMyAssignments() {
    return this.http.get<any[]>(`${this.baseUrl}/lecturer/my-assignments`);
  }
}
