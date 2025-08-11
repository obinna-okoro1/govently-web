import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from '../../shared/back-button-component/back-button-component';
import { DailyPromptService } from '../../shared/daily-prompt.service';
import { Observable, take } from 'rxjs';
import { JournalEntry, JournalingService } from './journaling.service';
import { AuthService, UserProfile } from '../../core/auth/auth-service';
import { ModalService } from '../../shared/modal/modal.service';
import { EditJournal } from './edit-journal/edit-journal';
import { moods } from '../../shared/mood';
import { ConfettiService } from '../../shared/confetti-service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-journaling-component',
  imports: [CommonModule, FormsModule, RouterModule, BackButtonComponent],
  providers: [JournalingService],
  templateUrl: './journaling-component.html',
  styleUrl: './journaling-component.scss'
})
export class JournalingComponent implements OnInit {
currentUser!: UserProfile | null; // Replace with actual user ID
greeting = '';
  todayPrompt$: Observable<string>;
  entry = '';
  mood = '';

  pastReflections$!: Observable<JournalEntry[]>;

  moods = moods;

  burning = false;

  constructor(
    // private router: Router,
    private modalService: ModalService,
    private authService: AuthService,
    private journalingService: JournalingService,
    private dailyPromptService: DailyPromptService,
    private confettiService: ConfettiService
  ) {
    this.todayPrompt$ = this.dailyPromptService.getPrompt().pipe(take(1));

    this.authService.getUserProfile()
    .subscribe(profile => {
      this.currentUser = profile;

      this.refreshEntries();
    });
  }

  ngOnInit(): void {
    this.setGreeting();
  }

  refreshEntries() {
 if (this.currentUser) {
      this.pastReflections$ = this.journalingService.getEntries(this.currentUser.userId);
    }
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
  if (!this.currentUser) {
    console.error('No user profile available');
    return;
  }

  if (!this.entry.trim()) {
    alert('Please write something in your journal before saving.');
    return;
  }

  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // First: Check if there's already an entry for today
  this.journalingService.getEntriesByDate(this.currentUser.userId, today).subscribe(existingEntries => {
    if (existingEntries && existingEntries.length > 0) {
      const confirmEdit = confirm(
        "You already have a journal entry for today, so let's edit it instead.\n We will append your new entry to the existing one."
      );
      if (confirmEdit) {
  const entryToEdit = { ...existingEntries[0] };
  entryToEdit.entry = (entryToEdit.entry || '') + '\n\n' + this.entry.trim(); // append user input
  
  if (this.mood) {
    entryToEdit.mood = this.mood; // update mood if selected
  }

  this.editReflection(entryToEdit);
  this.entry = ''; // clear input after editing
  return;
}
    }

    // Otherwise, proceed to create new entry
    this.journalingService.createEntry({
      user_id: this.currentUser?.userId,
      prompt: todayPrompt,
      entry: this.entry,
      mood: this.mood,
      burn_after: false
    }).subscribe((data) => {
      if (data) {
        this.confettiService.launchConfetti();
        this.entry = '';
        this.mood = '';
        this.refreshEntries();
      }
    });
  });
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

  burnReflection(entry: JournalEntry) {
  // Show confirmation, then call service to delete
  if (confirm('Are you sure you want to burn this reflection?')) {
    this.journalingService.deleteEntry(entry.id).subscribe(() => {
      
      
      this.refreshEntries();
    });
  }
}

editReflection(entry: JournalEntry) {
   const modalRef = this.modalService.open(EditJournal, 'Edit Journal', {
    entry,
  });

  modalRef.result.then((changed) => {
    if (changed) this.refreshEntries();
  });
}
}


