import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';
import { EmployeeService } from '../../employee.service';
import { Employee } from '../../../shared/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements OnInit {

  employees: Employee[] = [];
  loading = true;
  errorMessage = '';
  currentUser: { username: string; role: string } | null = null;

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load employees. Please try again.';
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
