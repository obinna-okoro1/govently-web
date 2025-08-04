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
  title = '';

  @Input() 
  contentComponent!: Type<unknown>;

  @Input() 
  inputs?: Record<string, any>;

  @ViewChild('dynamicContent', { read: ViewContainerRef, static: true })
  dynamicContent!: ViewContainerRef;

  constructor(public activeModal: NgbActiveModal) {}

  ngAfterViewInit() {
    if (this.contentComponent) {
      const compRef = this.dynamicContent.createComponent(this.contentComponent);
      if (this.inputs) {
        Object.assign(compRef.instance as object, this.inputs);
      }
    }
  }

  ngOnDestroy() {
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
