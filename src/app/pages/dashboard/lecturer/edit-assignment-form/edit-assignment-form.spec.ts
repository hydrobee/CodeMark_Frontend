import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAssignmentForm } from './edit-assignment-form';

describe('EditAssignmentForm', () => {
  let component: EditAssignmentForm;
  let fixture: ComponentFixture<EditAssignmentForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAssignmentForm],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAssignmentForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
