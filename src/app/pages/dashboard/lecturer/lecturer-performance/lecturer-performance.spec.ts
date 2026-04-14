import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturerPerformance } from './lecturer-performance';

describe('LecturerPerformance', () => {
  let component: LecturerPerformance;
  let fixture: ComponentFixture<LecturerPerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecturerPerformance],
    }).compileComponents();

    fixture = TestBed.createComponent(LecturerPerformance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
