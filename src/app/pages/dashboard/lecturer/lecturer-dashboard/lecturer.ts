import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { SidebarLecturer } from '../../../../reusable/components/sidebar-lecturer/sidebar-lecturer';
import { Api } from '../../../../services/api';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PerformanceChartComponent } from '../../../../reusable/components/performance-chart/chart/chart';

@Component({
  selector: 'app-lecturer',
  imports: [SidebarLecturer, CommonModule, PerformanceChartComponent],
  templateUrl: './lecturer.html',
  styleUrls: ['./lecturer.css'],
})
export class Lecturer implements OnInit {
  userName: string = 'Lecturer';
  isLoading = true;
  error: string | null = null;

  pendingAssignments: any[] = []; // <-- show assignment cards
  loadingPending = true;
  errorPending: string | null = null;

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
      this.isLoading = false;
      this.loadingPending = false;
      this.loadingPerformance = false;
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userName = user?.name || 'Lecturer';

    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'You are not logged in.';
      this.isLoading = false;
      this.loadingPending = false;
      this.loadingPerformance = false;
      return;
    }

    setTimeout(() => this.ngZone.run(() => this.loadData()), 50);
  }

  private loadData(): void {
    this.isLoading = true;
    this.loadingPending = true;
    this.loadingPerformance = true;
    this.error = null;
    this.errorPending = null;
    this.errorPerformance = null;

    forkJoin({
      submissions: this.api.getLecturerSubmissions(),
      performance: this.api.getLecturerPerformance(),
    }).subscribe({
      next: ({ submissions, performance }) => {
        // Filter submissions that are pending (grade === null)
        const pending = submissions.filter((s: any) => s.grade === null);

        // Group by assignment_id
        const assignmentMap: { [key: string]: any } = {};
        pending.forEach((s) => {
          if (!assignmentMap[s.assignment_id]) {
            assignmentMap[s.assignment_id] = {
              assignment_id: s.assignment_id,
              title: s.title,
              course_name: s.course_name,
              pendingCount: 1,
            };
          } else {
            assignmentMap[s.assignment_id].pendingCount += 1;
          }
        });

        this.pendingAssignments = Object.values(assignmentMap);

        this.performanceData = performance || [];
        this.loadingPending = false;
        this.loadingPerformance = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.errorPending = 'Failed to load pending submissions.';
        this.errorPerformance = 'Failed to load performance.';
        this.loadingPending = false;
        this.loadingPerformance = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  navigateToAssignmentSubmissions(assignmentId: any): void {
    this.router.navigate(['/lecturer-assignment-submissions', assignmentId]);
  }

  navigateToAssignmentSubmissionsDetails(assignment_id: any): void {
    this.router.navigate(['/review-details', assignment_id]);
  }
}