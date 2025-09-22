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
  description: string;
}

interface EmotionalContext {
  emoji: string;
  label: string;
  value: string;
  description: string;
}

@Component({
  selector: 'app-ai-chat-component',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  providers: [AiChatService],
  templateUrl: './ai-chat-component.html',
  styleUrls: ['./ai-chat-clean.scss']
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
    { 
      name: 'Gentle Therapist', 
      value: 'tired_therapist', 
      emoji: '😌',
      description: 'Calm, professional support with therapeutic techniques'
    },
    { 
      name: 'Caring Friend', 
      value: 'empathetic_friend', 
      emoji: '💜',
      description: 'Warm, understanding conversation like a close friend'
    },
    { 
      name: 'Mindful Listener', 
      value: 'chill_listener', 
      emoji: '🎧',
      description: 'Patient, non-judgmental space for you to process thoughts'
    }
  ];

  public activeCompanion = this.companions[0];
  public messages: { sender: 'user' | 'ai', text: string, timestamp?: Date }[] = [];
  public userMessage = '';
  public isTyping = false;
  public isBurning = false;

  // Enhanced engagement features
  public selectedContext = '';
  public quickStarters = [
    "I'm feeling overwhelmed today...",
    "I need someone to talk to",
    "Help me process my thoughts",
    "I'm having a tough time with...",
    "I'm grateful for... but also worried about..."
  ];

  public emotionalContexts: EmotionalContext[] = [
    { emoji: '😊', label: 'Good', value: 'positive', description: 'Feeling generally positive' },
    { emoji: '😐', label: 'Neutral', value: 'neutral', description: 'Feeling okay, neither good nor bad' },
    { emoji: '😔', label: 'Down', value: 'negative', description: 'Feeling sad or low' },
    { emoji: '😰', label: 'Anxious', value: 'anxious', description: 'Feeling worried or stressed' },
    { emoji: '😤', label: 'Frustrated', value: 'angry', description: 'Feeling irritated or angry' },
    { emoji: '😴', label: 'Tired', value: 'exhausted', description: 'Feeling drained or overwhelmed' }
  ];

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

  public greetUser(): void {
    this.messages.push({
      sender: 'ai',
      text: `${this.activeCompanion.emoji} Hi, I'm your ${this.activeCompanion.name}. I'm here to provide ${this.activeCompanion.description.toLowerCase()}. What's on your mind today?`,
      timestamp: new Date()
    });
  }

  public selectContext(context: EmotionalContext): void {
    this.selectedContext = this.selectedContext === context.value ? '' : context.value;
  }

  public useQuickStarter(starter: string): void {
    this.userMessage = starter;
    // Auto-focus the textarea after setting the message
    setTimeout(() => {
      const textarea = document.querySelector('.message-input') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        this.adjustTextareaHeight({ target: textarea });
      }
    }, 100);
  }

  public adjustTextareaHeight(event: any): void {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  public handleEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  public getMessageTime(index: number): string {
    const message = this.messages[index];
    if (!message.timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(message.timestamp);
    const diffMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  public markHelpful(messageIndex: number): void {
    // Visual feedback for helpful responses
    const messageElement = document.querySelectorAll('.chat-message')[messageIndex];
    messageElement?.classList.add('marked-helpful');
    
    // Could send analytics or feedback to service here
    console.log('Message marked as helpful:', messageIndex);
  }

  public askClarification(): void {
    this.userMessage = "Could you explain that a bit more? I'd like to understand better.";
    // Auto-send the clarification request
    setTimeout(() => this.sendMessage(), 100);
  }

  public sendMessage(): void {
    if (!this.userMessage.trim()) return;

    // Store message immediately for responsive UI
    const sentMessage = this.userMessage;
    this.messages.push({ 
      sender: 'user', 
      text: sentMessage,
      timestamp: new Date()
    });
    
    // Clear input and reset context
    this.userMessage = '';
    const currentContext = this.selectedContext;
    this.selectedContext = '';
    this.isTyping = true;

    // Reset textarea height
    const textarea = document.querySelector('.message-input') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
    }

    this.authService.getSession().pipe(
      switchMap((session) => {
        if (!session?.access_token) {
          setTimeout(() => {
            this.messages.push({ 
              sender: 'ai', 
              text: 'To provide you with personalized support, please sign up to continue our conversation.',
              timestamp: new Date()
            });
            this.isTyping = false;
          }, 1000);

          setTimeout(() => {
            this.modalService.open(Signup, 'Continue Your Support Journey', {});
          }, 3000);

          return EMPTY;
        }
        return of(session);
      }),
      filter((session): session is Session => !!session?.access_token),
      switchMap(session => {
        const session_id = session.access_token; 
        
        return this.currentUser$.pipe(
          switchMap(profile => {
            if (!profile) {
              this.modalService.open(Signup, 'Complete Your Profile', {});
              return throwError(() => new Error('User profile not found'));
            }

            // Enhanced message with emotional context
            const contextualMessage = currentContext ? 
              `[Feeling: ${currentContext}] ${sentMessage}` : 
              sentMessage;

            return this.aiChatService.sendMessage({
              session_id,
              content: contextualMessage,
              assistant_type: this.activeCompanion.value,
              gender: profile.gender,
              date: new Date().toISOString()
            });
          })
        );
      })
    ).subscribe({
      next: (res) => {
        this.messages.push({ 
          sender: 'ai', 
          text: res.reply,
          timestamp: new Date()
        });
        this.isTyping = false;
        
        // Smooth scroll to bottom
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('AI Chat Error:', err);
        this.messages.push({
          sender: 'ai',
          text: 'I apologize, but I encountered a technical issue. Please try sending your message again. Your thoughts are important to me.',
          timestamp: new Date()
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
