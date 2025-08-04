import { Injectable, Type, inject } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Modal } from './modal';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalService = inject(NgbModal);
  private currentModalRef: NgbModalRef | null = null;

  open(contentComponent: Type<unknown>, title: string, inputs?: Record<string, any>) {
    // Close any existing modal before opening a new one
    if (this.currentModalRef) {
      this.currentModalRef.close();
    }

    const modalRef = this.modalService.open(Modal, {
      size: 'lg',
      backdrop: 'static',
      centered: true
    });

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.contentComponent = contentComponent;
    modalRef.componentInstance.inputs = inputs;

    // Keep track of the current modal
    this.currentModalRef = modalRef;

    // Cleanup reference when modal closes
    modalRef.result.finally(() => {
      if (this.currentModalRef === modalRef) {
        this.currentModalRef = null;
      }
    });

    return modalRef;
  }

  close(): void {
    if (this.currentModalRef) {
      this.currentModalRef.close();
      this.currentModalRef = null;
    }
  }
}
