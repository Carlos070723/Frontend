import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginResponse {
  token: string;
  user: { id_usuario: number; nombre_usuario: string; nivel: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // Cambia según tu backend

  constructor(private http: HttpClient) {}

  login(nombre_usuario: string, pasword: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/auth/login`, { nombre_usuario, pasword });
  }
}
