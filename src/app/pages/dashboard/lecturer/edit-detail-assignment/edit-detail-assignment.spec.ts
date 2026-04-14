import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDetailAssignment } from './edit-detail-assignment';

describe('EditDetailAssignment', () => {
  let component: EditDetailAssignment;
  let fixture: ComponentFixture<EditDetailAssignment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDetailAssignment],
    }).compileComponents();

    fixture = TestBed.createComponent(EditDetailAssignment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
