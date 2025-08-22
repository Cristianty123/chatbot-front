import { Routes } from '@angular/router';
import { Home } from './page/home/home';
import {Register} from './page/register/register';

export const routes: Routes = [
    {path: '', redirectTo: 'Home', pathMatch: 'full'},
    {path: 'Home', component: Home, data: {animation: 'HomePage'}},
    {path: 'register', component: Register, data: {animation: 'RegisterPage'}},
];

