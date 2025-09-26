import { Component, OnInit, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {FormatMessagePipe} from '../../pipes/format-message.pipe';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, FormatMessagePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('searchInput') private searchInput!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef;

  chatStarted = false;
  userInput = '';
  messages: ChatMessage[] = [];
  isLoading = false;
  sessionId: string | null = null;
  private shouldScroll = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'main');
    this.generateSessionId();
  }

  setBodyChatClass(isActive: boolean) {
    if (isActive) {
      document.body.classList.add('chat-active');
    } else {
      document.body.classList.remove('chat-active');
    }
  }

  generateSessionId() {
    this.sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
  }

  startChat() {
    const searchText = this.searchInput.nativeElement.value.trim();
    if (searchText) {
      this.chatStarted = true;
      this.userInput = searchText;
      this.setBodyChatClass(true); // ← Agregar clase al body

      setTimeout(() => {
        this.sendMessage();
        if (this.chatInput && this.chatInput.nativeElement) {
          this.chatInput.nativeElement.focus();
        }
      }, 300);
    }
  }

  async sendMessage() {
    const message = this.userInput.trim();
    if (!message || this.isLoading) return;

    this.addMessage(message, true);
    this.userInput = '';
    this.isLoading = true;

    try {
      const response = await this.http.post<any>('http://localhost:8080/chat/nologin', {
        message: message,
        session_id: this.sessionId
      }).toPromise();

      if (response.success) {
        this.addMessage(response.response, false);
      } else {
        this.addMessage(' (;´д`) Lo siento, hubo un error. Por favor intenta nuevamente.', false);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      this.addMessage(' (;´д`)Error de conexión. Por favor intenta más tarde.', false);
    } finally {
      this.isLoading = false;
    }
  }

  addMessage(content: string, isUser: boolean) {
    this.messages.push({
      content,
      isUser,
      timestamp: new Date()
    });
    this.shouldScroll = true;
    this.cdRef.detectChanges(); // Forzar detección de cambios
  }

  scrollToBottom() {
    if (this.messagesContainer && this.messagesContainer.nativeElement) {
      setTimeout(() => {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  }
  navigateToRegister() {
    this.router.navigate(['/register']).then(() => {
      console.log('Navegación a registro completada');
    }).catch((error) => {
      console.error('Error en navegación:', error);
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']).then(() => {
      console.log('Navegación a registro completada');
    }).catch((error) => {
      console.error('Error en navegación:', error);
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.chatStarted) {
      const activeElement = document.activeElement;
      if (activeElement === this.searchInput?.nativeElement) {
        this.startChat();
        event.preventDefault();
      }
    }
  }
}
