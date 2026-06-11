import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-reset',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset.html',
  styleUrl: './reset.css',
})
export class Reset {
  email = '';
  newPassword = '';
  confirmPassword = '';
  error: string | null = null;
  success = false;
  isLoading = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(private api: Api, private router: Router) {}

  toggleNewPassword() { this.showNewPassword = !this.showNewPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  submit() {
    this.error = null;

    if (!this.email || !this.newPassword || !this.confirmPassword) {
      this.error = 'All fields are required.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading = true;
    this.api.resetPassword(this.email, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.detail ?? 'Reset failed. Please try again.';
      }
    });
  }
}