import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee, EmployeeStatus, PagedResponse } from '../shared/models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  private readonly API = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.API);
  }

  /**
   * Fetch a paginated, sorted, and optionally filtered list of employees.
   *
   * @param page       0-based page index
   * @param size       number of records per page
   * @param sortBy     field name to sort by
   * @param sortDir    sort direction
   * @param department optional department filter value (empty string = no filter)
   * @param status     optional status filter value (empty string = no filter)
   */
  getEmployeesPaged(
    page: number,
    size: number,
    sortBy: string,
    sortDir: 'asc' | 'desc',
    department: string = '',
    status: EmployeeStatus | '' = ''
  ): Observable<PagedResponse<Employee>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortBy},${sortDir}`);

    if (department) {
      params = params.set('department', department);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PagedResponse<Employee>>(this.API, { params });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.API}/${id}`);
  }
}
