import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemData } from './system-data';

describe('SystemData', () => {
  let component: SystemData;
  let fixture: ComponentFixture<SystemData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemData],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemData);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
