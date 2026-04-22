import { Component } from '@angular/core';
import { SidebarAdmin } from '../../../../reusable/components/sidebar-admin/sidebar-admin';
import { CommonModule } from '@angular/common';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-manage-users',
  imports: [SidebarAdmin, CommonModule],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css',
})
export class ManageUsers {
  constructor(private router: Router) {}

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
