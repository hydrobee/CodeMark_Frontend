import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Student } from './pages/dashboard/student/student';
import { Admin } from './pages/dashboard/admin/admin';
import { Lecturer } from './pages/dashboard/lecturer/lecturer';
import { Signal } from './signal/signal';
import { Submission } from './pages/dashboard/student/submission/submission';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'student', component: Student },
    { path: 'lecturer', component: Lecturer },
    { path: 'admin', component: Admin},
    { path: 'signal', component: Signal},
    { path: 'student-submission', component: Submission},
    { path: '**', redirectTo: 'login' }

];
