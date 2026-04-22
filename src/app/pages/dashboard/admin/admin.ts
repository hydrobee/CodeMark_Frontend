import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarAdmin } from '../../../reusable/components/sidebar-admin/sidebar-admin';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-admin',
  imports: [SidebarAdmin, CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {

  recentLogs: any[] = [];
  isLoadingLogs = false;

  constructor(
    private router: Router,
    private api: Api,
    private cdr: ChangeDetectorRef     // ← This is required
  ) {}

  ngOnInit(): void {
    this.loadRecentLogs();
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  loadRecentLogs(): void {
    this.isLoadingLogs = true;

    this.api.getSystemLogs({ 
      limit: 5, 
      offset: 0 
    }).subscribe({
      next: (res) => {
        this.recentLogs = res.logs || [];
        this.isLoadingLogs = false;
        this.cdr.detectChanges();           // ← Fix for NG0100
      },
      error: (err) => {
        console.error('Failed to load recent system logs:', err);
        this.recentLogs = [];
        this.isLoadingLogs = false;
        this.cdr.detectChanges();           // ← Fix for NG0100
      }
    });
  }

  // Helper methods
  getActionBadgeClass(action: string): string {
    if (!action) return 'badge-default';
    const upper = action.toUpperCase();
    if (upper.includes('DELETE')) return 'badge-danger';
    if (upper.includes('APPROVE') || upper.includes('APPROVED')) return 'badge-success';
    if (upper.includes('REJECT') || upper.includes('REJECTED')) return 'badge-warning';
    if (upper.includes('BACKUP') || upper.includes('UPDATE')) return 'badge-info';
    return 'badge-default';
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase() === 'success' ? 'status-success' : 'status-failure';
  }

  formatLogTime(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}