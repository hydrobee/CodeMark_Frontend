import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-delete-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-user.html',
  styleUrl: './delete-user.css',
})
export class DeleteUser implements OnInit {
  users: any[] = [];
  total = 0;
  limit = 20;
  offset = 0;
  search = '';
  roleFilter = '';

  loading = false;
  error = '';
  deleteLoading: { [key: number]: boolean } = {};

  confirmUser: any = null;
  showSuccess = false;  // ← added

  private searchSubject = new Subject<string>();

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

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

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    let url = `http://localhost:8000/admin/users?limit=${this.limit}&offset=${this.offset}`;

    if (this.search.trim()) {
      url += `&search=${encodeURIComponent(this.search.trim())}`;
    }
    if (this.roleFilter) {
      url += `&role=${this.roleFilter}`;
    }

    this.http.get<any>(url, { headers: this.getHeaders() }).subscribe({
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

  onSearchInput() {
    this.searchSubject.next(this.search);
  }

  onSearch() {
    this.offset = 0;
    this.loadUsers();
  }

  changePage(newOffset: number) {
    this.offset = newOffset;
    this.loadUsers();
  }

  getEndIndex(): number {
    return Math.min(this.offset + this.limit, this.total);
  }

  openConfirm(user: any) {
    this.confirmUser = user;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.confirmUser = null;
    this.cdr.detectChanges();
  }

  confirmDelete() {
  if (!this.confirmUser) return;

  const userId = this.confirmUser.user_id;
  this.deleteLoading[userId] = true;
  this.confirmUser = null;

  this.http.delete<any>(
    `http://localhost:8000/admin/user/${userId}`,
    { headers: this.getHeaders() }
  ).subscribe({
    next: () => {
      this.ngZone.run(() => {
        delete this.deleteLoading[userId];
        this.users = this.users.filter(u => u.user_id !== userId);
        this.total = Math.max(0, this.total - 1);
        this.showSuccess = true;
        this.cdr.detectChanges();
      });
    },
    error: (err) => {
      this.ngZone.run(() => {
        delete this.deleteLoading[userId];
        this.error = 'Failed to delete user. Please try again.';
      });
      console.error(err);
    }
  });
}

  closeSuccessPopup() {  // ← added
    this.showSuccess = false;
    this.cdr.detectChanges();
  }

  goBack() {
    window.history.back();
  }
}