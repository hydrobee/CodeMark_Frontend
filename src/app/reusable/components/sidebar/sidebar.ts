import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  @Input() role: string = '';

  activeRoute: string = '/student';

  constructor(private router: Router) {
    this.activeRoute = this.router.url;   // Set initial active route
  }

  navigate(path: string) {
    this.activeRoute = path;        // Update active highlight
    this.router.navigate([path]);         // Navigate to route
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}