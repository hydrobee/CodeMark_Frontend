import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetCredential } from './reset-credential';

describe('ResetCredential', () => {
  let component: ResetCredential;
  let fixture: ComponentFixture<ResetCredential>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetCredential],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetCredential);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
