import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarAdmin } from "../../../../reusable/components/sidebar-admin/sidebar-admin";
import { Api } from '../../../../services/api';

@Component({
  selector: 'app-system-log',
  imports: [SidebarAdmin, CommonModule, FormsModule],
  templateUrl: './system-log.html',
  styleUrl: './system-log.css',
})
export class SystemLog implements OnInit {
  logs: any[] = [];
  total = 0;
  isLoading = false;
  error = '';

  // Filters
  filterAction = '';
  filterStatus = '';
  filterTargetType = '';
  fromDate = '';
  toDate = '';

  // Pagination
  limit = 20;
  offset = 0;

  readonly ACTION_OPTIONS = [
    { value: '', label: 'All Actions' },
    { value: 'UPDATE_LECTURER_STATUS', label: 'Update Lecturer Status' },
    { value: 'DELETE_USER', label: 'Delete User' },
    { value: 'BACKUP_SYSTEM', label: 'Backup System' },
  ];

  readonly STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'success', label: 'Success' },
    { value: 'failure', label: 'Failure' },
  ];

  readonly TARGET_OPTIONS = [
    { value: '', label: 'All Targets' },
    { value: 'lecturer', label: 'Lecturer' },
    { value: 'user', label: 'User' },
  ];

  constructor(
    private api: Api,
    private cdr: ChangeDetectorRef   // ← Added for change detection fix
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.error = '';

    const filters: any = {
      limit: this.limit,
      offset: this.offset,
    };

    if (this.filterAction)     filters.action = this.filterAction;
    if (this.filterStatus)     filters.status = this.filterStatus;
    if (this.filterTargetType) filters.target_type = this.filterTargetType;
    if (this.fromDate)         filters.from_date = new Date(this.fromDate).toISOString();
    if (this.toDate)           filters.to_date = new Date(this.toDate).toISOString();

    this.api.getSystemLogs(filters).subscribe({
      next: (res) => {
        this.logs = res.logs || [];
        this.total = res.total || 0;
        this.isLoading = false;
        
        // Fix: Force change detection after async update
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading logs:', err);
        this.error = 'Failed to load system logs. Please try again.';
        this.isLoading = false;
        
        // Fix: Force change detection after async update
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.offset = 0;
    this.loadLogs();
  }

  clearFilters(): void {
    this.filterAction = '';
    this.filterStatus = '';
    this.filterTargetType = '';
    this.fromDate = '';
    this.toDate = '';
    this.offset = 0;
    this.loadLogs();
  }

  nextPage(): void {
    if (this.offset + this.limit < this.total) {
      this.offset += this.limit;
      this.loadLogs();
    }
  }

  prevPage(): void {
    if (this.offset > 0) {
      this.offset = Math.max(0, this.offset - this.limit);
      this.loadLogs();
    }
  }

  get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-MY', {
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
    });
  }

  getActionBadgeClass(action: string): string {
    if (action?.includes('DELETE')) return 'badge-danger';
    if (action?.includes('APPROVE') || action?.includes('approved')) return 'badge-success';
    if (action?.includes('REJECT') || action?.includes('rejected')) return 'badge-warning';
    if (action?.includes('BACKUP')) return 'badge-info';
    return 'badge-default';
  }

  getStatusClass(status: string): string {
    return status === 'success' ? 'status-success' : 'status-failure';
  }
}