export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
export type Role = 'EMPLOYEE' | 'MANAGER' | 'HR';

export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;       // ISO date string e.g. "2022-01-15"
  status: EmployeeStatus;
  role: Role;
  phoneNumber?: string;
  address?: string;
  managerId?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;        // current page (0-based)
  size: number;
  first: boolean;
  last: boolean;
}

/**
 * Payload sent to POST /api/employees when creating a new employee.
 * All fields except phoneNumber and address are required.
 */
export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;        // ISO date string e.g. "2024-03-15"
  status: EmployeeStatus;
  role: Role;
  phoneNumber?: string;
  address?: string;
  managerId?: number | null;
}

export interface EmployeeSearchCriteria {
  searchText?: string;
  departments?: string[];
  roles?: Role[];
  statuses?: EmployeeStatus[];
  managerIds?: number[];
  hireDateFrom?: string;
  hireDateTo?: string;
  minYearsOfService?: number;
  maxYearsOfService?: number;
  cities?: string[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}
