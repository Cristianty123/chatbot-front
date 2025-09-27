import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormatMessagePipe } from '../../pipes/format-message.pipe';
import { AuthService, User } from '../../services/auth.service';
import { ChatService, Chat } from '../../services/chat.service';

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
export class Homelogin implements OnInit {

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('searchInput') private searchInput!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef;

  chatStarted = false;
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

  async startNewChat() {
    try {
      this.isLoading = true;

      // Crear nuevo chat en el backend (o reutilizar uno vacío)
      const response = await this.chatService.createNewChat().toPromise();

      if (response?.success) {
        this.activeChatId = response.chat_id;

        // Limpiar frontend
        this.activeChatMessages = [];
        this.userInput = '';
        this.chatStarted = true;
        this.setBodyChatClass(true);

        // Solo recargar lista de chats si se creó uno nuevo
        if (response.was_created) {
          this.loadUserChats();
        }

        setTimeout(() => {
          if (this.chatInput) {
            this.chatInput.nativeElement.focus();
          }
        }, 100);

        console.log(response.was_created ? '🆕 Chat creado' : '🔄 Chat vacío reutilizado');
      } else {
        // ✅ Ahora response.error existe en la interfaz
        console.error('Error al crear chat:', response?.error);
        this.handleNewChatError(response?.error);
      }
    } catch (error) {
      console.error('Error al crear nuevo chat:', error);
      this.handleNewChatError('Error de conexión');
    } finally {
      this.isLoading = false;
    }
  }

  private handleNewChatError(errorMessage?: string) {
    this.activeChatId = null;
    this.activeChatMessages = [];
    this.userInput = '';
    this.chatStarted = false;
    this.setBodyChatClass(false);

    if (errorMessage) {
      console.error('Error en nuevo chat:', errorMessage);
    }
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

      const response = this.activeChatId
        ? await this.chatService.chatWithLogin(message, this.activeChatId).toPromise()
        : await this.chatService.chatWithLogin(message).toPromise();

      console.log('🔍 Respuesta del servidor:', response);

      if (!response) {
        this.handleMessageError('No se recibió respuesta del servidor');
        return;
      }

      if (response.success) {
        if (response.chat_id && !this.activeChatId) {
          this.activeChatId = response.chat_id;
          this.loadUserChats();
        }
        this.addMessage(response.response || 'Respuesta del asistente', false);
      } else {
        this.handleMessageError(response.error || 'Error del servidor');
      }
    } catch (error: any) {
      console.error('❌ Error completo al enviar mensaje:', error);
      this.handleHttpError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private handleMessageError(errorMessage: string) {
    console.error('Error en el mensaje:', errorMessage);
    this.addMessage(' (;´д`) Error: ' + errorMessage, false);
  }

  private handleHttpError(error: any) {
    if (error.status === 401) {
      this.addMessage(' (;´д`) Sesión expirada. Redirigiendo al login...', false);
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } else if (error.status === 404) {
      this.addMessage(' (;´д`) Endpoint no encontrado. ¿Está corriendo el backend?', false);
    } else {
      this.addMessage(' (;´д`) Error de conexión. Por favor intenta más tarde.', false);
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
    if (this.messagesContainer?.nativeElement) {
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

  async deleteChat(chatId: string, event: Event) {
    event.stopPropagation();

    // Confirmar eliminación
    if (!confirm('¿Estás seguro de que quieres eliminar este chat?')) {
      return;
    }

    try {
      const response = await this.chatService.deleteChat(chatId).toPromise();

      if (response?.success) {
        console.log('🗑️ Chat eliminado:', chatId);

        // Eliminar de la vista local
        this.chats = this.chats.filter(chat => chat.id !== chatId);

        // Si el chat activo fue eliminado, cambiar a otro chat
        if (this.activeChatId === chatId) {
          if (this.chats.length > 0) {
            this.selectChat(this.chats[0].id);
          } else {
            await this.startNewChat();
          }
        }
      } else {
        this.handleDeleteError(response?.error || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error completo al eliminar chat:', error);
      this.handleDeleteHttpError(error);
    }
  }

  private handleDeleteError(errorMessage: string) {
    console.error('Error al eliminar chat:', errorMessage);
    alert('Error al eliminar el chat: ' + errorMessage);
  }

  private handleDeleteHttpError(error: any) {
    if (error.status === 404) {
      alert('Chat no encontrado. Puede que ya haya sido eliminado.');
      this.loadUserChats();
    } else if (error.status === 401) {
      alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
      this.router.navigate(['/login']);
    } else {
      alert('Error de conexión. Por favor intenta más tarde.');
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
