import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from '../../shared/back-button-component/back-button-component';
import { DailyPromptService } from '../../shared/daily-prompt.service';
import { Observable } from 'rxjs';
import { JournalEntry, JournalingService } from './journaling.service';
import { UserProfile } from '../../core/auth/auth-service';

@Component({
  selector: 'app-journaling-component',
  imports: [CommonModule, FormsModule, BackButtonComponent],
  templateUrl: './journaling-component.html',
  styleUrl: './journaling-component.scss'
})
export class JournalingComponent implements OnInit {
currentUser!: UserProfile; // Replace with actual user ID
greeting = '';
  todayPrompt$: Observable<string>;
  entry = '';
  mood = '';

  pastReflections$!: Observable<JournalEntry[]>;

  moods = [
    { emoji: '😊', label: 'Happy', color: '#FFD166' },
    { emoji: '😌', label: 'Calm', color: '#06D6A0' },
    { emoji: '😢', label: 'Sad', color: '#118AB2' },
    { emoji: '😤', label: 'Frustrated', color: '#EF476F' }
  ];

  burning = false;

  constructor(
    // private router: Router,
    // private modalService: ModalService,
    // private authService: AuthService,
    private journalingService: JournalingService,
    private dailyPromptService: DailyPromptService
  ) {
    this.todayPrompt$ = this.dailyPromptService.getPrompt();
  }

  ngOnInit(): void {
    this.setGreeting();
    this.pastReflections$ = this.journalingService.getEntries('currentUserId'); // Replace with actual user ID
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

  saveJournal(todayPrompt: string) {
    if (this.entry.trim()) {
      console.log({
        mood: this.mood,
        text: this.entry
      });
      this.journalingService.createEntry({
         user_id: 'currentUserId',
         prompt: todayPrompt,
        entry: this.entry,
        mood: this.mood,
        burn_after: false
      })
      .subscribe((data) => {
        if (data) {
          const confetti = document.createElement('div');
      confetti.className = 'confetti';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
      this.entry = '';
      this.mood = '';
        }
      });
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

  viewReflection(entry: JournalEntry) {
    // Navigate to reflection detail page or open modal
    console.log('Viewing reflection:', entry);
    // Example: this.router.navigate(['/reflection', entry.id]);
  }
}


