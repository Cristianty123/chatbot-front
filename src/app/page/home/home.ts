import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'main');
  }

  navigateToRegister() {
    this.router.navigate(['/register']).then(() => {
      console.log('Navegación a registro completada');
    }).catch((error) => {
      console.error('Error en navegación:', error);
    });
  }
}
