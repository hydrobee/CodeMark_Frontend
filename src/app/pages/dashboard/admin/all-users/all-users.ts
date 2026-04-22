import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Wait 400ms after user stops typing before searching
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

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    let url = `http://localhost:8000/admin/users?limit=${this.limit}&offset=${this.offset}`;

    if (this.search.trim()) {
      url += `&search=${encodeURIComponent(this.search.trim())}`;
    }
    if (this.roleFilter) {
      url += `&role=${this.roleFilter}`;
    }

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        this.users = response.users || [];
        this.total = response.total || 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
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