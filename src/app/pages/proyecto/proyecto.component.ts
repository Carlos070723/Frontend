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
  selector: 'app-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Gestión de Proyectos</h2>

      <div class="mb-4 flex gap-2">
        <input type="text" pInputText placeholder="Nombre del proyecto" [(ngModel)]="nombre" />
        <input type="text" pInputText placeholder="Descripción" [(ngModel)]="descripcion" />
        <button pButton label="Agregar" (click)="crearProyecto()"></button>
      </div>

      <p-table [value]="proyectos" dataKey="_id">
        <ng-template pTemplate="header">
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-p>
          <tr>
            <td>{{ p.nombre }}</td>
            <td>{{ p.descripcion }}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class ProyectoComponent implements OnInit {
  apiUrl = 'http://localhost:3000/proyecto';
  proyectos: any[] = [];
  nombre = '';
  descripcion = '';

  constructor(private http: HttpClient, private messageService: MessageService) {}

  ngOnInit() {
    this.obtenerProyectos();
  }

  obtenerProyectos() {
    const headers = this.getHeaders();
    this.http.get<any[]>(this.apiUrl, { headers }).subscribe({
      next: (res) => (this.proyectos = res),
      error: (err) => console.error(err)
    });
  }

  crearProyecto() {
    if (!this.nombre.trim() || !this.descripcion.trim()) return;

    const headers = this.getHeaders();
    this.http.post(this.apiUrl, { nombre: this.nombre, descripcion: this.descripcion }, { headers }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto creado' });
        this.nombre = '';
        this.descripcion = '';
        this.obtenerProyectos();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el proyecto' });
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
