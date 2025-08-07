import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import confetti from 'canvas-confetti';
import { JournalEntry, JournalingService } from '../journaling-component/journaling.service';
import { FormsModule } from '@angular/forms';
import { moods } from '../../shared/mood';
import { ConfettiService } from '../../shared/confetti-service';

@Component({
  selector: 'app-edit-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-journal.html',
  styleUrl: './edit-journal.scss'
})
export class EditJournal {
 @Input() entry!: JournalEntry;

  moods = moods;

  updatedEntry: Partial<JournalEntry> = {};

  @ViewChild('textareaRef') textareaRef!: ElementRef;

  constructor(
    private journalingService: JournalingService,
    public modal: NgbActiveModal,
    private confettiService: ConfettiService
  ) {}

  ngOnInit(): void {
    this.updatedEntry = { ...this.entry };
  }

  ngAfterViewInit() {
    setTimeout(() => this.textareaRef?.nativeElement?.focus(), 100);
  }

  save() {
    const entryText = this.updatedEntry.entry;
    if (!entryText) return;

    this.journalingService.updateEntry(this.entry.id, this.updatedEntry).subscribe(() => {
      this.confettiService.launchConfetti();
      setTimeout(() => this.modal.close(true), 800);
    });
  }

  cancel() {
    this.modal.dismiss();
  }
}
