// src/app/pages/usuario/usuario.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, ToastModule],
  providers: [MessageService],
  template: `
  <p-toast></p-toast>

  <div class="p-4">
    <h2 class="text-xl font-bold mb-3">Gestión de Usuarios</h2>

    <button pButton label="Nuevo Usuario" icon="pi pi-plus" (click)="openNew()" class="mb-3"></button>

    <p-table [value]="usuarios" [paginator]="true" [rows]="10" [responsiveLayout]="'scroll'">
      <ng-template pTemplate="header">
        <tr>
          <th>ID</th>
          <th>Empleado</th>
          <th>Nombre Usuario</th>
          <th>Nivel</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-user>
        <tr>
          <td>{{user.id_usuario}}</td>
          <td>{{getEmpleadoNombre(user.id_empleado)}}</td>
          <td>{{user.nombre_usuario}}</td>
          <td>{{user.nivel}}</td>
          <td>{{user.estado}}</td>
          <td>
            <button pButton icon="pi pi-pencil" class="p-button-text" (click)="edit(user)"></button>
            <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="remove(user)"></button>
          </td>
        </tr>
      </ng-template>
    </p-table>

    <!-- Dialog Usuario -->
    <p-dialog header="Usuario" [(visible)]="dialogVisible" [modal]="true" [closable]="false" [style]="{width:'500px'}">
      <div class="p-fluid">
        <div class="field">
          <label style="margin-right:10px;">Empleado</label>
          <select [(ngModel)]="model.id_empleado" style="background-color: white; color: black;">
            <option [ngValue]="null" disabled selected>Seleccione un Empleado</option>
            <option *ngFor="let e of empleados" [value]="e.id_empleado">{{e.nombre}} {{e.paterno}} {{e.materno}}</option>
          </select>
        </div><br>
        <div class="field"><label style="margin-right:10px;">Nombre Usuario</label><input pInputText [(ngModel)]="model.nombre_usuario"/></div><br>
        <div class="field"><label style="margin-right:10px;">Contraseña</label><input type="password" pInputText [(ngModel)]="model.pasword"/></div><br>
        <div class="field"><label style="margin-right:10px;">Nivel</label><input pInputText [(ngModel)]="model.nivel"/></div><br>
        <div class="field"><label style="margin-right:10px;">Estado</label><input pInputText [(ngModel)]="model.estado"/></div><br>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="dialogVisible=false"></button>
        <button pButton label="Guardar" (click)="save()"></button>
      </ng-template>
    </p-dialog>
  </div>
  `
})
export class UsuarioComponent implements OnInit {
  apiUrl = 'http://localhost:3000/api/usuarios';
  empleadosUrl = 'http://localhost:3000/api/empleados';
  usuarios: any[] = [];
  empleados: any[] = [];
  model: any = {};
  dialogVisible = false;

  constructor(private http: HttpClient, private msg: MessageService) {}

  ngOnInit() {
    this.loadUsuarios();
    this.loadEmpleados();
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }

  loadUsuarios() {
    this.http.get<any[]>(this.apiUrl, this.getHeaders()).subscribe({
      next: r => this.usuarios = r,
      error: () => this.msg.add({severity:'error', summary:'Error', detail:'No se pueden cargar usuarios'})
    });
  }

  loadEmpleados() {
    this.http.get<any[]>(this.empleadosUrl, this.getHeaders()).subscribe({
      next: r => this.empleados = r,
      error: () => this.msg.add({severity:'warn', summary:'Aviso', detail:'No se pudieron cargar empleados'})
    });
  }

  getEmpleadoNombre(id: number) {
    const e = this.empleados.find(x => x.id_empleado === id);
    return e ? `${e.nombre} ${e.paterno} ${e.materno}` : '—';
  }

  openNew() { this.model = {}; this.dialogVisible = true; }
  edit(user: any) { this.model = {...user, pasword: ''}; this.dialogVisible = true; }

  save() {
    const data = {...this.model};
    // No bcrypt, solo envías la contraseña tal cual
    if(data.id_usuario) {
      this.http.put(`${this.apiUrl}/${data.id_usuario}`, data, this.getHeaders()).subscribe({
        next: () => { this.msg.add({severity:'success', summary:'Actualizado'}); this.dialogVisible=false; this.loadUsuarios(); }
      });
    } else {
      this.http.post(this.apiUrl, data, this.getHeaders()).subscribe({
        next: () => { this.msg.add({severity:'success', summary:'Creado'}); this.dialogVisible=false; this.loadUsuarios(); }
      });
    }
}

  remove(user: any) {
    if(!confirm('¿Eliminar este usuario?')) return;
    this.http.delete(`${this.apiUrl}/${user.id_usuario}`, this.getHeaders()).subscribe({
      next: () => { this.msg.add({severity:'warn', summary:'Eliminado'}); this.loadUsuarios(); }
    });
  }
}

