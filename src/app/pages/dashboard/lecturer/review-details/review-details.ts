import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarLecturer } from '../../../../reusable/components/sidebar-lecturer/sidebar-lecturer';
import { Api } from '../../../../services/api';

@Component({
  selector: 'app-review-details',
  imports: [SidebarLecturer, CommonModule, DatePipe],
  templateUrl: './review-details.html',
  styleUrls: ['./review-details.css'],
})
export class ReviewDetails implements OnInit {
  pendingFeedbacks: any[] = [];
  assignmentTitle: string = '';
  assignmentId!: number;

  isLoading = true;
  error: string | null = null;

  constructor(
    private api: Api,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('assignment_id');
    this.assignmentId = Number(idParam);

    if (!this.assignmentId || isNaN(this.assignmentId)) {
      this.error = 'Invalid assignment ID.';
      this.isLoading = false;
      return;
    }

    this.loadPendingReviews();
  }

  private loadPendingReviews(): void {
    this.isLoading = true;
    this.error = null;

    this.api.getLecturerSubmissions().subscribe({
      next: (submissions: any[]) => {
        console.log('All submissions:', JSON.stringify(submissions, null, 2));
        console.log('Looking for assignment_id:', this.assignmentId);

        const forThisAssignment = submissions.filter(
          (s: any) => Number(s.assignment_id) === this.assignmentId,
        );

        this.pendingFeedbacks = forThisAssignment.map((s: any) => ({
          ...s,
          student_name: s.student_name || s.student_id || 'Unknown Student',
        }));

        if (forThisAssignment.length > 0) {
          const first = forThisAssignment[0];
          this.assignmentTitle = [first.course_name, first.title].filter(Boolean).join(' — ');
        } else {
          this.assignmentTitle = `Assignment #${this.assignmentId}`;
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load pending reviews.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  navigateToFeedbackDetail(item: any): void {
    console.log('Item clicked:', item);

    if (!item.feedback_id) {
      const confirm = window.confirm(
        `No AI feedback yet for ${item.student_name}. Generate feedback now?`,
      );
      if (!confirm) return;

      this.api.generateFeedback(item.submission_id).subscribe({
        next: (res: any) => {
          console.log('Generated:', res);
          this.router.navigate(['/review-approval', res.feedback_id, item.submission_id]);
        },
        error: (err) => {
          alert('Failed to generate feedback: ' + (err?.error?.detail || 'Unknown error'));
        },
      });
      return;
    }

    this.router
      .navigate(['/review-approval', item.feedback_id, item.submission_id])
      .catch((err) => console.error('Navigation error:', err));
  }

  goBack(): void {
    window.history.back();
  }
}
