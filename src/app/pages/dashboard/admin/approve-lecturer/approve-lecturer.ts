import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-approve-lecturer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './approve-lecturer.html',
  styleUrl: './approve-lecturer.css',
})
export class ApproveLecturer implements OnInit {
  lecturers: any[] = [];
  loading = false;
  error = '';
  actionLoading: { [key: number]: boolean } = {};

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadPendingLecturers();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadPendingLecturers() {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.http.get<any[]>('http://localhost:8000/admin/pending-lecturers', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.lecturers = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load pending lecturers.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  updateStatus(lecturerId: number, action: 'approved' | 'rejected') {
    this.actionLoading[lecturerId] = true;
    this.cdr.detectChanges();

    this.http.patch<any>(
      `http://localhost:8000/admin/lecturer/${lecturerId}/status?action=${action}`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        // Remove from list after action
        this.lecturers = this.lecturers.filter(l => l.lecturer_id !== lecturerId);
        this.actionLoading[lecturerId] = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.actionLoading[lecturerId] = false;
        this.cdr.detectChanges();
        console.error('Failed to update lecturer status', err);
      }
    });
  }

  goBack() {
    window.history.back();
  }
}