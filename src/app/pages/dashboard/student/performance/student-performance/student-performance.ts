import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Sidebar } from '../../../../../reusable/components/sidebar/sidebar';
import { Api } from '../../../../../services/api';
import { PerformanceChartComponent } from '../../../../../reusable/components/performance-chart/chart/chart';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-performance',
  imports: [Sidebar, CommonModule, PerformanceChartComponent],
  templateUrl: './student-performance.html',
  styleUrl: './student-performance.css',
})
export class StudentPerformance implements OnInit {
  performanceData: any[] = [];
  isLoading = true;
  error: string | null = null;

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
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'You are not logged in.';
      this.isLoading = false;
      return;
    }

    setTimeout(() => this.ngZone.run(() => this.loadData()), 50);
  }

  private loadData(): void {
    this.isLoading = true;
    this.error = null;

    this.api.getPerformance().subscribe({
      next: (data: any[]) => {
        console.log('Raw performance data:', JSON.stringify(data, null, 2));
        // Optional: Normalize data for chart and table
        this.performanceData = (data || []).map((item) => ({
          ...item,
          // Make sure we have consistent fields for the chart
          score: item.percentage ?? item.grade ?? item.score ?? 0,
          assignment: item.assignment || item.title || item.assignment_title,
          course_name: item.course_name || item.courseName,
        }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading performance:', err);
        this.error = 'Failed to load performance data.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
