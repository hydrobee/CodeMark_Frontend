import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
//import { NotificationService, AppNotification } from '../notification.service/notification.service';
import { NotificationService, AppNotification } from '../../../../../reusable/components/notification.service/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  notifications: AppNotification[] = [];

  constructor(
    private notifService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.notifService.notifications$.subscribe((notifs) => {
      this.notifications = notifs;
    });
  }

  markAllRead(): void {
    this.notifService.markAllRead();
  }

  navigate(n: AppNotification): void {
    if (n.link) this.router.navigate([n.link]);
  }

  goBack(): void {
    window.history.back();
  }
}