import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Sidebar } from '../../../../reusable/components/sidebar/sidebar';
import { Api } from '../../../../services/api';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-submission',
  imports: [Sidebar, CommonModule],
  templateUrl: './submission.html',
  styleUrl: './submission.css',
})
export class Submission implements OnInit {
  pendingAssignments: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private api: Api,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoading = false;
      this.error = 'You are not logged in.';
      return;
    }

    setTimeout(() => this.ngZone.run(() => this.loadAssignments()), 50);
  }

  private loadAssignments(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      assignments: this.api.getAssignments(),
      submissions: this.api.getFeedback(),
    }).subscribe({
      next: ({ assignments, submissions }) => {
        const submittedIds = new Set(submissions.map((s: any) => s.assignment_id));

        this.pendingAssignments = assignments.filter((a: any) => {
          return a.submission_status === 'No submissions have been made yet';
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading assignments:', err);
        this.error = 'Failed to load assignments. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  navigateToAssignment(id: any): void {
    this.router.navigate(['/submit', id]);
  }
}
