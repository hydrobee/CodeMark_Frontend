import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Sidebar } from '../../../../reusable/components/sidebar/sidebar';
import { Api } from '../../../../services/api';
import { PerformanceChartComponent } from '../../../../reusable/components/performance-chart/chart/chart';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [Sidebar, CommonModule, PerformanceChartComponent],
  templateUrl: './student.html',
  styleUrls: ['./student.css'],
})
export class Student implements OnInit {
  userName: string = 'Student';

  // Pending assignments
  pendingAssignments: any[] = [];
  loading = true;
  error: string | null = null;

  // Feedback summary
  feedbackList: any[] = [];
  loadingFeedback = true;
  errorFeedback: string | null = null;

  // Performance
  performanceData: any[] = [];
  loadingPerformance = true;
  errorPerformance: string | null = null;

  constructor(
    private api: Api,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      this.loadingFeedback = false;
      this.loadingPerformance = false;
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userName = user?.name || 'Student';

    const token = localStorage.getItem('token');
    if (!token) {
      this.loading = false;
      this.loadingFeedback = false;
      this.loadingPerformance = false;
      this.error = 'You are not logged in.';
      this.errorFeedback = 'You are not logged in.';
      this.errorPerformance = 'You are not logged in.';
      return;
    }

    setTimeout(() => this.ngZone.run(() => this.loadPendingAssignments()), 50);
    setTimeout(() => this.ngZone.run(() => this.loadFeedback()), 50);
    setTimeout(() => this.ngZone.run(() => this.loadPerformance()), 50);
  }

  // -------------------- Pending Assignments --------------------
  loadPendingAssignments(): void {
    this.loading = true;
    this.error = null;

    this.api.getAssignments().subscribe({
      next: (data: any[]) => {
        console.log('✅ Raw assignments:', data);

        this.pendingAssignments = (data || []).filter((a: any) => {
          const status = (a?.submission_status || '').trim();
          return status === 'No submissions have been made yet';
        });

        console.log('📌 Pending count:', this.pendingAssignments.length);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading assignments:', err);
        this.error = err.message || 'Failed to load pending assignments.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // -------------------- Feedback Summary --------------------
  loadFeedback(): void {
    this.loadingFeedback = true;
    this.errorFeedback = null;

    this.api.getFeedback().subscribe({
      next: (data: any[]) => {
        console.log('✅ Feedback data:', data);
        this.feedbackList = data || [];
        this.loadingFeedback = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading feedback:', err);
        this.errorFeedback = err.message || 'Failed to load feedback.';
        this.loadingFeedback = false;
        this.cdr.detectChanges();
      },
    });
  }

  // -------------------- Performance --------------------
  loadPerformance(): void {
    this.loadingPerformance = true;
    this.errorPerformance = null;

    this.api.getPerformance().subscribe({
      next: (data: any[]) => {
        console.log('✅ Performance data:', data);
        this.performanceData = data || [];
        this.loadingPerformance = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading performance:', err);
        this.errorPerformance = err.message || 'Failed to load performance.';
        this.loadingPerformance = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ====================== Navigation ======================

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  navigateToAssignment(id: any): void {
    if (id) {
      this.router.navigate(['/submit', id]);
    } else {
      console.warn('Cannot navigate: Assignment ID is missing');
    }
  }

  navigateToSubmission(assignment: any): void {
    const id = assignment?.assignment_id || assignment?.id;
    this.navigateToAssignment(id);
  }

  navigateToFeedbackDetail(id: any): void {
    if (id) {
      this.router.navigate(['/student-feedback', id]);
    } else {
      console.warn('Cannot navigate: Submission ID is missing');
    }
  }

  trackById(index: number, item: any): any {
    return item?.assignment_id || item?.id || index;
  }
}
