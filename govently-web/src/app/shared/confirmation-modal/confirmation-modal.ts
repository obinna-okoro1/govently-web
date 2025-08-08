import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-modal',
  imports: [],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss'
})
export class ConfirmationModal {
  @Input() message: string = 'Are you sure you want to perform this action?';

  constructor(public activeModal: NgbActiveModal) {}

  confirm(): void {
    this.activeModal.close('confirm');
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}
