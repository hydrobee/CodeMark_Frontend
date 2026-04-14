import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAssignment } from './delete-assignment';

describe('DeleteAssignment', () => {
  let component: DeleteAssignment;
  let fixture: ComponentFixture<DeleteAssignment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAssignment],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteAssignment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
