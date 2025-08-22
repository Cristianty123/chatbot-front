import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {

  constructor(private router: Router) {}
  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'login');
  }

  navigateToHome() {
    this.router.navigate(['/']).then(() => {
      // Navegación completada con éxito
      console.log('Navegación a registro completada');
    }).catch((error) => {
      // Manejo de errores si la navegación falla
      console.error('Error en navegación:', error);
    });
  }
}
