import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface Assignment {
  assignment_id: number;
  course_name: string;
  title: string;
  description: string;
  deadline: string;
  question_file_name?: string;
}

@Component({
  selector: 'app-view-assignment',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './view-assignment.html',
  styleUrl: './view-assignment.css',
})
export class ViewAssignment implements OnInit {
  assignments: Assignment[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private http: HttpClient,
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

    setTimeout(() => this.ngZone.run(() => this.loadAssignments()), 50);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private loadAssignments(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.http
      .get<Assignment[]>('https://codemark-ai-assisted-student-programming.onrender.com/lecturer/my-assignments', {
        headers: this.getAuthHeaders(),
      })
      .subscribe({
        next: (data) => {
          this.assignments = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading assignments:', err);
          this.errorMessage = 'Failed to load assignments.';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  formatDeadline(deadline: string): string {
    return new Date(deadline).toLocaleString('en-MY', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  isOverdue(deadline: string): boolean {
    return new Date(deadline) < new Date();
  }

  goToCreate(): void {
    this.router.navigate(['/create-assignment']);
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  goBack(): void {
    window.history.back();
  }
}