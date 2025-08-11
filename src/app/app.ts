import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as AOS from 'aos';
import { NavComponent } from './core/nav/nav';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  protected readonly title = signal('govently-web');

  ngOnInit() {
    AOS.init({
      duration: 800, // animation duration in ms
      easing: 'ease-in-out',
      once: true     // whether animation should happen only once
    });
  }
}
