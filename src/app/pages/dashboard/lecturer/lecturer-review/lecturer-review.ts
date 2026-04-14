import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { SidebarLecturer } from '../../../../reusable/components/sidebar-lecturer/sidebar-lecturer';
import { Api } from '../../../../services/api';

@Component({
  selector: 'app-lecturer-review',
  imports: [SidebarLecturer, CommonModule],
  templateUrl: './lecturer-review.html',
  styleUrls: ['./lecturer-review.css'], // fixed typo from styleUrl -> styleUrls
})
export class LecturerReview implements OnInit {
  pendingAssignments: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private api: Api,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
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

    this.loadPendingFeedback();
  }

  private loadPendingFeedback(): void {
    this.isLoading = true;
    this.error = null;

    this.api.getLecturerSubmissions().subscribe({
      next: (submissions) => {
        // Filter submissions that are pending (no grade yet)
        const pending = submissions.filter(
          (s: any) => s.grade === null || s.grade_status === 'pending' || s.grade_status === null,
        );

        // Group by assignment_id
        const assignmentMap: { [key: string]: any } = {};
        pending.forEach((s: any) => {
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
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load pending feedback:', err);
        this.error = 'Failed to load pending AI feedback. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  navigateToAssignmentSubmissions(assignment_id: any): void {
    this.router.navigate(['/review-details', assignment_id]);
  }
}
