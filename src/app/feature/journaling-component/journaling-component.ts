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
import { Signup } from '../signup/signup';
import { ConfirmationModal } from '../../shared/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-journaling-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BackButtonComponent],
  templateUrl: './journaling-component.html',
  styleUrl: './journaling-component.scss'
})
export class JournalingComponent implements OnInit {
  currentUser!: UserProfile | null;
  greeting = '';
  todayPrompt$: Observable<string>;
  entry = '';
  mood = '';
  pastReflections$!: Observable<JournalEntry[]>;
  moods = moods;
  burning = false;

  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private journalingService: JournalingService,
    private dailyPromptService: DailyPromptService,
    private confettiService: ConfettiService
  ) {
    this.todayPrompt$ = this.dailyPromptService.getPrompt().pipe(take(1));

    this.authService.getUserProfile().subscribe(profile => {
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
      setTimeout(() => {
        this.modalService.open(Signup, 'To save your reflection journal, please sign up.', {});
      }, 300);
      return;
    }

    if (!this.entry.trim()) {
      alert('Please write something in your journal before saving.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    // First: Check if there's already an entry for today
    this.journalingService.getEntriesByDate(this.currentUser.userId, today).subscribe(existingEntries => {
      if (existingEntries && existingEntries.length > 0) {
        const confirmEdit = confirm(
          "You already have a journal entry for today, so let's edit it instead.\n We will append your new entry to the existing one."
        );
        if (confirmEdit) {
          const entryToEdit = { ...existingEntries[0] };
          entryToEdit.entry = (entryToEdit.entry || '') + '\n\n' + this.entry.trim();
          
          if (this.mood) {
            entryToEdit.mood = this.mood;
          }

          this.editReflection(entryToEdit);
          this.entry = '';
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
    console.log('Viewing reflection:', entry);
  }

  burnReflection(entry: JournalEntry) {
    const modalRef = this.modalService.open(ConfirmationModal, 'Delete Reflection', {
      message: 'Are you sure you want to permanently delete this reflection? This action cannot be undone.'
    });

    modalRef.result.then((result) => {
      if (result === 'confirm') {
        this.journalingService.deleteEntry(entry.id).subscribe(() => {
          this.refreshEntries();
        });
      }
    }).catch(() => {
      // User dismissed modal - do nothing
    });
  }

  editReflection(entry: JournalEntry) {
    const modalRef = this.modalService.open(EditJournal, 'Edit Journal', {
      entry,
    });

    modalRef.result.then((changed) => {
      if (changed) this.refreshEntries();
    });
  }

  getPreview(text: string | null | undefined): string {
    if (!text) return 'No content';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  getMoodEmoji(mood: string | null | undefined): string {
    if (!mood) return '';
    const moodObj = this.moods.find(m => m.label === mood);
    return moodObj ? moodObj.emoji : '';
  }
}