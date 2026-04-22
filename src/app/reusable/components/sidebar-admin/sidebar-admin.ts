import { Component, Input, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar-admin',
  imports: [CommonModule],
  templateUrl: './sidebar-admin.html',
  styleUrl: './sidebar-admin.css',
})
export class SidebarAdmin implements OnInit {
  @Input() role: string = '';

  activeRoute: string = '/admin';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Set initial active route
    this.activeRoute = this.router.url;

    // Update active route on navigation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activeRoute = event.url;
      });
  }

  navigate(path: string) {
    this.activeRoute = path;
    this.router.navigate([path]);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
