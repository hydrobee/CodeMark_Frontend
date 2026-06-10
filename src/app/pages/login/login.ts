import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  isLoginMode = true;

  // common
  email = '';
  password = '';
  confirmPassword = '';
  name = '';
  lastName = '';
  role = 'student';

  // student
  matricNo = '';

  // lecturer
  staffId = '';

  errorMsg = '';

  // ← put your admin email here
  private readonly ADMIN_EMAIL = 'systemcodemark@gmail.com';
  private readonly ADMIN_NAME = 'Steve Calvin ';

  constructor(
    private api: Api,
    private router: Router,
  ) {}

  switchTab(tab: 'signup' | 'signin') {
    this.isLoginMode = tab === 'signin';
    this.errorMsg = '';
  }

  onSignup() {
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match';
      return;
    }

    const data: any = {
      name: this.name + ' ' + this.lastName,
      email: this.email,
      password: this.password,
      role: this.role,
    };

    if (this.role === 'student') data.matric_no = this.matricNo;
    if (this.role === 'lecturer') data.staff_id = this.staffId;

    this.api.register(data).subscribe({
      next: () => {
        // ✅ Notify admin for every new signup
        this.api.notifyAdminNewUser(
          this.name + ' ' + this.lastName,
          this.role,
          this.ADMIN_EMAIL,
          this.ADMIN_NAME,
        );

        this.api.login(this.email, this.password).subscribe({
          next: (loginRes) => {
            localStorage.setItem('token', loginRes.access_token);
            localStorage.setItem('user', JSON.stringify(loginRes.user));
            if (this.role === 'lecturer') {
              this.router.navigate(['/lecturer-dashboard']);
            } else {
              this.router.navigate(['/student-dashboard']);
            }
          },
          error: () => {
            alert('Account created! Please sign in.');
            this.switchTab('signin');
          },
        });
      },
      error: (err) => {
        if (err.status === 400 && err.error?.detail === 'Email already registered') {
          alert('This email is already registered. Please login instead.');
        } else {
          this.errorMsg = err.error?.detail || 'Signup failed';
        }
      },
    });
  }

  togglePw(input: HTMLInputElement) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  onLogin() {
    this.api.login(this.email, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));

        const role = res.user.role;
        if (role === 'student') {
          this.router.navigate(['/student-dashboard']);
        } else if (role === 'lecturer') {
          this.router.navigate(['/lecturer-dashboard']);
        } else if (role === 'administrator') {
          this.router.navigate(['/admin']);
        } else {
          this.errorMsg = 'Unknown role. Please contact support.';
        }
      },
      error: (err) => (this.errorMsg = err.error?.detail || 'Login failed'),
    });
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (this.isLoginMode) {
        this.onLogin();
      } else {
        this.onSignup();
      }
    }
  }
}
