import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from '../../shared/back-button-component/back-button-component';
import { v4 as uuidv4 } from 'uuid';
import { AiChatService } from './ai-chat.service';
import { AuthService, UserProfile } from '../../core/auth/auth-service';
import { throwError } from 'rxjs/internal/observable/throwError';
import { filter, Observable, of, switchMap } from 'rxjs';

interface Companion {
  name: string;
  value: string;
  emoji: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat-component',
  imports: [CommonModule, FormsModule, BackButtonComponent],
  providers: [AiChatService],
  templateUrl: './ai-chat-component.html',
  styleUrl: './ai-chat-component.scss'
})
export class AiChatComponent {
  @ViewChild('chatBody') chatBody!: ElementRef;

  currentUser$: Observable<UserProfile | null>;

  companions: Companion[] = [
    { name: 'Tired Therapist', value: 'tired_therapist', emoji: '😌' },
    { name: 'Empathetic Friend', value: 'empathetic_friend', emoji: '💜' },
    { name: 'Chill Listener', value: 'chill_listener', emoji: '🎧' }
  ];

  activeCompanion = this.companions[0];
  messages: { sender: 'user' | 'ai', text: string }[] = [];
  userMessage = '';
  isTyping = false;

  constructor(
    private aiChatService: AiChatService,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.getUserProfile();
    this.greetUser();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  selectCompanion(c: any) {
    this.activeCompanion = c;
    this.messages = [];
    this.greetUser();
  }

  greetUser() {
    this.messages.push({
      sender: 'ai',
      text: `${this.activeCompanion.emoji} ${this.activeCompanion.name} — Joined the chat!`
    });
  }

 sendMessage(): void {
  if (!this.userMessage.trim()) return;

  this.currentUser$.pipe(
    switchMap((profile) => {
      if (!profile) {
        return throwError(() => new Error('User profile not found.'));
      }

      const gender = profile.gender;
      const session_id = uuidv4(); // Generate a unique session ID
      const sentMessage = this.userMessage;

      // Push user message to chat UI
      this.messages.push({ sender: 'user', text: sentMessage });
      this.userMessage = '';
      this.isTyping = true;

      // Call AI chat service
      return this.aiChatService.sendMessage({
        session_id,
        content: sentMessage,
        assistant_type: this.activeCompanion.value,
        gender: gender,
        date: new Date().toLocaleString()
      });
    })
  ).subscribe({
    next: (res) => {
      
      this.messages.push({ sender: 'ai', text: res.reply });
      this.isTyping = false;
    },
    error: (err) => {
      console.error('AI Chat Error:', err);
      this.messages.push({
        sender: 'ai',
        text: 'Something went wrong. Please try again later.'
      });
      this.isTyping = false;
    }
  });
}

isBurning = false;

burnChat(): any {
  if (this.messages.length === 0) return;

  this.isBurning = true;

  this.currentUser$.pipe(
  filter((profile): profile is UserProfile => profile !== null),
  switchMap((profile) => {
    const result = this.aiChatService.clearChat(profile.userId);
    return result !== undefined ? result : of(null);
  })
).subscribe({
    next: () => {
      // Let the burn animation play before clearing the chat
      setTimeout(() => {
        this.messages = [];
        this.isBurning = false;
      }, 1200);
    },
    error: (err) => {
      console.error('Failed to burn chat:', err);
      this.isBurning = false;
    }
  });
}


  scrollToBottom() {
    if (this.chatBody) {
      this.chatBody.nativeElement.scrollTo({
        top: this.chatBody.nativeElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }
}
