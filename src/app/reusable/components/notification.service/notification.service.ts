import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this._notifications.asObservable();
  private nextId = 1;

  add(notif: Omit<AppNotification, 'id' | 'read' | 'timestamp'>): void {
    const current = this._notifications.value;
    // Avoid duplicate notifications
    const isDuplicate = current.some(
      (n) => n.title === notif.title && n.message === notif.message
    );
    if (isDuplicate) return;

    this._notifications.next([
      { ...notif, id: this.nextId++, read: false, timestamp: new Date() },
      ...current,
    ]);
  }

  markAllRead(): void {
    this._notifications.next(
      this._notifications.value.map((n) => ({ ...n, read: true }))
    );
  }

  getUnreadCount(): number {
    return this._notifications.value.filter((n) => !n.read).length;
  }

  clear(): void {
    this._notifications.next([]);
  }
}