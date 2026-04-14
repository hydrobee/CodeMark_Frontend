import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturerNotification } from './lecturer-notification';

describe('LecturerNotification', () => {
  let component: LecturerNotification;
  let fixture: ComponentFixture<LecturerNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecturerNotification],
    }).compileComponents();

    fixture = TestBed.createComponent(LecturerNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
