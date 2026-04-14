import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Api } from '../../../../../services/api';
import { Sidebar } from '../../../../../reusable/components/sidebar/sidebar';

@Component({
  selector: 'app-feedback-student',
  imports: [Sidebar, CommonModule],
  templateUrl: './feedback-student.html',
  styleUrl: './feedback-student.css',
})
export class FeedbackStudent implements OnInit {
  feedbackList: any[] = [];
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

    this.loadFeedback();
  }

  private loadFeedback(): void {
    this.isLoading = true;
    this.error = null;

    this.api.getFeedback().subscribe({
      next: (data: any[]) => {
        this.feedbackList = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading student feedback:', err);
        this.error = err?.error?.detail || 'Failed to load feedback. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  navigateToFeedbackDetail(submissionId: any): void {
    if (!submissionId) return;
    this.router.navigate(['/student-feedback', submissionId]);
  }

  goBack(): void {
    window.history.back();
  }

  // Optional: Refresh button
  refreshFeedback(): void {
    this.loadFeedback();
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}