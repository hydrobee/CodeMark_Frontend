import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { SidebarLecturer } from '../../../../reusable/components/sidebar-lecturer/sidebar-lecturer';
import { Api } from '../../../../services/api';
import { PerformanceChartComponent } from '../../../../reusable/components/performance-chart/chart/chart';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lecturer-performance',
  imports: [SidebarLecturer, CommonModule, PerformanceChartComponent],
  templateUrl: './lecturer-performance.html',
  styleUrl: './lecturer-performance.css',
})
export class LecturerPerformance implements OnInit {
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

    this.api.getLecturerPerformance().subscribe({
      next: (data: any[]) => {
        // Normalize the lecturer performance response { title, average_score }
        // into the same shape the chart and table expect
        this.performanceData = (data || []).map(item => ({
          ...item,
          score: item.average_score ?? item.score ?? 0,
          assignment: item.title || item.assignment || item.assignment_title,
          course_name: item.course_name || item.courseName || '',
        }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading lecturer performance:', err);
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