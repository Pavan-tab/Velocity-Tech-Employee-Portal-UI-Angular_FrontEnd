import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee, PagedResponse } from '../shared/models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  private readonly API = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.API);
  }

  getEmployeesPaged(
    page: number,
    size: number,
    sortBy: string,
    sortDir: 'asc' | 'desc'
  ): Observable<PagedResponse<Employee>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortBy},${sortDir}`);
    return this.http.get<PagedResponse<Employee>>(this.API, { params });
  }
}
