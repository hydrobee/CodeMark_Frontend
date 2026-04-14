import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAssignment } from './create-assignment';

describe('CreateAssignment', () => {
  let component: CreateAssignment;
  let fixture: ComponentFixture<CreateAssignment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAssignment],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAssignment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
