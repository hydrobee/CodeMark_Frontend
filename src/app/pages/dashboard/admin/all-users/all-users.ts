import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Api } from '../../../../services/api';

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-users.html',
  styleUrl: './all-users.css',
})
export class AllUsers implements OnInit {
  users: any[] = [];
  total = 0;
  limit = 20;
  offset = 0;
  search = '';
  roleFilter = '';

  loading = false;
  error = '';

  private searchSubject = new Subject<string>();

  constructor(private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.offset = 0;
      this.loadUsers();
    });

    this.loadUsers();
  }

  onSearchInput() {
    this.searchSubject.next(this.search);
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.api.getAdminUsers({
      limit: this.limit,
      offset: this.offset,
      search: this.search.trim() || undefined,
      role: this.roleFilter || undefined,
    }).subscribe({
      next: (response: any) => {
        this.users = response.users || [];
        this.total = response.total || 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  onSearch() {
    this.offset = 0;
    this.loadUsers();
  }

  changePage(newOffset: number) {
    this.offset = newOffset;
    this.loadUsers();
  }

  goBack(): void {
    window.history.back();
  }

  getEndIndex(): number {
    return Math.min(this.offset + this.limit, this.total);
  }
}