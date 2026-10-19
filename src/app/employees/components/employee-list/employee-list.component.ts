import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { EmployeeService } from '../../employee.service';
import { Employee, EmployeeStatus } from '../../../shared/models/employee.model';
import { FilterBarComponent, FilterChange } from '../filter-bar/filter-bar.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterBarComponent],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = true;
  errorMessage = '';
  currentUser: { username: string; role: string } | null = null;

  // Pagination state
  currentPage = 0;   // 0-based (Spring Boot convention)
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Sort state
  sortBy = 'employeeId';
  sortDir: 'asc' | 'desc' = 'asc';

  // Filter state
  filterDepartment: string = '';
  filterStatus: EmployeeStatus | '' = '';

  /** Unique sorted department list derived from the current page's data.
   *  Passed as @Input to FilterBarComponent. */
  get availableDepartments(): string[] {
    const depts = this.employees.map(e => e.department).filter(Boolean);
    return [...new Set(depts)].sort();
  }

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';
    this.employeeService
      .getEmployeesPaged(
        this.currentPage,
        this.pageSize,
        this.sortBy,
        this.sortDir,
        this.filterDepartment,
        this.filterStatus
      )
      .subscribe({
        next: (page) => {
          this.employees = page.content;
          this.totalElements = page.totalElements;
          this.totalPages = page.totalPages;
          this.currentPage = page.number;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load employees. Please try again.';
          this.loading = false;
        }
      });
  }

  // ── Filter ──────────────────────────────────────────────────────────────────

  /** Called whenever FilterBarComponent emits a (filterChange) event. */
  onFilterChange(filter: FilterChange): void {
    this.filterDepartment = filter.department;
    this.filterStatus     = filter.status;
    this.currentPage      = 0;   // always reset to first page on filter change
    this.loadEmployees();
  }

  navigateToDetail(emp: Employee): void {
    this.router.navigate(['/employees', emp.id]);
  }

  // ── Role helpers (delegated to AuthService) ─────────────────────────────────

  isHR(): boolean     { return this.authService.isHR(); }
  isManager(): boolean { return this.authService.isManager(); }
  isEmployee(): boolean { return this.authService.isEmployee(); }

  // ── Action stubs (Phase 3 will wire these to real forms/dialogs) ────────────

  /** HR only — navigate to Create Employee form (Phase 3). */
  onCreate(): void {
    this.router.navigate(['/employees/new']);
  }

  /** HR / Manager — navigate to Edit Employee form (Phase 3). */
  onEdit(emp: Employee, event: MouseEvent): void {
    event.stopPropagation(); // prevent row click from firing
    this.router.navigate(['/employees', emp.id, 'edit']);
  }

  /** HR only — confirm then delete (Phase 3 replaces confirm with modal). */
  onDelete(emp: Employee, event: MouseEvent): void {
    event.stopPropagation(); // prevent row click from firing
    const confirmed = window.confirm(
      `Delete employee "${emp.firstName} ${emp.lastName}" (${emp.employeeId})?\nThis action cannot be undone.`
    );
    if (confirmed) {
      // TODO Phase 3: call employeeService.deleteEmployee(emp.id)
      console.log('[Phase 3 stub] Delete employee id:', emp.id);
    }
  }

  // ── Sort ────────────────────────────────────────────────────────────────────

  sortByColumn(column: string): void {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.currentPage = 0;
    this.loadEmployees();
  }

  // ── Pagination ──────────────────────────────────────────────────────────────

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadEmployees();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadEmployees();
  }

  get firstItem(): number {
    return this.totalElements === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get lastItem(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  getPageNumbers(): number[] {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(0, this.currentPage - half);
    let end = Math.min(this.totalPages - 1, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  logout(): void {
    this.authService.logout();
  }
}
