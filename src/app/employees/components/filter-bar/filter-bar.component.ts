import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeStatus } from '../../../shared/models/employee.model';

/** Value emitted whenever the user changes a filter or clears all. */
export interface FilterChange {
  department: string;
  status: EmployeeStatus | '';
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss'
})
export class FilterBarComponent {

  /** Department options fed in from the parent (derived from loaded data). */
  @Input() departments: string[] = [];

  /** Emits whenever the active filters change (including when cleared). */
  @Output() filterChange = new EventEmitter<FilterChange>();

  selectedDepartment: string = '';
  selectedStatus: EmployeeStatus | '' = '';

  readonly statusOptions: { label: string; value: EmployeeStatus }[] = [
    { label: 'Active',     value: 'ACTIVE'     },
    { label: 'Inactive',   value: 'INACTIVE'   },
    { label: 'On Leave',   value: 'ON_LEAVE'   },
    { label: 'Terminated', value: 'TERMINATED' }
  ];

  /** True when at least one filter is active — drives the Clear button. */
  get hasActiveFilters(): boolean {
    return this.selectedDepartment !== '' || this.selectedStatus !== '';
  }

  onDepartmentChange(): void {
    this.emit();
  }

  onStatusChange(): void {
    this.emit();
  }

  clearFilters(): void {
    this.selectedDepartment = '';
    this.selectedStatus = '';
    this.emit();
  }

  private emit(): void {
    this.filterChange.emit({
      department: this.selectedDepartment,
      status: this.selectedStatus
    });
  }
}
