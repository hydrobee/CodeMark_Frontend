import { Component, Input, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar implements OnInit {
  @Input() role: string = '';

  activeRoute: string = '/student';
  isMobileOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.activeRoute = this.router.url;

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activeRoute = event.url;
        // Auto-close drawer after navigation on mobile
        this.isMobileOpen = false;
      });
  }

  toggleSidebar(): void {
    this.isMobileOpen = !this.isMobileOpen;
  }

  closeSidebar(): void {
    this.isMobileOpen = false;
  }

  navigate(path: string): void {
    this.activeRoute = path;
    this.router.navigate([path]);
    this.isMobileOpen = false;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // Close on Escape key
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isMobileOpen = false;
  }
}