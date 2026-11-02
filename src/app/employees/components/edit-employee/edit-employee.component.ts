import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../employee.service';
import { AuthService } from '../../../auth/auth.service';
import { UpdateEmployeeRequest, Employee, EmployeeStatus, Role } from '../../../shared/models/employee.model';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.scss'
})
export class EditEmployeeComponent implements OnInit {

  form!: FormGroup;

  /** ID parsed from the route param */
  employeeId!: number;

  /** The employee record loaded from the API */
  employee: Employee | null = null;

  /** True while the initial GET is in-flight */
  loading = false;

  /** True while the PUT submit is in-flight */
  submitting = false;

  /** Inline error message for fetch failures */
  loadError = '';

  /** Inline error message for submit failures */
  submitError = '';

  // ── Static option lists (same as CreateEmployeeComponent) ────────────────

  readonly statusOptions: { label: string; value: EmployeeStatus }[] = [
    { label: 'Active',     value: 'ACTIVE'     },
    { label: 'Inactive',   value: 'INACTIVE'   },
    { label: 'On Leave',   value: 'ON_LEAVE'   },
    { label: 'Terminated', value: 'TERMINATED' }
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
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // HR-only page — redirect non-HR users back to the list
    if (!this.authService.isHR()) {
      this.router.navigate(['/employees']);
      return;
    }

    // Build the form with empty controls; values are patched once data loads
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

    // Parse the :id route parameter and fetch the employee
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || isNaN(Number(idParam))) {
      this.router.navigate(['/employees']);
      return;
    }

    this.employeeId = Number(idParam);
    this.fetchEmployee();
  }

  // ── Data fetching ─────────────────────────────────────────────────────────

  fetchEmployee(): void {
    this.loading   = true;
    this.loadError = '';

    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (emp) => {
        this.employee = emp;
        this.loading  = false;
        this.patchForm(emp);
      },
      error: (err) => {
        this.loading   = false;
        this.loadError =
          err?.error?.message ??
          err?.error?.error   ??
          'Failed to load employee data. Please try again.';
      }
    });
  }

  /** Populate the form controls with the loaded employee values. */
  private patchForm(emp: Employee): void {
    this.form.patchValue({
      firstName:   emp.firstName,
      lastName:    emp.lastName,
      email:       emp.email,
      department:  emp.department,
      position:    emp.position,
      hireDate:    emp.hireDate,
      status:      emp.status,
      role:        emp.role,
      phoneNumber: emp.phoneNumber ?? '',
      address:     emp.address     ?? '',
      managerId:   emp.managerId   ?? null
    });
  }

  // ── Convenience helpers for template ──────────────────────────────────────

  field(name: string): AbstractControl {
    return this.form.get(name)!;
  }

  isInvalid(name: string): boolean {
    const ctrl = this.field(name);
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  // ── Form actions ──────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting  = true;
    this.submitError = '';

    const raw = this.form.value;

    const payload: UpdateEmployeeRequest = {
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

    this.employeeService.updateEmployee(this.employeeId, payload).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/employees', this.employeeId]);
      },
      error: (err) => {
        this.submitting  = false;
        this.submitError =
          err?.error?.message ??
          err?.error?.error   ??
          'Failed to update employee. Please try again.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/employees', this.employeeId]);
  }
}
