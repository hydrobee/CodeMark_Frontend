import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../../../services/api';

interface Assignment {
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
  imports: [CommonModule, FormsModule],
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

  // ── Rubric criteria ─────────────────────────────────────────────────────
  rubricCriteria: RubricCriterion[] = [{ name: '', weight: 0 }];
  totalWeight = 0;

  // ── UI state ────────────────────────────────────────────────────────────
  isLoading = false;
  stepMessage = '';
  successMessage = '';
  errorMessage = '';

  constructor(
    private api: Api,        // ← Injected Api service
    private router: Router,
  ) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('user');
    const currentUser = raw ? JSON.parse(raw) : null;

    const lecturerId =
      currentUser?.role_data?.lecturer_id ||
      currentUser?.lecturer_id ||
      currentUser?.id ||
      0;

    if (lecturerId) {
      this.assignment.lecturer_id = lecturerId;
    } else {
      this.errorMessage = 'Lecturer profile not found. Please log in again.';
    }
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
    this.totalWeight = this.rubricCriteria.reduce(
      (sum, c) => sum + (Number(c.weight) || 0),
      0,
    );
  }

  get rubricHasErrors(): boolean {
    const hasAny = this.rubricCriteria.some((c) => c.name.trim() || c.weight > 0);
    if (!hasAny) return false;
    if (this.totalWeight !== 100) return true;
    if (this.rubricCriteria.some((c) => !c.name.trim())) return true;
    return false;
  }

  get rubricIsValid(): boolean {
    const hasAny = this.rubricCriteria.some((c) => c.name.trim() || c.weight > 0);
    if (!hasAny) return false;
    return (
      this.totalWeight === 100 && this.rubricCriteria.every((c) => c.name.trim())
    );
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

  // Question File
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

  // Rubric File
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

  private setRubricFile(file: File): void {
    const error = this.validateFile(file);
    if (error) {
      this.errorMessage = error;
      return;
    }
    this.rubricFile = file;
    this.errorMessage = '';
  }

  removeRubricFile(event: Event): void {
    event.stopPropagation();
    this.rubricFile = null;
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

    if (this.rubricHasErrors) return false;
    return baseValid;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  Submit using Api Service (Clean & Recommended)
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

    try {
      // Step 1: Create assignment
      this.stepMessage = 'Creating assignment…';
      const created: any = await firstValueFrom(
        this.api.createAssignment(this.assignment)
      );
      const assignmentId = created.assignment_id;

      // Step 2: Upload question file (optional)
      if (this.questionFile) {
        this.stepMessage = 'Uploading question file…';
        await firstValueFrom(
          this.api.uploadQuestionFile(assignmentId, this.questionFile)
        );
      }

      // Step 3: Save rubric (if needed)
      const needsRubricRecord = this.rubricIsValid || !!this.rubricFile;
      if (needsRubricRecord) {
        this.stepMessage = 'Saving rubric…';
        const criteriaToSave = this.rubricIsValid
          ? this.rubricCriteria
          : [{ name: 'To be defined', weight: 100 }];

        await firstValueFrom(
          this.api.saveRubric(assignmentId, { criteria: criteriaToSave })
        );
      }

      // Step 4: Upload rubric reference file (optional)
      if (this.rubricFile) {
        this.stepMessage = 'Uploading rubric reference file…';
        await firstValueFrom(
          this.api.uploadRubricFile(assignmentId, this.rubricFile)
        );
      }

      // Success
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

      setTimeout(() => this.router.navigate(['/view-assignment']), 1500);

    } catch (error: any) {
      this.isLoading = false;
      this.stepMessage = '';
      console.error('Create Assignment Error:', error);

      if (error.status === 401) {
        this.router.navigate(['/login']);
      } else if (error.status === 403) {
        this.errorMessage = 'Permission denied. Please check your lecturer profile.';
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