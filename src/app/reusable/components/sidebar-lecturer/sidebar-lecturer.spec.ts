import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarLecturer } from './sidebar-lecturer';

describe('SidebarLecturer', () => {
  let component: SidebarLecturer;
  let fixture: ComponentFixture<SidebarLecturer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarLecturer],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarLecturer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
