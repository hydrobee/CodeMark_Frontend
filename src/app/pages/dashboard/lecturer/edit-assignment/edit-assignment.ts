import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Api } from '../../../../services/api';

@Component({
  selector: 'app-edit-assignment',
  imports: [CommonModule],
  templateUrl: './edit-assignment.html',
  styleUrl: './edit-assignment.css',
})
export class EditAssignment implements OnInit {
  assignments: any[] = [];
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
    setTimeout(() => this.ngZone.run(() => this.loadAssignments()), 50);
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.error = null;

    this.api.getMyAssignments().subscribe({
      next: (data: any[]) => {
        this.assignments = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load assignments.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  editAssignment(assignment: any): void {
    this.router.navigate(['/edit-assignment-form', assignment.assignment_id]);
  }

  goToManagement(): void {
    this.router.navigate(['/assignment-management']);
  }

  goBack(): void {
    window.history.back();
  }
}