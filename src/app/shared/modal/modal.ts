import { AfterViewInit, Component, ComponentRef, Input, OnDestroy, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class Modal implements AfterViewInit, OnDestroy {
  @Input() 
  public title = '';

  @Input() 
  public contentComponent!: Type<unknown>;

  @Input() 
  public inputs?: Record<string, any>;

  @ViewChild('dynamicContent', { read: ViewContainerRef, static: true })
  dynamicContent!: ViewContainerRef;

  constructor(public activeModal: NgbActiveModal) {}

  public ngAfterViewInit() {
    if (this.contentComponent) {
      const compRef = this.dynamicContent.createComponent(this.contentComponent);
      if (this.inputs) {
        Object.assign(compRef.instance as object, this.inputs);
      }
    }
  }

  public ngOnDestroy() {
    this.dynamicContent.clear();
  }
}

/**
 * usage example:
 *   constructor(private modalService: SharedModalService) {}

  openProfile() {
    this.modalService.open(UserProfileComponent, 'User Profile', {
      name: 'Jane Doe',
      gender: 'Female',
      age: 28,
      city: 'Paris',
      country: 'France'
    });
  }
}
*/
