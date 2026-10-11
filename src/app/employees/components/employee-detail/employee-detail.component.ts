import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { EmployeeService } from '../../employee.service';
import { Employee } from '../../../shared/models/employee.model';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss'
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (isNaN(id)) {
      this.errorMessage = 'Invalid employee ID.';
      this.loading = false;
      return;
    }

    this.employeeService.getEmployeeById(id).subscribe({
      next: (emp) => {
        this.employee = emp;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.status === 404
          ? 'Employee not found.'
          : 'Failed to load employee. Please try again.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }

  // ── Role helpers (delegated to AuthService) ─────────────────────────────────

  isHR(): boolean      { return this.authService.isHR(); }
  isManager(): boolean { return this.authService.isManager(); }
  isEmployee(): boolean { return this.authService.isEmployee(); }

  // ── Action stubs (Phase 3 will wire these to real forms/dialogs) ────────────

  /** HR / Manager — navigate to Edit Employee form (Phase 3). */
  onEdit(): void {
    if (!this.employee) return;
    this.router.navigate(['/employees', this.employee.id, 'edit']);
  }

  /** HR only — confirm then delete (Phase 3 replaces confirm with modal). */
  onDelete(): void {
    if (!this.employee) return;
    const confirmed = window.confirm(
      `Delete employee "${this.employee.firstName} ${this.employee.lastName}" (${this.employee.employeeId})?\nThis action cannot be undone.`
    );
    if (confirmed) {
      // TODO Phase 3: call employeeService.deleteEmployee(this.employee.id), then navigate back
      console.log('[Phase 3 stub] Delete employee id:', this.employee.id);
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** Format ISO date string e.g. "2022-01-15" → "Jan 15, 2022" */
  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /** CSS class for the status badge */
  statusClass(status: string): string {
    return 'badge-' + status.toLowerCase();
  }
}
