import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Api } from '../../../../services/api';

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
  showSuccess = false;

  private searchSubject = new Subject<string>();

  constructor(private api: Api, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

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

    this.api.deleteUser(userId).subscribe({
      next: () => {
        this.ngZone.run(() => {
          delete this.deleteLoading[userId];
          this.users = this.users.filter(u => u.user_id !== userId);
          this.total = Math.max(0, this.total - 1);
          this.showSuccess = true;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          delete this.deleteLoading[userId];
          this.error = 'Failed to delete user. Please try again.';
          this.cdr.detectChanges();
        });
        console.error(err);
      }
    });
  }

  closeSuccessPopup() {
    this.showSuccess = false;
    this.cdr.detectChanges();
  }

  goBack() {
    window.history.back();
  }
}