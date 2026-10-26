import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../../employee.service';
import { AuthService } from '../../../auth/auth.service';
import { CreateEmployeeRequest, EmployeeStatus, Role } from '../../../shared/models/employee.model';

@Component({
  selector: 'app-create-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-employee.component.html',
  styleUrl: './create-employee.component.scss'
})
export class CreateEmployeeComponent implements OnInit {

  form!: FormGroup;
  submitting = false;
  submitError = '';

  // ── Static option lists ──────────────────────────────────────────────────

  readonly statusOptions: { label: string; value: EmployeeStatus }[] = [
    { label: 'Active',      value: 'ACTIVE'      },
    { label: 'Inactive',    value: 'INACTIVE'    },
    { label: 'On Leave',    value: 'ON_LEAVE'    },
    { label: 'Terminated',  value: 'TERMINATED'  }
  ];

  readonly roleOptions: { label: string; value: Role }[] = [
    { label: 'Employee', value: 'EMPLOYEE' },
    { label: 'Manager',  value: 'MANAGER'  },
    { label: 'HR',       value: 'HR'       }
  ];

  readonly departmentOptions: string[] = [
    'Engineering',
    'Human Resources',
    'Finance',
    'Marketing',
    'Operations',
    'Product',
    'Sales',
    'Legal',
    'Design',
    'Customer Support'
  ];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // HR-only page — redirect non-HR users back to the list
    if (!this.authService.isHR()) {
      this.router.navigate(['/employees']);
      return;
    }

    this.form = this.fb.group({
      firstName:   ['', [Validators.required, Validators.maxLength(50)]],
      lastName:    ['', [Validators.required, Validators.maxLength(50)]],
      email:       ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      department:  ['', Validators.required],
      position:    ['', [Validators.required, Validators.maxLength(100)]],
      hireDate:    ['', Validators.required],
      status:      ['ACTIVE', Validators.required],
      role:        ['EMPLOYEE', Validators.required],
      phoneNumber: ['', Validators.pattern(/^[+\d\s\-().]{7,20}$/)],
      address:     ['', Validators.maxLength(200)],
      managerId:   [null]
    });
  }

  // ── Convenience helpers for template ────────────────────────────────────

  field(name: string): AbstractControl {
    return this.form.get(name)!;
  }

  isInvalid(name: string): boolean {
    const ctrl = this.field(name);
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  // ── Form actions ─────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting  = true;
    this.submitError = '';

    const raw = this.form.value;

    const payload: CreateEmployeeRequest = {
      firstName:   raw.firstName.trim(),
      lastName:    raw.lastName.trim(),
      email:       raw.email.trim().toLowerCase(),
      department:  raw.department,
      position:    raw.position.trim(),
      hireDate:    raw.hireDate,
      status:      raw.status as EmployeeStatus,
      role:        raw.role as Role,
      phoneNumber: raw.phoneNumber?.trim() || undefined,
      address:     raw.address?.trim()     || undefined,
      managerId:   raw.managerId ? Number(raw.managerId) : null
    };

    this.employeeService.createEmployee(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.submitting  = false;
        // Surface a readable error — backend may return a message field
        this.submitError =
          err?.error?.message ??
          err?.error?.error   ??
          'Failed to create employee. Please try again.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }
}
