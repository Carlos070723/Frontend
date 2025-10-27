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
    selector: 'app-venta',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div class="p-4">
            <h2 class="text-xl font-bold mb-3">Gestión de Ventas</h2>
            <button pButton label="Nueva Venta" icon="pi pi-plus" (click)="openVentaNew()" class="mb-3"></button>

            <!-- Tabla de Ventas -->
            <p-table [value]="ventas" [paginator]="true" [rows]="6" [responsiveLayout]="'scroll'">
                <ng-template pTemplate="header">
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Empleado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-v>
                    <tr>
                        <td>{{ v.id_venta }}</td>
                        <td>{{ v.cliente_nombre }}</td>
                        <td>{{ v.empleado_nombre }}</td>
                        <td>{{ v.fecha }}</td>
                        <td>
                            <button pButton icon="pi pi-pencil" class="p-button-text" (click)="editVenta(v)"></button>
                            <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="removeVenta(v)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <!-- Dialog de Venta -->
            <p-dialog header="Venta" [(visible)]="dialogVentaVisible" [modal]="true" [closable]="false" [style]="{ width: '700px' }">
                <div class="p-fluid">
                    <div class="field">
                        <label>Cliente</label>
                        <select [(ngModel)]="ventaActual.id_cliente">
                            <option *ngFor="let c of clientes" [value]="c.id_cliente">{{ c.razonsocial }}</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Empleado</label>
                        <select [(ngModel)]="ventaActual.id_empleado">
                            <option *ngFor="let e of empleados" [value]="e.id_empleado">{{ e.nombre }}</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Fecha</label>
                        <input type="date" [(ngModel)]="ventaActual.fecha" />
                    </div>

                    <h3>Agregar Producto</h3>
                    <div class="field">
                        <select [(ngModel)]="productoSeleccionado">
                            <option *ngFor="let p of productos" [ngValue]="p">{{ p.nombreproducto }}</option>
                        </select>
                        <input type="number" [(ngModel)]="cantidad" placeholder="Cantidad" />
                        <input type="number" [(ngModel)]="precio_unitario" placeholder="Precio unitario" />
                        <button pButton label="Agregar" (click)="agregarProducto()"></button>
                    </div>

                    <h4>Detalle de Venta</h4>
                    <p-table [value]="ventaActual.detalles">
                        <ng-template pTemplate="header">
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio</th>
                                <th>Subtotal</th>
                                <th>Acciones</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-d let-i="index">
                            <tr>
                                <td>{{ getNombreProducto(d.id_producto) }}</td>
                                <td>{{ d.cantidad }}</td>
                                <td>{{ d.precio_unitario }}</td>
                                <td>{{ d.subtotal }}</td>
                                <td>
                                    <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="eliminarDetalle(i)"></button>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
                <ng-template pTemplate="footer">
                    <button pButton label="Cancelar" class="p-button-text" (click)="dialogVentaVisible = false"></button>
                    <button pButton label="Guardar" (click)="guardarVenta()"></button>
                </ng-template>
            </p-dialog>
        </div>
    `
})
export class VentaComponent implements OnInit {
    apiUrl = 'http://localhost:3000/ventas';
    ventas: any[] = [];
    clientes: any[] = [];
    empleados: any[] = [];
    productos: any[] = [];

    dialogVentaVisible = false;
    ventaActual: any = { id_cliente: 0, id_empleado: 0, fecha: '', detalles: [] };
    productoSeleccionado: any = null;
    cantidad: number = 1;
    precio_unitario: number = 0;

    constructor(
        private http: HttpClient,
        private msg: MessageService
    ) {}

    ngOnInit() {
        this.loadVentas();
        this.loadClientes();
        this.loadEmpleados();
        this.loadProductos();
    }

    private getHeaders() {
        const token = localStorage.getItem('token');
        return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    }

    // ==== Cargar datos ====
    loadVentas() {
        this.http.get<any[]>(this.apiUrl, this.getHeaders()).subscribe((r) => (this.ventas = r));
    }
    loadClientes() {
        this.http.get<any[]>('http://localhost:3000/clientes', this.getHeaders()).subscribe((r) => (this.clientes = r));
    }
    loadEmpleados() {
        this.http.get<any[]>('http://localhost:3000/empleado', this.getHeaders()).subscribe((r) => (this.empleados = r));
    }
    loadProductos() {
        this.http.get<any[]>('http://localhost:3000/producto', this.getHeaders()).subscribe((r) => (this.productos = r));
    }

    // ==== Ventas ====
    openVentaNew() {
        this.ventaActual = { id_cliente: 0, id_empleado: 0, fecha: '', detalles: [] };
        this.dialogVentaVisible = true;
    }

    editVenta(v: any) {
        this.ventaActual = JSON.parse(JSON.stringify(v));
        this.dialogVentaVisible = true;
    }

    guardarVenta() {
        if (this.ventaActual.id_venta) {
            this.http.put(`${this.apiUrl}/${this.ventaActual.id_venta}`, this.ventaActual, this.getHeaders()).subscribe(() => {
                this.loadVentas();
                this.dialogVentaVisible = false;
            });
        } else {
            this.http.post(this.apiUrl, this.ventaActual, this.getHeaders()).subscribe(() => {
                this.loadVentas();
                this.dialogVentaVisible = false;
            });
        }
    }

    removeVenta(v: any) {
        if (!confirm('¿Eliminar venta?')) return;
        this.http.delete(`${this.apiUrl}/${v.id_venta}`, this.getHeaders()).subscribe(() => this.loadVentas());
    }

    // ==== Detalles ====
    agregarProducto() {
        if (!this.productoSeleccionado || this.cantidad <= 0) return;
        const subtotal = this.cantidad * this.precio_unitario;
        this.ventaActual.detalles.push({
            id_producto: this.productoSeleccionado.id_producto,
            cantidad: this.cantidad,
            precio_unitario: this.precio_unitario,
            subtotal
        });
        this.productoSeleccionado = null;
        this.cantidad = 1;
        this.precio_unitario = 0;
    }

    eliminarDetalle(index: number) {
        this.ventaActual.detalles.splice(index, 1);
    }

    getNombreProducto(id_producto: number): string {
        const p = this.productos.find((prod) => prod.id_producto === id_producto);
        return p ? p.nombreproducto : '';
    }
}
