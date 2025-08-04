import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalingComponent } from './journaling-component';

describe('JournalingComponent', () => {
  let component: JournalingComponent;
  let fixture: ComponentFixture<JournalingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
