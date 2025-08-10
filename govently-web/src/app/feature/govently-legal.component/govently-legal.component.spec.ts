import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoventlyLegalComponent } from './govently-legal.component';

describe('GoventlyLegalComponent', () => {
  let component: GoventlyLegalComponent;
  let fixture: ComponentFixture<GoventlyLegalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoventlyLegalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoventlyLegalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
