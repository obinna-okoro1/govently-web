import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TherapistSignupComponent } from './therapist-signup.component';

describe('TherapistSignupComponent', () => {
  let component: TherapistSignupComponent;
  let fixture: ComponentFixture<TherapistSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TherapistSignupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TherapistSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
