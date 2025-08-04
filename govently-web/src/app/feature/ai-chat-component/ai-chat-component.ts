import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Companion {
  name: string;
  tagline: string;
  emoji: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat-component.html',
  styleUrl: './ai-chat-component.scss'
})
export class AiChatComponent {
  @ViewChild('chatBody') chatBody!: ElementRef;

  companions = [
    { name: 'Tired Therapist', emoji: '😌' },
    { name: 'Empathetic Friend', emoji: '💜' },
    { name: 'Chill Listener', emoji: '🎧' }
  ];

  activeCompanion = this.companions[0];
  messages: { sender: 'user' | 'ai', text: string }[] = [];
  userMessage = '';
  isTyping = false;

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
      text: `Hey! I’m ${this.activeCompanion.emoji} ${this.activeCompanion.name} — How are you feeling today?`
    });
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;
    this.messages.push({ sender: 'user', text: this.userMessage });
    const sentMessage = this.userMessage;
    this.userMessage = '';
    this.isTyping = true;

    setTimeout(() => {
      this.messages.push({ sender: 'ai', text: `Hmm... I get you. "${sentMessage}" sounds important.` });
      this.isTyping = false;
    }, 1200);
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
