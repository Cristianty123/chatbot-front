import { Component, OnInit, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {FormatMessagePipe} from '../../pipes/format-message.pipe';
import {ChatService} from '../../services/chat.service';

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
  sessionId: string | undefined = undefined;
  private shouldScroll = false;
  isLightTheme = false;

  constructor(
    private router: Router,
    private chatService: ChatService ,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Cargar preferencia de tema guardada
    const savedTheme = localStorage.getItem('tyrrel-theme');
    if (savedTheme === 'light') {
      this.isLightTheme = true;
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'main');
    }
    this.generateSessionId();
  }
  // Función para cambiar entre temas
  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    
    if (this.isLightTheme) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('tyrrel-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'main');
      localStorage.setItem('tyrrel-theme', 'dark');
    }
    
    // Efecto visual adicional al cambiar tema
    this.playThemeTransitionEffect();
  }

  // Efecto especial de transición (opcional)
  private playThemeTransitionEffect() {
    const particles = document.createElement('div');
    particles.style.position = 'fixed';
    particles.style.top = '0';
    particles.style.left = '0';
    particles.style.width = '100%';
    particles.style.height = '100%';
    particles.style.pointerEvents = 'none';
    particles.style.zIndex = '9999';
    
    // Crear partículas angelicales
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'angel-particle';
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.top = Math.random() * 100 + 'vh';
      particle.style.animation = `floatParticle ${Math.random() * 2 + 1}s ease-in-out forwards`;
      particles.appendChild(particle);
    }
    
    document.body.appendChild(particles);
    
    // Remover después de la animación
    setTimeout(() => {
      document.body.removeChild(particles);
    }, 2000);
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

  sendMessage() {
    const message = this.userInput.trim();
    if (!message || this.isLoading) return;

    this.addMessage(message, true);
    this.userInput = '';
    this.isLoading = true;

    this.chatService.chatWithoutLogin(message, this.sessionId).subscribe({
      next: (response) => {
        if (response.success) {
          this.addMessage(response.response || 'Respuesta vacía', false);
        } else {
          this.addMessage(' (;´д`) Lo siento, hubo un error. Por favor intenta nuevamente.', false);
        }
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
        this.addMessage(' (;´д`) Error de conexión. Por favor intenta más tarde.', false);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
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
