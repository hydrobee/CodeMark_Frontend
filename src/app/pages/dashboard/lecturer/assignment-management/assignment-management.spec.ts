import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentManagement } from './assignment-management';

describe('AssignmentManagement', () => {
  let component: AssignmentManagement;
  let fixture: ComponentFixture<AssignmentManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
