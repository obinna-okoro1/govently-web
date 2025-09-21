import { Component, OnInit, signal, ViewChild } from '@angular/core';
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
  
  @ViewChild(NavComponent) navComponent!: NavComponent;

  ngOnInit() {
    AOS.init({
      duration: 800, // animation duration in ms
      easing: 'ease-in-out',
      once: true     // whether animation should happen only once
    });
  }

  public toggleSidebar(): void {
    if (this.navComponent) {
      this.navComponent.toggleSidebar();
    }
  }

  // Add body class management for better mobile toggle visibility
  private updateBodyClass(): void {
    if (this.navComponent?.sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }
}
