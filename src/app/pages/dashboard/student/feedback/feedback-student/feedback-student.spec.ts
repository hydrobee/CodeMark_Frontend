import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackStudent } from './feedback-student';

describe('FeedbackStudent', () => {
  let component: FeedbackStudent;
  let fixture: ComponentFixture<FeedbackStudent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackStudent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackStudent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
