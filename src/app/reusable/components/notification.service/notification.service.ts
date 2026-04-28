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
  userId: string; // ← add this
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this._notifications.asObservable();
  private nextId = 1;

  private getCurrentUserId(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.user_id?.toString() || 'unknown';
  }

  add(notif: Omit<AppNotification, 'id' | 'read' | 'timestamp' | 'userId'>): void {
    const current = this._notifications.value;
    const userId = this.getCurrentUserId();

    const isDuplicate = current.some(
      (n) => n.title === notif.title && n.message === notif.message && n.userId === userId
    );
    if (isDuplicate) return;

    this._notifications.next([
      { ...notif, id: this.nextId++, read: false, timestamp: new Date(), userId },
      ...current,
    ]);
  }

  // ← returns only current user's notifications
  getForCurrentUser(): AppNotification[] {
    const userId = this.getCurrentUserId();
    return this._notifications.value.filter((n) => n.userId === userId);
  }

  markAllRead(): void {
    const userId = this.getCurrentUserId();
    this._notifications.next(
      this._notifications.value.map((n) =>
        n.userId === userId ? { ...n, read: true } : n
      )
    );
  }

  getUnreadCount(): number {
    const userId = this.getCurrentUserId();
    return this._notifications.value.filter(
      (n) => n.userId === userId && !n.read
    ).length;
  }

  clear(): void {
    this._notifications.next([]);
  }
}