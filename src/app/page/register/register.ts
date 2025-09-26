import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  username: string = '';  // ← NUEVO campo
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'login');
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToLogin(event: Event) {
    event.preventDefault();
    this.router.navigate(['/login']);
  }

  register() {
    // Validaciones
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Por favor, ingresa un email válido';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.password.length < 8) {  // ← Cambiado a 8 (como en el backend)
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Enviar los 3 campos que espera el backend
    const userData = {
      username: this.username,  // ← username separado
      email: this.email,
      password: this.password
    };

    console.log('📤 Enviando datos de registro:', userData);

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success) {
          console.log('✅ Registro exitoso:', response.user);
          this.router.navigate(['/homelogin']);
        } else {
          this.errorMessage = response.error || 'Error en el registro';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error en registro:', error);
        
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.status === 400) {
          this.errorMessage = 'El usuario ya existe o datos inválidos';
        } else {
          this.errorMessage = 'Error de conexión. Intenta más tarde.';
        }
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}