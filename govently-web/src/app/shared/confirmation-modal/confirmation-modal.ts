import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-modal',
  imports: [CommonModule],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss'
})
export class ConfirmationModal implements OnInit {
  @Input() 
  inputs: any;

  message!: string;

  hideButton!: boolean;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.message = this.inputs?.message ?? 'Are you sure you want to perform this action?';
    this.hideButton = this.inputs?.hideButton ?? false;
  }

  confirm(): void {
    this.activeModal.close('confirm');
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}
