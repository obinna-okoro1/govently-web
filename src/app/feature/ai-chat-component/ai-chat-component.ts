import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from '../../shared/back-button-component/back-button-component';
import { v4 as uuidv4 } from 'uuid';
import { AiChatService } from './ai-chat.service';
import { AuthService, UserProfile } from '../../core/auth/auth-service';
import { throwError } from 'rxjs/internal/observable/throwError';
import { EMPTY, filter, Observable, of, switchMap } from 'rxjs';
import { Session } from '@supabase/supabase-js';
import { Signup } from '../signup/signup';
import { ModalService } from '../../shared/modal/modal.service';

interface Companion {
  name: string;
  value: string;
  emoji: string;
}

@Component({
  selector: 'app-ai-chat-component',
  imports: [CommonModule, FormsModule, BackButtonComponent],
  providers: [AiChatService,],
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
  isBurning = false;

  constructor(
    private aiChatService: AiChatService,
    private authService: AuthService,
    private modalService: ModalService
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

  // Store message immediately for responsive UI
  const sentMessage = this.userMessage;
  this.messages.push({ sender: 'user', text: sentMessage });
  this.userMessage = '';
  this.isTyping = true;

  this.authService.getSession().pipe(
    switchMap((session) => {
      if (!session?.access_token) {
        setTimeout(() => {
          this.messages.push({ sender: 'ai', text: 'To help you better, please sign up to continue.' });
          this.isTyping = false;
        }, 500);

        setTimeout(() => {
          this.modalService.open(Signup, 'Please sign up to continue', {});
        }, 3000);

        return EMPTY;
      }
      return of(session);
    }),
    filter((session): session is Session => !!session?.access_token),
    switchMap(session => {
      
      // Use the session token as the session ID
      const session_id = session.access_token; 
      
      return this.currentUser$.pipe(
        switchMap(profile => {
          if (!profile) {
            this.modalService.open(Signup, 'Sign Up', {});
            return throwError(() => new Error('User profile not found'));
          }

          return this.aiChatService.sendMessage({
            session_id, // Using session token as ID
            content: sentMessage,
            assistant_type: this.activeCompanion.value,
            gender: profile.gender,
            date: new Date().toISOString() // Using ISO string for consistency
          });
        })
      );
    })
  ).subscribe({
    next: (res) => {
      this.messages.push({ sender: 'ai', text: res.reply });
      this.isTyping = false;
      
      // Optional: Scroll to bottom of chat
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 50);
    },
    error: (err) => {
      console.error('AI Chat Error:', err);
      this.messages.push({
        sender: 'ai',
        text: 'Sorry, I encountered an error. Please try again.'
      });
      this.isTyping = false;
    }
  });
}

burnChat(): any {
  if (this.messages.length === 0) return;

  this.currentUser$.pipe(
    switchMap((profile) => {
      if (!profile) {
        this.messages = [];
        this.greetUser();
        return EMPTY;
      }
      this.isBurning = true;
      return of(profile);
    }),
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
        this.greetUser();
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
