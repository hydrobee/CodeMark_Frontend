import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveLecturer } from './approve-lecturer';

describe('ApproveLecturer', () => {
  let component: ApproveLecturer;
  let fixture: ComponentFixture<ApproveLecturer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveLecturer],
    }).compileComponents();

    fixture = TestBed.createComponent(ApproveLecturer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
