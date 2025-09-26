import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, query, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          })
        ], { optional: true }),

        query(':enter', [
          style({
            opacity: 0,
            transform: 'translateY(20px) scale(0.98)',
            filter: 'blur(2px)'
          })
        ], { optional: true }),

        query(':leave', [
          animate('400ms ease', style({
            opacity: 0,
            filter: 'blur(2px)'
          }))
        ], { optional: true }),

        query(':enter', [
          animate('400ms ease', style({
            opacity: 1,
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0)'
          }))
        ], { optional: true })
      ])
    ])
  ]
})
export class App {
  protected readonly title = 'chatbot-front';

  // Propiedad para controlar el estado de mute
  isMuted = false;

  constructor() {
    // Cargar preferencia de mute guardada al inicializar
    this.loadMutePreference();
  }
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // No reproducir sonidos si está muteado
    if (this.isMuted) return;

    // Ignorar combinaciones de teclas (Ctrl, Alt, etc.)
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    // Ignorar teclas de función y otras especiales
    if (event.key.length > 1 && ![' ', 'Enter', 'Backspace'].includes(event.key)) return;

    if (event.key === ' ') {
      // sonido especial solo para espacio
      const audio = new Audio('/espacio.mp3');
      audio.play().catch(() => {});
    } else if (event.key === 'Enter') {
      // sonido especial solo para enter
      const audio = new Audio('/enter.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } else if (event.key === 'Backspace') {
      // sonido especial para borrar
      const audio = new Audio('/borrar.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } else {
      // sonido normal para cualquier otra tecla
      const audio = new Audio('/teclado.mp3');
      audio.play().catch(() => {});
    }
  }

  // Función para alternar el mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveMutePreference();
    
    console.log('Sonido ' + (this.isMuted ? 'silenciado' : 'activado'));
  }

  // Guardar preferencia en localStorage
  private saveMutePreference() {
    localStorage.setItem('tyrrel-mute-preference', this.isMuted.toString());
  }

  // Cargar preferencia desde localStorage
  private loadMutePreference() {
    const savedMutePreference = localStorage.getItem('tyrrel-mute-preference');
    if (savedMutePreference !== null) {
      this.isMuted = savedMutePreference === 'true';
    }
  }
  

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

}