import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  tokens: {
    refresh: string;
    access: string;
  };
  error?: string;  // ← Hacerla OPCIONAL al final
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://ai-back-euatdhgcc9gnfzgj.centralus-01.azurewebsites.net/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  // REGISTRO - AÑADIR HEADERS EXPLÍCITOS
  register(userData: { username: string; email: string; password: string }): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, userData, { headers }).pipe(
      tap(response => {
        if (response.success) {
          this.setAuthData(response);
        }
      })
    );
  }

  // LOGIN - AÑADIR HEADERS EXPLÍCITOS
  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, credentials, { headers }).pipe(
      tap(response => {
        if (response.success) {
          this.setAuthData(response);
        }
      })
    );
  }

  // LOGOUT
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout/`, {}).pipe(
      tap(() => {
        this.clearAuthData();
        this.router.navigate(['/']);
      })
    );
  }

  // OBTENER PERFIL
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/`);
  }

  // VERIFICAR SI ESTÁ AUTENTICADO
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    // Verificar expiración del token (simplificado)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  // OBTENER TOKEN PARA HEADERS
  getAuthHeaders(): { [header: string]: string } {
    const token = this.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // MÉTODOS PRIVADOS PARA MANEJO DE DATOS
  private setAuthData(response: AuthResponse): void {
    localStorage.setItem('access_token', response.tokens.access);
    localStorage.setItem('refresh_token', response.tokens.refresh);
    localStorage.setItem('user_data', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  public clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    this.currentUserSubject.next(null);
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    }
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
