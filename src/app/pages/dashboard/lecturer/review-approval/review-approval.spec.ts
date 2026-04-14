import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewApproval } from './review-approval';

describe('ReviewApproval', () => {
  let component: ReviewApproval;
  let fixture: ComponentFixture<ReviewApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewApproval],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewApproval);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
