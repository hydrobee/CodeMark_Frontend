import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../../../services/api';

@Component({
  selector: 'app-feedback-detail',
  imports: [CommonModule],
  templateUrl: './feedback-detail.html',
  styleUrl: './feedback-detail.css',
})
export class FeedbackDetail implements OnInit {
  feedback: any = null;
  isLoading = true;
  error: string | null = null;

  private feedbackId!: number;

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

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Feedback ID not found.';
      this.isLoading = false;
      return;
    }

    this.feedbackId = Number(id);
    this.loadFeedbackDetail();
  }

  private loadFeedbackDetail(): void {
  this.isLoading = true;
  this.error = null;

  this.api.getStudentFeedbackDetail(this.feedbackId).subscribe({  // ← changed
    next: (data) => {
      if (!data) {
        this.error = 'Feedback not found.';
      } else {
        this.feedback = data;
      }
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.error = err?.error?.detail || 'Failed to load feedback details.';
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

  // Calculate total weight from rubric scores
  getTotalMarks(): number {
    return (this.feedback?.rubric_scores ?? []).reduce(
      (sum: number, item: any) => sum + (item?.weight ?? 0),
      0
    );
  }

  // Get grading status
  getGradingStatus(): string {
    if (!this.feedback) return 'Not Graded';
    return this.feedback.grade !== null && this.feedback.grade !== undefined 
      ? 'Graded' 
      : 'Not Graded';
  }

  goBack(): void {
    window.history.back();
  }

  // Optional: Approve / Reject buttons (if needed on this page)
  approveFeedback(): void {
    if (!this.feedback?.feedback_id) return;
    
    this.api.approveFeedback(this.feedback.feedback_id).subscribe({
      next: () => {
        alert('Feedback approved and released to student!');
        this.loadFeedbackDetail(); // refresh
      },
      error: (err) => {
        alert('Failed to approve feedback: ' + (err?.error?.detail || 'Unknown error'));
      }
    });
  }

  rejectFeedback(): void {
    if (!this.feedback?.feedback_id) return;
    
    this.api.rejectFeedback(this.feedback.feedback_id).subscribe({
      next: () => {
        alert('Feedback rejected.');
        this.loadFeedbackDetail(); // refresh
      },
      error: (err) => {
        alert('Failed to reject feedback: ' + (err?.error?.detail || 'Unknown error'));
      }
    });
  }
}