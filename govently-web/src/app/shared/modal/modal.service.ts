// shared-modal.service.ts
import { Injectable, Type, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Modal } from './modal';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalService = inject(NgbModal);

  open(contentComponent: Type<unknown>, title: string, inputs?: Record<string, any>) {
    const modalRef = this.modalService.open(Modal, {
      size: 'lg',
      backdrop: 'static',
      centered: true
    });

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.contentComponent = contentComponent;
    modalRef.componentInstance.inputs = inputs;

    return modalRef;
  }
}
