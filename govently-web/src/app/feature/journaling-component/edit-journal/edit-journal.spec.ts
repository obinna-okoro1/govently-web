import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditJournal } from './edit-journal';

describe('EditJournal', () => {
  let component: EditJournal;
  let fixture: ComponentFixture<EditJournal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditJournal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditJournal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
