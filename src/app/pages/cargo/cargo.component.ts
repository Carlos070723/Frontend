// src/app/pages/cargo/cargo.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-cargo',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Cargos</h2>
        <button pButton label="Nuevo" icon="pi pi-plus" (click)="openNew()"></button>
      </div>

      <p-table [value]="cargos" [paginator]="true" [rows]="10" *ngIf="cargos">
        <ng-template pTemplate="header">
          <tr>
            <th>ID</th>
            <th>Cargo</th>
            <th style="width:160px">Acciones</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.id_cargo }}</td>
            <td>{{ row.cargo }}</td>
            <td>
              <button pButton icon="pi pi-pencil" class="p-button-text" (click)="edit(row)"></button>
              <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="remove(row)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog header="Cargo" [(visible)]="dialogVisible" [modal]="true" [closable]="true" [resizable]="false">
        <div class="p-fluid">
          <div class="field">
            <label for="cargo">Nombre</label>
            <input id="cargo" pInputText [(ngModel)]="model.cargo" />
          </div>
        </div>
        <ng-template pTemplate="footer">
          <button pButton label="Cancelar" class="p-button-text" (click)="dialogVisible=false"></button>
          <button pButton label="Guardar" (click)="save()"></button>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class CargoComponent implements OnInit {
  apiUrl = 'http://localhost:3000/api/cargos'; // <-- IMPORTANTE
  cargos: any[] = [];
  model: any = {};
  dialogVisible = false;

  constructor(private http: HttpClient, private msg: MessageService) {}

  ngOnInit() {
    this.load();
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }

  load() {
  console.log('==> CargoComponent.load() - llamando a', this.apiUrl);
  const opts = this.getHeaders();
  console.log('Headers enviados:', opts);

  this.http.get<any[]>(this.apiUrl, opts).subscribe({
    next: (r) => {
      console.log('Respuesta recibida (OK):', r);
      this.cargos = r;
    },
    error: (e) => {
      console.error('ERROR al cargar cargos - objeto error completo:', e);
      // imprime partes importantes
      try {
        console.error('status:', e.status);
        console.error('statusText:', e.statusText);
        console.error('error:', e.error);
      } catch (x) { /* ignore */ }
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pueden cargar cargos' });
    }
  });
}


  openNew() {
    this.model = {};
    this.dialogVisible = true;
  }

  edit(row: any) {
    this.model = { ...row };
    this.dialogVisible = true;
  }

  save() {
    if (this.model.id_cargo) {
      // update
      this.http.put(`${this.apiUrl}/${this.model.id_cargo}`, this.model, this.getHeaders()).subscribe({
        next: () => { this.msg.add({ severity: 'success', summary: 'Actualizado' }); this.dialogVisible = false; this.load(); },
        error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
      });
    } else {
      // create
      this.http.post(this.apiUrl, this.model, this.getHeaders()).subscribe({
        next: () => { this.msg.add({ severity: 'success', summary: 'Creado' }); this.dialogVisible = false; this.load(); },
        error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' })
      });
    }
  }

  remove(row: any) {
    if (!confirm('Eliminar este cargo?')) return;
    this.http.delete(`${this.apiUrl}/${row.id_cargo}`, this.getHeaders()).subscribe({
      next: () => { this.msg.add({ severity: 'warn', summary: 'Eliminado' }); this.load(); },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
    });
  }
}
