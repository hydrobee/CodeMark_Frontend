import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
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
  //groupNo = '';

  // lecturer
  staffId = '';

  errorMsg = '';

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

    if (this.role === 'student') {
      data.matric_no = this.matricNo;
      //data.group_no = this.groupNo;
    }

    if (this.role === 'lecturer') {
      data.staff_id = this.staffId;
    }

    this.api.register(data).subscribe({
      next: () => {
        alert('Signup successful! Please login.');
        this.switchTab('signin');
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
}
