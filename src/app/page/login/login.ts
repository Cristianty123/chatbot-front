import { Component, OnInit } from '@angular/core';  // ← Añadir OnInit
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {  // ← Implementar OnInit
  username: string = '';  // ← CAMBIAR: email por username
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'login');
    
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/homelogin']);
    }
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  login() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      username: this.username,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response?.success) {
          console.log('✅ Login exitoso:', response.user);
          this.router.navigate(['/homelogin']);
        } else {
          this.errorMessage = response?.error || 'Error en el login';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error en login:', error);
        
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas';
        } else if (error.status === 400) {
          this.errorMessage = 'Datos inválidos';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Verifica tu internet.';
        } else {
          this.errorMessage = 'Error inesperado. Intenta más tarde.';
        }
      }
    });
  }

}