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
    selector: 'app-empleado',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div class="p-4">
            <h2 class="text-xl font-bold mb-3">Gestión de Empleados</h2>

            <button pButton label="Nuevo Empleado" icon="pi pi-plus" (click)="openNew()" class="mb-3"></button>

            <p-table [value]="empleados" [paginator]="true" [rows]="10" [responsiveLayout]="'scroll'">
                <ng-template pTemplate="header">
                    <tr>
                        <th>ID</th>
                        <th>Cargo</th>
                        <th>CI</th>
                        <th>Nombre</th>
                        <th>Paterno</th>
                        <th>Materno</th>
                        <th>Teléfono</th>
                        <th>Dirección</th>
                        <th>Fecha Nac.</th>
                        <th>Género</th>
                        <th>Intereses</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-emp>
                    <tr>
                        <td>{{ emp.id_empleado }}</td>
                        <td>{{ getCargoNombre(emp.id_cargo) }}</td>
                        <td>{{ emp.ci }}</td>
                        <td>{{ emp.nombre }}</td>
                        <td>{{ emp.paterno }}</td>
                        <td>{{ emp.materno }}</td>
                        <td>{{ emp.telefono }}</td>
                        <td>{{ emp.direccion }}</td>
                        <td>{{ emp.fechanacimiento | date: 'dd/MM/yyyy' }}</td>
                        <td>{{ emp.genero }}</td>
                        <td>{{ emp.intereses }}</td>
                        <td>
                            <button pButton icon="pi pi-pencil" class="p-button-text" (click)="edit(emp)"></button>
                            <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="remove(emp)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <!-- Dialog Empleado -->
            <p-dialog header="Empleado" [(visible)]="dialogVisible" [modal]="true" [closable]="false" [style]="{ width: '600px' }">
                <div class="p-fluid">
                    <div class="field">
                        <label style="margin-right:10px;">Cargo </label>
                        <select [(ngModel)]="model.id_cargo" style="background-color: white; color: black;">
                            <option *ngFor="let c of cargos" [value]="c.id_cargo">{{ c.cargo }}</option>
                        </select>
                    </div>
                    <br />
                    <div class="field"><label style="margin-right:10px;">CI </label><input pInputText [(ngModel)]="model.ci" /></div>
                    <br />
                    <div class="field"><label style="margin-right:10px;">Nombre </label><input pInputText [(ngModel)]="model.nombre" /></div>
                    <br />
                    <div class="field"><label style="margin-right:10px;">Paterno </label><input pInputText [(ngModel)]="model.paterno" /></div>
                    <br />
                    <div class="field"><label style="margin-right:10px;">Materno </label><input pInputText [(ngModel)]="model.materno" /></div>
                    <br />
                    <div class="field"><label style="margin-right:10px;">Teléfono </label><input pInputText [(ngModel)]="model.telefono" /></div>
                    <br />
                    <div class="field"><label style="margin-right:10px;">Dirección </label><input pInputText [(ngModel)]="model.direccion" /></div>
                    <br />
                    <div class="field"><label style="margin-right:10px;">Fecha Nac. </label><input type="date" [(ngModel)]="model.fechanacimiento" /></div>
                    <br />
                    <div class="field"><label style="margin-right:10px;">Género </label><input pInputText [(ngModel)]="model.genero" /></div>
                    <br />
                    <div class="field"><label style="margin-right:10px;">Intereses </label><input pInputText [(ngModel)]="model.intereses" /></div>
                    <br />
                </div>
                <ng-template pTemplate="footer">
                    <button pButton label="Cancelar" class="p-button-text" (click)="dialogVisible = false"></button>
                    <button pButton label="Guardar" (click)="save()"></button>
                </ng-template>
            </p-dialog>
        </div>
    `
})
export class EmpleadoComponent implements OnInit {
    apiUrl = 'http://localhost:3000/api/empleados';
    cargosUrl = 'http://localhost:3000/api/cargos';
    empleados: any[] = [];
    cargos: any[] = [];
    model: any = {};
    dialogVisible = false;

    constructor(
        private http: HttpClient,
        private msg: MessageService
    ) {}

    ngOnInit() {
        this.loadEmpleados();
        this.loadCargos();
    }

    private getHeaders() {
        const token = localStorage.getItem('token');
        return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    }

    loadEmpleados() {
        this.http.get<any[]>(this.apiUrl, this.getHeaders()).subscribe({
            next: (r) => (this.empleados = r),
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pueden cargar empleados' })
        });
    }

    loadCargos() {
        this.http.get<any[]>(this.cargosUrl, this.getHeaders()).subscribe({
            next: (r) => (this.cargos = r),
            error: () => this.msg.add({ severity: 'warn', summary: 'Aviso', detail: 'No se pudieron cargar cargos' })
        });
    }

    getCargoNombre(id: number) {
        const c = this.cargos.find((x) => x.id_cargo === id);
        return c ? c.cargo : '—';
    }

    openNew() {
        this.model = {};
        this.dialogVisible = true;
    }
    edit(emp: any) {
        this.model = { ...emp };
        this.dialogVisible = true;
    }

    save() {
        if (this.model.id_empleado) {
            this.http.put(`${this.apiUrl}/${this.model.id_empleado}`, this.model, this.getHeaders()).subscribe({
                next: () => {
                    this.msg.add({ severity: 'success', summary: 'Actualizado' });
                    this.dialogVisible = false;
                    this.loadEmpleados();
                }
            });
        } else {
            this.http.post(this.apiUrl, this.model, this.getHeaders()).subscribe({
                next: () => {
                    this.msg.add({ severity: 'success', summary: 'Creado' });
                    this.dialogVisible = false;
                    this.loadEmpleados();
                }
            });
        }
    }

    remove(emp: any) {
        if (!confirm('¿Eliminar este empleado?')) return;
        this.http.delete(`${this.apiUrl}/${emp.id_empleado}`, this.getHeaders()).subscribe({
            next: () => {
                this.msg.add({ severity: 'warn', summary: 'Eliminado' });
                this.loadEmpleados();
            }
        });
    }
}
