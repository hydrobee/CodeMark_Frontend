import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { SidebarLecturer } from '../../../../reusable/components/sidebar-lecturer/sidebar-lecturer';
import { Api } from '../../../../services/api';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assignment-management',
  imports: [SidebarLecturer, CommonModule],
  templateUrl: './assignment-management.html',
  styleUrl: './assignment-management.css',
})
export class AssignmentManagement {
  constructor(private router: Router) {}

  navigate(path: string): void {
    this.router.navigate([path]);
  }


}
