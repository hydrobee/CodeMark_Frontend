import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface Assignment {
  lecturer_id: number;
  course_name: string;
  title: string;
  description: string;
  deadline: string;
}

interface AssignmentResponse {
  assignment_id: number;
  lecturer_id: number;
  course_name: string;
  title: string;
  description: string;
  deadline: string;
}

interface RubricCriterion {
  name: string;
  weight: number;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Component({
  selector: 'app-create-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './create-assignment.html',
  styleUrl: './create-assignment.css',
})
export class CreateAssignmentComponent implements OnInit {
  assignment: Assignment = {
    lecturer_id: 0,
    course_name: '',
    title: '',
    description: '',
    deadline: '',
  };

  // ── File selections ──────────────────────────────────────────────────────
  questionFile: File | null = null;
  rubricFile: File | null = null;

  // ── Rubric criteria ──────────────────────────────────────────────────────
  rubricCriteria: RubricCriterion[] = [{ name: '', weight: 0 }];
  totalWeight = 0;
  rubricExtracted = false;
  rubricFileUploading = false;
  rubricExtractError = '';

  // ── UI state ─────────────────────────────────────────────────────────────
  isLoading = false;
  stepMessage = '';
  successMessage = '';
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('user');
    const currentUser = raw ? JSON.parse(raw) : null;

    console.log('currentUser from localStorage:', currentUser); // debug — remove later

    // Try all possible paths where lecturer_id might be stored
    const lecturerId =
      currentUser?.role_data?.lecturer_id || // { role_data: { lecturer_id: X } }
      currentUser?.lecturer_id || // { lecturer_id: X }
      currentUser?.id || // { id: X }
      0;

    if (lecturerId) {
      this.assignment.lecturer_id = lecturerId;
    } else {
      this.errorMessage = 'Lecturer profile not found. Please log in again.';
    }
  }

  /** Attach Bearer token to every request */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  Rubric helpers
  // ════════════════════════════════════════════════════════════════════════

  addCriterion(): void {
    this.rubricCriteria.push({ name: '', weight: 0 });
  }

  removeCriterion(index: number): void {
    this.rubricCriteria.splice(index, 1);
    this.onWeightChange();
  }

  onWeightChange(): void {
    this.totalWeight = this.rubricCriteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  }

  /** True when criteria are partially filled but invalid */
  get rubricHasErrors(): boolean {
    const hasAny = this.rubricCriteria.some((c) => c.name.trim() || c.weight > 0);
    if (!hasAny) return false;
    if (this.totalWeight !== 100) return true;
    if (this.rubricCriteria.some((c) => !c.name.trim())) return true;
    return false;
  }

  /** True when criteria are fully filled and valid */
  get rubricIsValid(): boolean {
    const hasAny = this.rubricCriteria.some((c) => c.name.trim() || c.weight > 0);
    if (!hasAny) return false;
    return this.totalWeight === 100 && this.rubricCriteria.every((c) => c.name.trim());
  }

  // ════════════════════════════════════════════════════════════════════════
  //  File helpers
  // ════════════════════════════════════════════════════════════════════════

