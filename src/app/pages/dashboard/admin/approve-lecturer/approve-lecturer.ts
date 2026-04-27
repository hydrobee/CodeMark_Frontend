import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../../services/api';

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

  constructor(private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadPendingLecturers();
  }

  loadPendingLecturers() {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.api.getPendingLecturers().subscribe({
      next: (data: any[]) => {
        this.lecturers = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
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

    this.api.updateLecturerStatus(lecturerId, action).subscribe({
      next: () => {
        this.lecturers = this.lecturers.filter(l => l.lecturer_id !== lecturerId);
        this.actionLoading[lecturerId] = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
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