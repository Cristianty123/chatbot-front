import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  imports: [],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'login');
  }
}
