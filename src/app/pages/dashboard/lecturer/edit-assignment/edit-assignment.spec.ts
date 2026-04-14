import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAssignment } from './edit-assignment';

describe('EditAssignment', () => {
  let component: EditAssignment;
  let fixture: ComponentFixture<EditAssignment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAssignment],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAssignment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
