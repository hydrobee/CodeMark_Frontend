import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Api } from '../../../../services/api';

interface RubricCriterion {
  name: string;
  weight: number;
}

@Component({
  selector: 'app-edit-assignment-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-assignment-form.html',
  styleUrl: './edit-assignment-form.css',
})
export class EditAssignmentForm implements OnInit {
  assignmentId: number | null = null;

  assignment = {
    lecturer_id: 0,
    course_name: '',
    title: '',
    description: '',
    deadline: '',
  };

  // Question file
  questionFile: File | null = null;
  existingQuestionFileName: string | null = null;

  // Rubric criteria
  rubricCriteria: RubricCriterion[] = [{ name: '', weight: 0 }];
  totalWeight = 0;

  // Rubric reference file
  rubricFile: File | null = null;
  existingRubricFileName: string | null = null;

  // UI state
  isLoading = false;
  isFetching = true;
  fetchError: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  stepMessage: string | null = null;

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
      this.isFetching = false;
      return;
    }

    // Read the :id param directly from snapshot
    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('EditAssignmentForm: route id param =', idParam);

    if (!idParam || isNaN(+idParam)) {
      this.fetchError = 'Invalid assignment ID.';
      this.isFetching = false;
      this.cdr.detectChanges();
      return;
    }

    this.assignmentId = +idParam;
    this.ngZone.run(() => this.loadAssignment());
  }

  // ── Load existing assignment ──────────────────────────────────────────────

  loadAssignment(): void {
    this.isFetching = true;
    this.fetchError = null;
    this.cdr.detectChanges();

    // Step 1: core assignment fields — controls isFetching
    this.api.getAssignment(this.assignmentId!).subscribe({
      next: (data: any) => {
        console.log('Assignment loaded:', data);

        this.assignment.lecturer_id = data.lecturer_id;
        this.assignment.course_name = data.course_name;
        this.assignment.title = data.title;
        this.assignment.description = data.description;

        // Convert ISO datetime → datetime-local input format (YYYY-MM-DDTHH:mm)
        if (data.deadline) {
          const dt = new Date(data.deadline);
          const pad = (n: number) => String(n).padStart(2, '0');
          this.assignment.deadline =
            `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}` +
            `T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
        }

        this.existingQuestionFileName = data.question_file_name ?? null;
        this.existingRubricFileName = data.rubric_file_name ?? null;

        // Form is ready — stop showing the spinner
        this.isFetching = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load assignment:', err);
        this.fetchError =
          err?.error?.detail ?? 'Failed to load assignment details. Please go back and try again.';
        this.isFetching = false;
        this.cdr.detectChanges();
      },
    });

    // Step 2: rubric (independent — 404 is fine, just keep the empty default row)
    this.api.getRubric(this.assignmentId!).subscribe({
      next: (rubric: any) => {
        console.log('Rubric loaded:', rubric);
        if (rubric?.criteria?.length) {
          this.rubricCriteria = rubric.criteria.map((c: any) => ({
            name: c.name,
            weight: c.weight,
          }));
          this.onWeightChange();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        // 404 = no rubric yet — non-fatal, start with a blank row
        console.log('No rubric yet (status ' + err?.status + '), starting blank.');
      },
    });
  }

  // ── Rubric helpers ────────────────────────────────────────────────────────

  addCriterion(): void {
    this.rubricCriteria.push({ name: '', weight: 0 });
  }

  removeCriterion(index: number): void {
    if (this.rubricCriteria.length > 1) {
      this.rubricCriteria.splice(index, 1);
      this.onWeightChange();
    }
  }

  onWeightChange(): void {
    this.totalWeight = this.rubricCriteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  }

  // ── File helpers ──────────────────────────────────────────────────────────

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDropQuestion(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.setQuestionFile(file);
  }

  onDropRubric(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.setRubricFile(file);
  }

  onQuestionFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.setQuestionFile(input.files[0]);
  }

  onRubricFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.setRubricFile(input.files[0]);
  }

  private setQuestionFile(file: File): void {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type)) {
      this.errorMessage = 'Only PDF and DOCX files are allowed for the question file.';
      return;
    }
    this.questionFile = file;
    this.existingQuestionFileName = null;
    this.errorMessage = null;
  }

  private setRubricFile(file: File): void {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type)) {
      this.errorMessage = 'Only PDF and DOCX files are allowed for the rubric file.';
      return;
    }
    this.rubricFile = file;
    this.existingRubricFileName = null;
    this.errorMessage = null;
  }

  removeQuestionFile(event: Event): void {
    event.stopPropagation();
    this.questionFile = null;
  }

  removeRubricFile(event: Event): void {
    event.stopPropagation();
    this.rubricFile = null;
  }

  getFileIcon(file: File): string {
    return file.type === 'application/pdf' ? '📄' : '📝';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ── Validation ────────────────────────────────────────────────────────────

  isFormValid(): boolean {
    const base =
      this.assignment.course_name.trim() !== '' &&
      this.assignment.title.trim() !== '' &&
      this.assignment.description.trim() !== '' &&
      this.assignment.deadline !== '';

    const filledCriteria = this.rubricCriteria.filter((c) => c.name.trim() !== '');
    const rubricOk = filledCriteria.length === 0 || this.totalWeight === 100;

    return base && rubricOk;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (!this.isFormValid() || !this.assignmentId) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.stepMessage = 'Updating assignment details...';
    this.cdr.detectChanges();

    const payload = {
      lecturer_id: this.assignment.lecturer_id,
      course_name: this.assignment.course_name,
      title: this.assignment.title,
      description: this.assignment.description,
      deadline: new Date(this.assignment.deadline).toISOString(),
    };

    this.api.updateAssignment(this.assignmentId, payload).subscribe({
      next: () => {
        const steps: Promise<void>[] = [];

        if (this.questionFile) {
          steps.push(
            new Promise((resolve, reject) => {
              this.stepMessage = 'Uploading question file...';
              this.cdr.detectChanges();
              this.api.uploadQuestionFile(this.assignmentId!, this.questionFile!).subscribe({
                next: () => resolve(),
                error: (e) => reject(e),
              });
            }),
          );
        }

        const filledCriteria = this.rubricCriteria.filter((c) => c.name.trim() !== '');
        if (filledCriteria.length > 0 && this.totalWeight === 100) {
          steps.push(
            new Promise((resolve, reject) => {
              this.stepMessage = 'Saving rubric criteria...';
              this.cdr.detectChanges();
              this.api.saveRubric(this.assignmentId!, { criteria: filledCriteria }).subscribe({
                next: () => resolve(),
                error: (e) => reject(e),
              });
            }),
          );
        }

        if (this.rubricFile) {
          steps.push(
            new Promise((resolve, reject) => {
              this.stepMessage = 'Uploading rubric file...';
              this.cdr.detectChanges();
              this.api.uploadRubricFile(this.assignmentId!, this.rubricFile!).subscribe({
                next: () => resolve(),
                error: (e) => reject(e),
              });
            }),
          );
        }

        Promise.all(steps)
          .then(() => {
            this.stepMessage = null;
            this.isLoading = false;
            this.successMessage = 'Assignment updated successfully!';
            this.cdr.detectChanges();
            setTimeout(() => this.router.navigate(['/edit-assignment']), 1500);
          })
          .catch((err) => {
            console.error('Upload/rubric step failed:', err);
            this.stepMessage = null;
            this.isLoading = false;
            this.errorMessage = err?.error?.detail ?? 'Assignment saved but some uploads failed.';
            this.cdr.detectChanges();
          });
      },
      error: (err) => {
        console.error('Update assignment failed:', err);
        this.stepMessage = null;
        this.isLoading = false;
        this.errorMessage = err?.error?.detail ?? 'Failed to update assignment.';
        this.cdr.detectChanges();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/edit-assignment']);
  }

  goBack(): void {
    this.router.navigate(['/edit-assignment']);
  }
}