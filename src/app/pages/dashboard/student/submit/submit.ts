import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  NgZone,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Api } from '../../../../services/api';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-submit',
  imports: [CommonModule, FormsModule],
  templateUrl: './submit.html',
  styleUrl: './submit.css',
})
export class Submit implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  assignment: any = null;
  studentProfile: any = null;
  isLoading = true;
  error: string | null = null;
  groupNo: string = '';

  // File upload state
  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  uploadError: string | null = null;
  submitSuccess = false;

  private readonly allowedExtensions = ['.py', '.java', '.cpp', '.js', '.c'];

  constructor(
    private api: Api,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Assignment not found.';
      this.isLoading = false;
      return;
    }

    setTimeout(() => this.ngZone.run(() => this.loadAssignment(id)), 50);
  }

  private loadAssignment(id: string): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      assignments: this.api.getAssignments(),
      profile: this.api.getProfile(),
    }).subscribe({
      next: ({ assignments, profile }) => {
        this.assignment =
          assignments.find((a: any) => String(a.assignment_id) === String(id)) || null;
        this.studentProfile = profile;
        if (!this.assignment) this.error = 'Assignment not found.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Failed to load assignment.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── File dialog ──────────────────────────────────────────────────────────────

  openFileDialog(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.uploadError = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // ── Drag & drop ──────────────────────────────────────────────────────────────

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.validateAndSetFile(file);
    }
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  private validateAndSetFile(file: File): void {
    this.uploadError = null;
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      this.uploadError = `Invalid file type. Allowed: ${this.allowedExtensions.join(', ')}`;
      this.selectedFile = null;
      return;
    }
    this.selectedFile = file;
    this.cdr.detectChanges();
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  submitAssignment(): void {
    if (!this.selectedFile || !this.assignment) return;

    this.isUploading = true;
    this.uploadError = null;
    this.uploadProgress = 0;

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    // Pass group_no as optional query param
    this.api
      .submitAssignment(
        this.assignment.assignment_id,
        formData,
        this.groupNo.trim() || undefined, 
      )
      .subscribe({
        next: () => {
          this.isUploading = false;
          this.submitSuccess = true;
          this.selectedFile = null;
          this.assignment.submission_status = 'Submitted';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isUploading = false;
          this.uploadError = err?.error?.detail ?? 'Submission failed. Please try again.';
          this.cdr.detectChanges();
        },
      });
  }

  getFileUrl(): string {
    if (!this.assignment?.question_file_path) return '#';
    const normalized = this.assignment.question_file_path.replace(/\\/g, '/');
    return `http://localhost:8000/${normalized}`;
  }

  getRubricUrl(): string {
    if (!this.assignment?.rubric_file_path) return '#';

    let path = this.assignment.rubric_file_path;
    // Normalize backslashes and ensure it starts correctly
    path = path.replace(/\\/g, '/');

    // If path doesn't start with "uploads/", add the base URL
    if (!path.startsWith('http')) {
      return `http://localhost:8000/${path}`;
    }
    return path;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  goBack(): void {
    window.history.back();
  }
}
