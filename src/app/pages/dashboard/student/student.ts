import { Component, OnInit } from '@angular/core';
import { Sidebar } from '../../../reusable/components/sidebar/sidebar';

@Component({
  selector: 'app-student',
  imports: [Sidebar],
  templateUrl: './student.html',
  styleUrl: './student.css',
})
export class Student implements OnInit{

userName: string = '';

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userName = user.name;
  }
}
