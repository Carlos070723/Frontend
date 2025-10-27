import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Gestión de Empleados</h2>

      <div class="mb-4 flex gap-2">
        <input type="text" pInputText placeholder="Nombre" [(ngModel)]="nombre" />
        <input type="text" pInputText placeholder="Cargo" [(ngModel)]="cargo" />
        <button pButton label="Agregar" (click)="crearEmpleado()"></button>
      </div>

      <p-table [value]="empleados" dataKey="_id">
        <ng-template pTemplate="header">
          <tr>
            <th>Nombre</th>
            <th>Cargo</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-e>
          <tr>
            <td>{{ e.nombre }}</td>
            <td>{{ e.cargo }}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class EmpleadoComponent implements OnInit {
  apiUrl = 'http://localhost:3000/empleado';
  empleados: any[] = [];
  nombre = '';
  cargo = '';

  constructor(private http: HttpClient, private messageService: MessageService) {}

  ngOnInit() {
    this.obtenerEmpleados();
  }

  obtenerEmpleados() {
    const headers = this.getHeaders();
    this.http.get<any[]>(this.apiUrl, { headers }).subscribe({
      next: (res) => (this.empleados = res),
      error: (err) => console.error(err)
    });
  }

  crearEmpleado() {
    if (!this.nombre.trim() || !this.cargo.trim()) return;

    const headers = this.getHeaders();
    this.http.post(this.apiUrl, { nombre: this.nombre, cargo: this.cargo }, { headers }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Empleado creado' });
        this.nombre = '';
        this.cargo = '';
        this.obtenerEmpleados();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el empleado' });
      }
    });
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
