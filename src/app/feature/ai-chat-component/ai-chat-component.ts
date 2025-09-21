import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, AfterViewChecked, HostListener } from '@angular/core';
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
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  providers: [AiChatService],
  templateUrl: './ai-chat-component.html',
  styleUrls: ['./ai-chat-component.scss']
})
export class AiChatComponent implements AfterViewInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatBody') chatBody!: ElementRef;

  // Host element reference will be used to set CSS variable for dynamic height
  constructor(
    private aiChatService: AiChatService,
    private authService: AuthService,
    private modalService: ModalService,
    private host: ElementRef
  ) {
    this.currentUser$ = this.authService.getUserProfile();
    this.greetUser();
  }

  public currentUser$: Observable<UserProfile | null>;

  public companions: Companion[] = [
    { name: 'Tired Therapist', value: 'tired_therapist', emoji: '😌' },
    { name: 'Empathetic Friend', value: 'empathetic_friend', emoji: '💜' },
    { name: 'Chill Listener', value: 'chill_listener', emoji: '🎧' }
  ];

  public activeCompanion = this.companions[0];
  public messages: { sender: 'user' | 'ai', text: string }[] = [];
  public userMessage = '';
  public isTyping = false;
  public isBurning = false;

  // single merged constructor above already initializes services and host

  // Resize handler bound to class so we can remove it later
  private resizeHandler = () => this.updateWrapperHeight();
  public wrapperHeight: number = window.innerHeight;

  public ngAfterViewInit() {
    // Ensure height is set after view renders
    this.updateWrapperHeight();
    window.addEventListener('resize', this.resizeHandler);
  }

  public ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
  }

  /**
   * Compute available vertical space for the component wrapper and set
   * the CSS variable `--ai-wrapper-height` on the host element.
   */
  public updateWrapperHeight() {
    try {
      const hostEl = (this.host && this.host.nativeElement) ? this.host.nativeElement as HTMLElement : document.documentElement;
      const hostRect = hostEl.getBoundingClientRect();
      const footerEl = document.querySelector('.govently-footer') as HTMLElement | null;
      const footerHeight = footerEl ? footerEl.getBoundingClientRect().height : 0;

      // available space is viewport height minus host top offset and footer height
      const available = Math.max(window.innerHeight - hostRect.top - footerHeight, 200);
      hostEl.style.setProperty('--ai-wrapper-height', `${Math.round(available)}px`);
      // also set wrapperHeight for template binding (px)
      this.wrapperHeight = Math.round(available);
    } catch (e) {
      // silent fallback if calculation fails
      // host will then use CSS fallback var (--ai-wrapper-height, 100vh)
      console.warn('Failed to update AI wrapper height', e);
    }
  }

  @HostListener('window:resize', [])
  public onWindowResize() {
    this.updateWrapperHeight();
  }

  public ngAfterViewChecked() {
    this.scrollToBottom();
  }

  public selectCompanion(c: any) {
    this.activeCompanion = c;
    this.messages = [];
    this.greetUser();
  }

  public greetUser() {
    this.messages.push({
      sender: 'ai',
      text: `${this.activeCompanion.emoji} ${this.activeCompanion.name} — Joined the chat!`
    });
  }

  public sendMessage(): void {
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

  public burnChat(): any {
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


  public scrollToBottom() {
    if (this.chatBody) {
      this.chatBody.nativeElement.scrollTo({
        top: this.chatBody.nativeElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }
}
