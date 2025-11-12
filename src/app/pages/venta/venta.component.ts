// src/app/pages/venta/venta.component.ts
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
            <div class="flex justify-between items-center mb-3">
                <input type="text" pInputText placeholder="Buscar..." [(ngModel)]="filtroGlobal" (input)="dt.filterGlobal(filtroGlobal, 'contains')" class="p-inputtext w-60" />
            </div>
            <p-table #dt [value]="ventas" [paginator]="true" [rows]="6" [globalFilterFields]="['cliente_nombre','empleado_nombre','fecha']" [responsiveLayout]="'scroll'">
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
                            <button pButton icon="pi pi-file-pdf" class="p-button-text p-button-danger" (click)="generarReporteVenta(v)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <!-- Dialog de Venta -->
            <p-dialog header="Venta" [(visible)]="dialogVentaVisible" [modal]="true" [closable]="false" [style]="{ width: '700px' }">
                <div class="p-fluid space-y-3">
                    <div class="field">
                        <label style="margin-right:10px;">Cliente</label>
                        <select [(ngModel)]="ventaActual.id_cliente" class="p-inputtext w-full bg-surface-0 dark:bg-surface-900 text-gray-900 dark:text-gray-100 border border-gray-300 rounded-md p-2">
                            <option [ngValue]="null" disabled selected>Seleccione un Cliente</option>
                            <option *ngFor="let c of clientes" [value]="c.id_cliente">{{ c.razonsocial }}</option>
                        </select>
                    </div>
                    <div class="field">
                        <label style="margin-right:10px;">Empleado</label>
                        <select [(ngModel)]="ventaActual.id_empleado" class="p-inputtext w-full bg-surface-0 dark:bg-surface-900 text-gray-900 dark:text-gray-100 border border-gray-300 rounded-md p-2">
                            <option [ngValue]="null" disabled selected>Seleccione un Empleado</option>
                            <option *ngFor="let e of empleados" [value]="e.id_empleado">{{ e.nombre }}</option>
                        </select>
                    </div>
                    <div class="field">
                        <label style="margin-right:10px;">Fecha</label>
                        <input type="date" [(ngModel)]="ventaActual.fecha" class="p-inputtext w-full bg-surface-0 dark:bg-surface-900 text-gray-900 dark:text-gray-100 border border-gray-300 rounded-md p-2" />
                    </div>

                    <h3 class="font-semibold mt-4 mb-2">Agregar Producto</h3>
                    <div class="grid grid-cols-4 gap-2 items-end">
                        <select [(ngModel)]="productoSeleccionado" class="col-span-2 p-inputtext bg-surface-0 dark:bg-surface-900 text-gray-900 dark:text-gray-100 border border-gray-300 rounded-md p-2">
                            <option [ngValue]="null" disabled selected>Seleccione un producto</option>
                            <option *ngFor="let p of productos" [ngValue]="p">{{ p.nombreproducto }}</option>
                        </select>
                        <label class="font-semibold">Cantidad</label>
                        <input type="number" [(ngModel)]="cantidad" placeholder="Cantidad" class="p-inputtext bg-surface-0 dark:bg-surface-900 text-gray-900 dark:text-gray-100 border border-gray-300 rounded-md p-2" />
                        <label class="font-semibold">Precio unitario</label>
                        <input type="number" [(ngModel)]="precio_unitario" placeholder="Precio unitario" class="p-inputtext bg-surface-0 dark:bg-surface-900 text-gray-900 dark:text-gray-100 border border-gray-300 rounded-md p-2" />
                        <button pButton label="Agregar" (click)="agregarProducto()" class="col-span-4 mt-2"></button>
                    </div>

                    <h4 class="font-semibold mt-4">Detalle de Venta</h4>
                    <p-table [value]="ventaActual.detalles" [responsiveLayout]="'scroll'">
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
    apiUrl = 'http://localhost:3000/api/ventas';
    ventas: any[] = [];
    clientes: any[] = [];
    empleados: any[] = [];
    productos: any[] = [];

    dialogVentaVisible = false;
    ventaActual: any = { id_cliente: 0, id_empleado: 0, fecha: '', detalles: [] };
    productoSeleccionado: any = null;
    cantidad: number = 1;
    precio_unitario: number = 0;
    filtroGlobal: string = '';

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
        this.http.get<any[]>('http://localhost:3000/api/clientes', this.getHeaders()).subscribe((r) => (this.clientes = r));
    }
    loadEmpleados() {
        this.http.get<any[]>('http://localhost:3000/api/empleados', this.getHeaders()).subscribe((r) => (this.empleados = r));
    }
    loadProductos() {
        this.http.get<any[]>('http://localhost:3000/api/productos', this.getHeaders()).subscribe((r) => (this.productos = r));
    }

    // ==== Ventas ====
    openVentaNew() {
        this.ventaActual = { id_cliente: 0, id_empleado: 0, fecha: '', detalles: [] };
        this.dialogVentaVisible = true;
    }

    editVenta(v: any) {
        // Cargar venta completa desde backend con detalles
        this.http.get<any>(`${this.apiUrl}/${v.id_venta}`, this.getHeaders()).subscribe((data) => {
            this.ventaActual = {
                ...data.venta,
                detalles: data.detalles || []
            };
            this.dialogVentaVisible = true;
        });
    }

    guardarVenta() {
        if (this.ventaActual.id_venta) {
            this.http.put(`${this.apiUrl}/${this.ventaActual.id_venta}`, this.ventaActual, this.getHeaders()).subscribe(() => {
                this.loadVentas();
                this.dialogVentaVisible = false;
                this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Venta actualizada' });
            });
        } else {
            this.http.post(this.apiUrl, this.ventaActual, this.getHeaders()).subscribe(() => {
                this.loadVentas();
                this.dialogVentaVisible = false;
                this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Venta creada' });
                this.ventaActual = { id_cliente: 0, id_empleado: 0, fecha: '', detalles: [] };
            });
        }
    }

    removeVenta(v: any) {
        if (!confirm('¿Eliminar venta?')) return;
        this.http.delete(`${this.apiUrl}/${v.id_venta}`, this.getHeaders()).subscribe(() => {
            this.loadVentas();
            this.msg.add({ severity: 'warn', summary: 'Eliminado', detail: 'Venta eliminada' });
        });
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

    generarReporteVenta(v: any) {
        // 1️⃣ Traer la venta con su detalle completo
        this.http.get<any>(`${this.apiUrl}/${v.id_venta}`, this.getHeaders()).subscribe((data) => {
            const venta = data.venta;
            const detalles = data.detalles || [];

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Encabezado
            doc.setFontSize(16);
            doc.text('REPORTE DE VENTA', pageWidth / 2, 15, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, 14, 25);

            // Datos de la venta
            doc.setFontSize(12);
            doc.text(`ID Venta: ${venta.id_venta}`, 14, 35);
            doc.text(`Cliente: ${venta.cliente_nombre || '---'}`, 14, 42);
            doc.text(`Empleado: ${venta.empleado_nombre || '---'}`, 14, 49);
            doc.text(`Fecha: ${venta.fecha || '---'}`, 14, 56);

            // Espaciado
            doc.text('DETALLE DE PRODUCTOS', 14, 68);

            // 2️⃣ Construir tabla de detalle
            const columnas = ['Producto', 'Cantidad', 'Precio U.', 'Subtotal'];
            const filas = detalles.map((d: any) => {
                const producto = this.getNombreProducto(d.id_producto);
                const precio = Number(d.precio_unitario) || 0;
                const subtotal = Number(d.subtotal) || 0;
                const cantidad = Number(d.cantidad) || 0;
                return [producto, cantidad, precio.toFixed(2), subtotal.toFixed(2)];
            });

            (autoTable as any)(doc, {
                head: [columnas],
                body: filas,
                startY: 72,
                theme: 'grid'
            });

            // Calcular total
            const total = detalles.reduce((acc: number, d: any) => acc + d.subtotal, 0);
            const finalY = (doc as any).lastAutoTable.finalY + 10;

            doc.setFontSize(12);
            doc.text(`TOTAL: ${Number(total).toFixed(2)} Bs`, pageWidth - 14, finalY, { align: 'right' });

            // Pie de página
            doc.setFontSize(9);
            doc.text('Sistema de Ventas - Reporte generado automáticamente', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

            // 3️⃣ Descargar PDF
            doc.save(`venta_${venta.id_venta}.pdf`);
        });
    }
}