  getFileIcon(file: File): string {
    return file.type === 'application/pdf' ? '📕' : '📘';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private validateFile(file: File): string | null {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `"${file.name}" is not allowed. Only PDF and DOCX files are accepted.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `"${file.name}" exceeds the 10 MB size limit.`;
    }
    return null;
  }

  // ── Question file ────────────────────────────────────────────────────────
  onQuestionFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.setQuestionFile(input.files[0]);
    input.value = '';
  }

  onDropQuestion(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.setQuestionFile(file);
  }

  private setQuestionFile(file: File): void {
    const error = this.validateFile(file);
    if (error) {
      this.errorMessage = error;
      return;
    }
    this.questionFile = file;
    this.errorMessage = '';
  }

  removeQuestionFile(event: Event): void {
    event.stopPropagation();
    this.questionFile = null;
  }

  // ── Rubric file ──────────────────────────────────────────────────────────
  onRubricFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.setRubricFile(input.files[0]);
    input.value = '';
  }

  onDropRubric(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.setRubricFile(file);
  }

  private async setRubricFile(file: File): Promise<void> {
    const error = this.validateFile(file);
    if (error) {
      this.errorMessage = error;
      return;
    }

    this.rubricFile = file;
    this.errorMessage = '';
    this.rubricExtractError = '';

    // We need an assignment_id to call the extract endpoint.
    // Since this is "create" flow, we extract AFTER assignment creation (see onSubmit).
    // Just mark file selected — extraction happens in onSubmit step 2.5
    this.rubricExtracted = false;
  }

  removeRubricFile(event: Event): void {
    event.stopPropagation();
    this.rubricFile = null;
    this.rubricExtracted = false;
    this.rubricExtractError = '';
    // Restore blank manual criteria
    this.rubricCriteria = [{ name: '', weight: 0 }];
    this.totalWeight = 0;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  // ════════════════════════════════════════════════════════════════════════
  //  Form validation
  // ════════════════════════════════════════════════════════════════════════

  isFormValid(): boolean {
    const baseValid =
      !!this.assignment.course_name.trim() &&
      !!this.assignment.title.trim() &&
      !!this.assignment.description.trim() &&
      !!this.assignment.deadline;

    // If rubric FILE is selected → we don't need manual criteria
    if (this.rubricFile) {
      return baseValid;
    }

    // Manual rubric path → must be valid
    return baseValid && this.rubricIsValid;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  Submit — 4-step flow
  //
  //  Step 1: POST /lecturer/create-assignment
  //  Step 2: POST /lecturer/assignment/:id/upload-question  (if file selected)
  //  Step 3: POST /lecturer/assignment/:id/rubric           (if criteria valid)
  //  Step 4: POST /lecturer/assignment/:id/rubric/upload    (if rubric file selected)
  // ════════════════════════════════════════════════════════════════════════

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      this.errorMessage = this.rubricHasErrors
        ? 'Rubric weights must sum to 100 and all criterion names must be filled.'
        : 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const headers = this.getAuthHeaders();

    try {
      // ── Step 1: Create assignment ─────────────────────────────
      this.stepMessage = 'Creating assignment…';

      const created = await firstValueFrom(
        this.http.post<AssignmentResponse>('/api/lecturer/create-assignment', this.assignment, {
          headers,
        }),
      );

      const assignmentId = created.assignment_id;

      // ── Step 2: Upload question file ─────────────────────────
      if (this.questionFile) {
        this.stepMessage = 'Uploading question file…';

        const qForm = new FormData();
        qForm.append('file', this.questionFile);

        await firstValueFrom(
          this.http.post(`/api/lecturer/assignment/${assignmentId}/upload-question`, qForm, {
            headers: new HttpHeaders({
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
          }),
        );
      }

      // ── Step 3: Handle Rubric (FIXED) ─────────────────────────────
      if (this.rubricFile) {
        // ── FILE PATH: Auto-extract criteria + save file
        this.stepMessage = 'Extracting rubric criteria from file…';

        const rForm = new FormData();
        rForm.append('file', this.rubricFile);

        const extracted = await firstValueFrom(
          this.http.post<{ criteria: any[]; file_name: string }>(
            `/api/lecturer/assignment/${assignmentId}/rubric/extract`,
            rForm,
            {
              headers: new HttpHeaders({
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              }),
            },
          ),
        );

        // Update UI with extracted criteria
        this.rubricCriteria = extracted.criteria;
        this.onWeightChange();
        this.rubricExtracted = true;
      } else if (this.rubricIsValid) {
        // ── MANUAL PATH: Only save JSON criteria (no file)
        this.stepMessage = 'Saving rubric criteria…';

        await firstValueFrom(
          this.http.post(
            `/api/lecturer/assignment/${assignmentId}/rubric`,
            { criteria: this.rubricCriteria },
            { headers },
          ),
        );
      }

      // ── SUCCESS ──────────────────────────────────────────────
      this.isLoading = false;
      this.stepMessage = '';
      this.successMessage = 'Assignment created successfully!';

      // Reset form
      this.assignment = {
        lecturer_id: this.assignment.lecturer_id,
        course_name: '',
        title: '',
        description: '',
        deadline: '',
      };

      this.questionFile = null;
      this.rubricFile = null;
      this.rubricCriteria = [{ name: '', weight: 0 }];
      this.totalWeight = 0;
      this.rubricExtracted = false;

      setTimeout(() => this.router.navigate(['/view-assignment']), 1500);
    } catch (error: any) {
      this.isLoading = false;
      this.stepMessage = '';
      console.error('FULL ERROR:', error);

      if (error.status === 401) {
        this.router.navigate(['/login']);
      } else if (error.status === 403) {
        this.errorMessage =
          'Permission denied. Make sure your lecturer profile is loaded correctly.';
      } else {
        this.errorMessage = error?.error?.detail || 'Something went wrong. Please try again.';
      }
    }
  }

  goBack(): void {
    window.history.back();
  }

  cancel(): void {
    window.history.back();
  }
}
