import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModel } from '@angular/forms';

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
  groupNo = '';

  // lecturer
  staffId = '';

  errorMsg = '';

  constructor(private api: Api, private router: Router) {}

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
      role: this.role
    };

    if (this.role === 'student') {
      data.matric_no = this.matricNo;
      data.group_no = this.groupNo;
    }

    if (this.role === 'lecturer') {
      data.staff_id = this.staffId;
    }

    this.api.register(data).subscribe({
      next: () => {
        alert('Signup successful! Please login.');
        this.switchTab('signin');
      },
      error: (err) => this.errorMsg = err.error?.detail || 'Signup failed'
    });
  }

  onLogin() {
    this.api.login(this.email, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));

        if (res.user.role === 'student') this.router.navigate(['/student']);
        else if (res.user.role === 'lecturer') this.router.navigate(['/lecturer']);
        else this.router.navigate(['/admin']);
      },
      error: (err) => this.errorMsg = err.error?.detail || 'Login failed'
    });
  }
  
}