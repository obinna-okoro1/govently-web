import { CommonModule, Location } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-back-button-component',
  imports: [CommonModule],
  templateUrl: './back-button-component.html',
  styleUrl: './back-button-component.scss'
})
export class BackButtonComponent {
  @Input() color: string = '#4CA6A8';
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
