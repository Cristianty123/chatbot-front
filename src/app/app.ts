import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, query, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
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

  private audio: HTMLAudioElement;

  constructor() {
    // Inicializamos el audio una sola vez
    this.audio = new Audio('/teclao.mp3');
  }
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if (event.key === ' ') {
     // sonido especial solo para espacio
     const audio = new Audio('/recarga.mp3');
     audio.play().catch(() => {});
     }else if (event.key === 'Enter') {
      // sonido especial solo para enter
      const audio = new Audio('/disparo.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }else if (event.key === 'Backspace') {
      // sonido especial para borrar
      const audio = new Audio('/crowbar.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    }else {
      // sonido normal para cualquier otra tecla
      const audio = new Audio('/teclao.mp3');
      audio.play().catch(() => {});
    }
  }
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}
