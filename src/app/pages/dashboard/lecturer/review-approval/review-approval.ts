import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SidebarLecturer } from '../../../../reusable/components/sidebar-lecturer/sidebar-lecturer';
import { Api } from '../../../../services/api';

@Component({
  selector: 'app-review-approval',
  imports: [SidebarLecturer, CommonModule, FormsModule, DatePipe],
  templateUrl: './review-approval.html',
  styleUrls: ['./review-approval.css'],
})
export class ReviewApproval implements OnInit {
  feedbackId!: number;
  submissionId: string | number = ''; // can be string like "85559"

  submission: any = null;
  feedback: any = null;

  draft = {
    comments: '',
    strengths: '',
    areas_for_improvement: '',
    grade: null as number | null,
  };

  isLoading = true;
  error: string | null = null;
  isEditing = false;
  isSaving = false;
  isActioning = false;
  successMsg = '';
  actionError = '';

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

    // Better way to read route parameters
    this.feedbackId = Number(this.route.snapshot.paramMap.get('feedback_id'));
    this.submissionId = this.route.snapshot.paramMap.get('submission_id') || '';

    console.log(
      'Route params received → feedback_id:',
      this.feedbackId,
      'submission_id:',
      this.submissionId,
    );

    if (!this.feedbackId || !this.submissionId) {
      this.error = `Invalid route parameters. Received feedback_id=${this.feedbackId}, submission_id=${this.submissionId}`;
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadFeedbackDetail();
  }

  private loadFeedbackDetail(): void {
    this.isLoading = true;
    this.error = null;

    this.api.getPendingFeedbackDetail(this.feedbackId).subscribe({
      next: (data: any) => {
        console.log('Feedback detail loaded:', data);

        this.feedback = data;
        this.submission = data; // merged data

        this.draft = {
          comments: data.comments || '',
          strengths: data.strengths || '',
          areas_for_improvement: data.areas_for_improvement || '',
          grade: data.grade ?? null,
        };

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Load feedback detail failed:', err);
        this.error =
          err.status === 404
            ? 'This feedback was not found or already processed.'
            : 'Failed to load feedback details. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMsg = '';
    this.actionError = '';

    if (this.isEditing && this.feedback) {
      this.draft = {
        comments: this.feedback.comments || '',
        strengths: this.feedback.strengths || '',
        areas_for_improvement: this.feedback.areas_for_improvement || '',
        grade: this.feedback.grade ?? null,
      };
    }
  }

  saveEdit(): void {
    this.isSaving = true;
    this.successMsg = '';
    this.actionError = '';

    this.api.editFeedback(this.feedbackId, this.draft).subscribe({
      next: (updated) => {
        this.feedback = { ...this.feedback, ...updated };
        this.isEditing = false;
        this.isSaving = false;
        this.successMsg = 'Feedback updated successfully.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.actionError = 'Failed to save changes. Please try again.';
        this.isSaving = false;
        this.cdr.detectChanges();
      },
    });
  }

  approve(): void {
    this.isActioning = true;
    this.successMsg = '';
    this.actionError = '';

    this.api.approveFeedback(this.feedbackId).subscribe({
      next: () => {
        this.feedback.status = 'approved';
        this.isActioning = false;
        this.successMsg = 'Feedback approved and released to student.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.actionError = 'Failed to approve. Please try again.';
        this.isActioning = false;
        this.cdr.detectChanges();
      },
    });
  }

  reject(): void {
    if (!confirm('Are you sure you want to reject this AI feedback?')) return;

    this.isActioning = true;
    this.successMsg = '';
    this.actionError = '';

    this.api.rejectFeedback(this.feedbackId).subscribe({
      next: () => {
        this.feedback.status = 'rejected';
        this.isActioning = false;
        this.successMsg = 'Feedback rejected.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.actionError = 'Failed to reject. Please try again.';
        this.isActioning = false;
        this.cdr.detectChanges();
      },
    });
  }

  getTotalMarks(): number {
    return (this.feedback?.rubric_scores ?? []).reduce(
      (sum: number, item: any) => sum + (item.weight ?? 0),
      0,
    );
  }

  getFileUrl(filePath?: string): string {
    if (!filePath) return '#';
    const normalized = filePath.replace(/\\/g, '/');
    return `https://codemark-ai-assisted-student-programming.onrender.com/${normalized}`;
  }

  goBack(): void {
    window.history.back();
  }
}
