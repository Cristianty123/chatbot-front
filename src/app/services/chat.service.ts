import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  last_message: string;
  message_count: number;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  session_id?: string;
  chat_id?: string;
  timestamp?: string;
  error?: string;
}

export interface ChatsResponse {
  success: boolean;
  chats: Chat[];
  error?: string;
}

export interface MessagesResponse {
  success: boolean;
  messages: ChatMessage[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // CHAT SIN LOGIN
  chatWithoutLogin(message: string, sessionId?: string): Observable<ChatResponse> {
    const body = {
      message: message,
      session_id: sessionId
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<ChatResponse>(`${this.baseUrl}/chat/nologin`, body,  {headers});
  }

  // CHAT CON LOGIN
  chatWithLogin(message: string, chatId?: string): Observable<ChatResponse> {
    const body = {
      message: message,
      chat_id: chatId
    };

    const headers = this.authService.getAuthHeaders();
    
    return this.http.post<ChatResponse>(`${this.baseUrl}/chat/`, body, { headers });
  }

  // OBTENER CHATS DEL USUARIO
  getUserChats(): Observable<ChatsResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ChatsResponse>(`${this.baseUrl}/chats/`, { headers });
  }

  // OBTENER MENSAJES DE UN CHAT
  getChatMessages(chatId: string): Observable<MessagesResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<MessagesResponse>(`${this.baseUrl}/chats/${chatId}/messages/`, { headers });
  }

  // BÚSQUEDA DE PRODUCTOS
  searchProducts(query: string, sessionId?: string, limit: number = 5): Observable<any> {
    const body = {
      query: query,
      session_id: sessionId,
      limit: limit
    };

    return this.http.post(`${this.baseUrl}/search-products/`, body);
  }

  // LIMPIAR HISTORIAL
  clearChatHistory(sessionId: string): Observable<any> {
    const body = { session_id: sessionId };
    return this.http.post(`${this.baseUrl}/clear-chat-history/`, body);
  }
}