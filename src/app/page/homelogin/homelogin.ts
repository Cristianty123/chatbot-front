import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormatMessagePipe } from '../../pipes/format-message.pipe';
import { AuthService, User } from '../../services/auth.service';
import { ChatService, Chat, ChatMessage as ApiChatMessage } from '../../services/chat.service';

interface LocalChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface LocalChat {
  id: string;
  title: string;
  lastMessage: string;
  lastDate: Date;
  messages: LocalChatMessage[];
}

@Component({
  selector: 'app-homelogin',
  imports: [CommonModule, FormsModule, FormatMessagePipe],
  templateUrl: './homelogin.html',
  styleUrl: './homelogin.css'
})
export class HomeLogin implements OnInit {

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('searchInput') private searchInput!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef;

  chatStarted = false; // ← NUEVA propiedad para controlar el estado del chat
  userInput = '';
  isLoading = false;
  activeChatId: string | null = null;
  currentUser: User | null = null;
  
  chats: LocalChat[] = [];
  activeChatMessages: LocalChatMessage[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'main');
    
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = this.authService.getCurrentUser();
    this.loadUserChats();
  }

  // MÉTODO PARA INICIAR CHAT (como en home)
  startChat() {
    const searchText = this.userInput.trim();
    if (searchText) {
      this.chatStarted = true;
      this.setBodyChatClass(true);

      setTimeout(() => {
        this.sendMessage();
        if (this.chatInput && this.chatInput.nativeElement) {
          this.chatInput.nativeElement.focus();
        }
      }, 300);
    }
  }

  setBodyChatClass(isActive: boolean) {
    if (isActive) {
      document.body.classList.add('chat-active');
    } else {
      document.body.classList.remove('chat-active');
    }
  }

  // CARGAR CHATS DEL USUARIO DESDE EL BACKEND
  loadUserChats() {
    this.chatService.getUserChats().subscribe({
      next: (response) => {
        if (response.success) {
          this.chats = response.chats.map(apiChat => this.transformApiChatToLocalChat(apiChat));
          
          // Seleccionar el primer chat o crear uno nuevo
          if (this.chats.length > 0) {
            this.selectChat(this.chats[0].id);
          }
        } else {
          console.error('Error al cargar chats:', response.error);
        }
      },
      error: (error) => {
        console.error('Error en la petición de chats:', error);
      }
    });
  }

  // CARGAR MENSAJES DE UN CHAT ESPECÍFICO
  loadChatMessages(chatId: string) {
    this.chatService.getChatMessages(chatId).subscribe({
      next: (response) => {
        if (response.success) {
          this.activeChatMessages = response.messages.map(apiMessage => ({
            content: apiMessage.content,
            isUser: apiMessage.sender === 'user',
            timestamp: new Date(apiMessage.timestamp)
          }));
          this.chatStarted = this.activeChatMessages.length > 0;
          this.setBodyChatClass(this.chatStarted);
          this.scrollToBottom();
        } else {
          console.error('Error al cargar mensajes:', response.error);
        }
      },
      error: (error) => {
        console.error('Error en la petición de mensajes:', error);
      }
    });
  }

  // TRANSFORMAR CHAT DE API A FORMATO LOCAL
  private transformApiChatToLocalChat(apiChat: Chat): LocalChat {
    return {
      id: apiChat.id,
      title: apiChat.title || 'Chat sin título',
      lastMessage: apiChat.last_message || 'Sin mensajes',
      lastDate: new Date(apiChat.created_at),
      messages: []
    };
  }

  selectChat(chatId: string) {
    this.activeChatId = chatId;
    this.loadChatMessages(chatId);
    this.chatStarted = true;
    this.setBodyChatClass(true);
    
    setTimeout(() => {
      if (this.chatInput) {
        this.chatInput.nativeElement.focus();
      }
    }, 100);
  }

  startNewChat() {
    this.activeChatId = null;
    this.activeChatMessages = [];
    this.userInput = '';
    this.chatStarted = false;
    this.setBodyChatClass(false);
    
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.nativeElement.focus();
      }
    }, 100);
  }

  async sendMessage() {
    const message = this.userInput.trim();
    if (!message || this.isLoading) return;

    // Si es el primer mensaje, iniciar el chat
    if (!this.chatStarted) {
      this.chatStarted = true;
      this.setBodyChatClass(true);
    }

    this.addMessage(message, true);
    this.userInput = '';
    this.isLoading = true;

    try {
      console.log('🔍 Enviando mensaje al chat autenticado...');
      
      let response;
      
      if (this.activeChatId) {
        response = await this.chatService.chatWithLogin(message, this.activeChatId).toPromise();
      } else {
        response = await this.chatService.chatWithLogin(message).toPromise();
      }

      console.log('🔍 Respuesta del servidor:', response);

      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      if (response.success) {
        if (response.chat_id && !this.activeChatId) {
          this.activeChatId = response.chat_id;
          this.loadUserChats();
        }
        this.addMessage(response.response || 'Respuesta del asistente', false);
      } else {
        throw new Error(response.error || 'Error del servidor');
      }
    } catch (error: any) {
      console.error('❌ Error completo al enviar mensaje:', error);
      
      if (error.status === 401) {
        this.addMessage(' (;´д`) Sesión expirada. Redirigiendo al login...', false);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      } else if (error.status === 404) {
        this.addMessage(' (;´д`) Endpoint no encontrado. ¿Está corriendo el backend?', false);
      } else {
        this.addMessage(' (;´д`) Error de conexión. Por favor intenta más tarde.', false);
      }
    } finally {
      this.isLoading = false;
    }
  }

  addMessage(content: string, isUser: boolean) {
    this.activeChatMessages.push({
      content,
      isUser,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.messagesContainer && this.messagesContainer.nativeElement) {
      setTimeout(() => {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        this.authService.clearAuthData();
        this.router.navigate(['/']);
      }
    });
  }

  deleteChat(chatId: string, event: Event) {
    event.stopPropagation();
    console.log('Eliminar chat:', chatId);
    this.chats = this.chats.filter(chat => chat.id !== chatId);
    
    if (this.activeChatId === chatId) {
      if (this.chats.length > 0) {
        this.selectChat(this.chats[0].id);
      } else {
        this.startNewChat();
      }
    }
  }

  // Listener para Enter en la barra de búsqueda
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