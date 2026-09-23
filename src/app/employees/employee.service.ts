import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee } from '../shared/models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  private readonly API = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.API);
  }
}
