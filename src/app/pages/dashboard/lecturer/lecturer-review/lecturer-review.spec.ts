import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturerReview } from './lecturer-review';

describe('LecturerReview', () => {
  let component: LecturerReview;
  let fixture: ComponentFixture<LecturerReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecturerReview],
    }).compileComponents();

    fixture = TestBed.createComponent(LecturerReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
