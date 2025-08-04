import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-journaling-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './journaling-component.html',
  styleUrl: './journaling-component.scss'
})
export class JournalingComponent implements OnInit {
greeting = '';
  prompt = "What's one thing you’re grateful for today?";
  entry = '';
  mood = '';
  pastReflections: any[] = []

  moods = [
    { emoji: '😊', label: 'Happy', color: '#FFD166' },
    { emoji: '😌', label: 'Calm', color: '#06D6A0' },
    { emoji: '😢', label: 'Sad', color: '#118AB2' },
    { emoji: '😤', label: 'Frustrated', color: '#EF476F' }
  ];

  burning = false;

  ngOnInit(): void {
    this.setGreeting();
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 18) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  saveEntry() {
    if (this.entry.trim()) {
      console.log({
        mood: this.mood,
        text: this.entry,
        date: new Date()
      });
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
      this.entry = '';
      this.mood = '';
    }
  }

  burnEntry() {
    if (this.entry.trim()) {
      this.burning = true;
      setTimeout(() => {
        this.entry = '';
        this.mood = '';
        this.burning = false;
      }, 800);
    }
  }
}


