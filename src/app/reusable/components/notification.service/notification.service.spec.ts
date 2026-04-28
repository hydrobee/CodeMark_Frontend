import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let component: NotificationService;
  let fixture: ComponentFixture<NotificationService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationService],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
