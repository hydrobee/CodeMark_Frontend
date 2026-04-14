import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Api } from '../../../../services/api';

@Component({
  selector: 'app-delete-assignment',
  imports: [CommonModule],
  templateUrl: './delete-assignment.html',
  styleUrl: './delete-assignment.css',
})
export class DeleteAssignment implements OnInit {
  assignments: any[] = [];
  isLoading = true;
  error: string | null = null;

  assignmentToDelete: any = null;
  deletingId: number | null = null;
  toastVisible = false;

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

  // ── Popup controls ────────────────────────────────────────────────────────

  confirmDelete(assignment: any): void {
    this.assignmentToDelete = assignment;
  }

  cancelDelete(): void {
    this.assignmentToDelete = null;
  }

  // ── Actual delete ─────────────────────────────────────────────────────────

  deleteAssignment(): void {
    if (!this.assignmentToDelete) return;

    const id = this.assignmentToDelete.assignment_id;
    this.deletingId = id;
    this.assignmentToDelete = null;

    this.api.deleteAssignment(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.loadAssignments(); // re-fetch from server
        this.showToast();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.detail ?? 'Failed to delete assignment.';
        this.deletingId = null;
        this.cdr.detectChanges();
      },
    });
  }

  closeSuccessPopup(): void {
    this.toastVisible = false;
    this.cdr.detectChanges();
  }

  private showToast(): void {
    this.toastVisible = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 4000);
  }

  goBack(): void {
    window.history.back();
  }
}