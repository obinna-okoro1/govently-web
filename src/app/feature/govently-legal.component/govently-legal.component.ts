import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-govently-legal.component',
  imports: [CommonModule],
  templateUrl: './govently-legal.component.html',
  styleUrl: './govently-legal.component.scss'
})
export class GoventlyLegalComponent {
  public activeTab: 'privacy' | 'terms' = 'privacy';
}
