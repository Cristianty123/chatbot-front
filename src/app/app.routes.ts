import { Routes } from '@angular/router';
import { Home } from './page/home/home';
import {Register} from './page/register/register';
import { Login } from './page/login/login';
import { HomeLogin } from './page/homelogin/homelogin';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: Home, data: {animation: 'HomePage'}},
    {path: 'register', component: Register, data: {animation: 'RegisterPage'}},
    {path: 'login', component: Login, data: {animation: 'RegisterPage'}},
    {path: 'homelogin', component: HomeLogin, canActivate: [AuthGuard] },
    {path: '**', redirectTo: '' }
];

