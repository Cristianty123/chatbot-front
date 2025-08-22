import { Component } from '@angular/core';
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

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}
