import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportLecturer } from './support-lecturer';

describe('SupportLecturer', () => {
  let component: SupportLecturer;
  let fixture: ComponentFixture<SupportLecturer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportLecturer],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportLecturer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
