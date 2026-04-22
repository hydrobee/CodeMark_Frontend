import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNotification } from './admin-notification';

describe('AdminNotification', () => {
  let component: AdminNotification;
  let fixture: ComponentFixture<AdminNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNotification],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
