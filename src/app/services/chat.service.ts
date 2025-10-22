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

export interface NewChatResponse {
  success: boolean;
  chat_id: string;
  title: string;
  was_created?: boolean;
  error?: string;
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

export interface DeleteChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly baseUrl = 'https://ia-back-bketewhranetapck.centralus-01.azurewebsites.net/chatbot';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
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

  deleteChat(chatId: string): Observable<DeleteChatResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<DeleteChatResponse>(
      `${this.baseUrl}/api/chats/${chatId}/`,
      { headers }
    );
  }

  createNewChat(): Observable<NewChatResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<NewChatResponse>(
      `${this.baseUrl}/api/chats/new/`,
      {},
      { headers }
    );
  }

  // CHAT CON LOGIN
  chatWithLogin(message: string, chatId?: string): Observable<ChatResponse> {
    const body = {
      message: message,
      chat_id: chatId
    };

    const headers = this.authService.getAuthHeaders();

    return this.http.post<ChatResponse>(`${this.baseUrl}/chat/login`, body, { headers });
  }

  // OBTENER CHATS DEL USUARIO
  getUserChats(): Observable<ChatsResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<ChatsResponse>(`${this.baseUrl}/chats`, { headers });
  }

  // OBTENER MENSAJES DE UN CHAT
  getChatMessages(chatId: string): Observable<MessagesResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<MessagesResponse>(`${this.baseUrl}/chats/${chatId}/messages/`, { headers });
  }
}
