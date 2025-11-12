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
    selector: 'app-proveedor',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, ToastModule],
    providers: [MessageService],
    template: `
        <style>
            @keyframes bounce {
                0%,
                20%,
                50%,
                80%,
                100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-8px);
                }
                60% {
                    transform: translateY(-4px);
                }
            }
            .animate-bounce {
                animation: bounce 1.5s infinite;
            }
        </style>

        <p-toast></p-toast>

        <div class="p-4">
            <h2 class="text-xl font-bold mb-3">Gestión de Proveedores</h2>

            <!-- 🔍 FILTRO -->
            <div class="flex justify-between items-center mb-3">
                <button pButton label="Nuevo Proveedor" icon="pi pi-plus" (click)="openProveedorNew()"></button>
                <span class="p-input-icon-left">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" placeholder="Buscar proveedor..." [(ngModel)]="filtroProveedor" (input)="filtrarProveedores()" />
                </span>
            </div>

            <!-- 📋 TABLA DE PROVEEDORES -->
            <p-table [value]="proveedoresFiltrados" [paginator]="true" [rows]="8" [responsiveLayout]="'scroll'">
                <ng-template pTemplate="header">
                    <tr>
                        <th>ID</th>
                        <th>Empresa</th>
                        <th>Contacto</th>
                        <th>Mail</th>
                        <th>Teléfono</th>
                        <th>Dirección</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-prov>
                    <tr>
                        <td>{{ prov.id_proveedor }}</td>
                        <td>{{ prov.empresa }}</td>
                        <td>{{ prov.contacto }}</td>
                        <td>{{ prov.mail }}</td>
                        <td>{{ prov.telefono }}</td>
                        <td>{{ prov.direccion }}</td>
                        <td>
                            <button pButton icon="pi pi-pencil" class="p-button-text" (click)="editProveedor(prov)"></button>
                            <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="removeProveedor(prov)"></button>
                            <button pButton icon="pi pi-box" class="p-button-text" (click)="openProductosDialog(prov)"></button>
                            <button pButton icon="pi pi-file-pdf" class="p-button-text p-button-help" (click)="generarReporteProveedor(prov)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <!-- 🔹 BOTÓN PARA VER CATÁLOGO -->
            <div class="text-center mt-6">
                <button pButton label="📦 Ver Catálogo General" icon="pi pi-shopping-bag" class="p-button-rounded p-button-success p-button-lg animate-bounce" (click)="dialogCatalogoVisible = true"></button>
            </div>

            <!-- Dialog de Proveedor -->
            <p-dialog header="Proveedor" [(visible)]="dialogProveedorVisible" [modal]="true" [closable]="false" [style]="{ width: '400px' }">
                <div class="p-fluid">
                    <div class="field"><label>Empresa</label><input pInputText [(ngModel)]="proveedorSeleccionado.empresa" /></div>
                    <br />
                    <div class="field"><label>Contacto</label><input pInputText [(ngModel)]="proveedorSeleccionado.contacto" /></div>
                    <br />
                    <div class="field"><label>Mail</label><input pInputText [(ngModel)]="proveedorSeleccionado.mail" /></div>
                    <br />
                    <div class="field"><label>Teléfono</label><input pInputText [(ngModel)]="proveedorSeleccionado.telefono" /></div>
                    <br />
                    <div class="field"><label>Dirección</label><input pInputText [(ngModel)]="proveedorSeleccionado.direccion" /></div>
                    <br />
                </div>
                <ng-template pTemplate="footer">
                    <button pButton label="Cancelar" class="p-button-text" (click)="dialogProveedorVisible = false"></button>
                    <button pButton label="Guardar" (click)="saveProveedor()"></button>
                </ng-template>
            </p-dialog>

            <!-- Dialog de Productos -->
            <p-dialog header="Productos del Proveedor" [(visible)]="dialogProductosVisible" [modal]="true" [style]="{ width: '850px' }">
                <div *ngIf="proveedorSeleccionado">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="text-lg font-semibold">Proveedor: {{ proveedorSeleccionado.empresa }}</h3>
                        <button pButton label="Reporte PDF" icon="pi pi-file-pdf" class="p-button-help" (click)="generarReporteProductos()"></button>
                    </div>

                    <button pButton label="Nuevo Producto" icon="pi pi-plus" (click)="openProductoNew()" class="mb-2"></button>

                    <!-- 🔍 Filtro productos -->
                    <div class="mb-2">
                        <span class="p-input-icon-left">
                            <i class="pi pi-search"></i>
                            <input pInputText placeholder="Buscar producto..." [(ngModel)]="filtroProducto" (input)="filtrarProductos()" />
                        </span>
                    </div>

                    <ng-container *ngIf="productosFiltrados.length > 0; else noProductos">
                        <p-table [value]="productosFiltrados" [paginator]="true" [rows]="6" [responsiveLayout]="'scroll'">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th>Acciones</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-prod>
                                <tr>
                                    <td>{{ prod.id_producto }}</td>
                                    <td>{{ prod.nombreproducto }}</td>
                                    <td>{{ prod.descripcion }}</td>
                                    <td>{{ prod.precio }}</td>
                                    <td>{{ prod.stock }}</td>
                                    <td>
                                        <button pButton icon="pi pi-pencil" class="p-button-text" (click)="editProducto(prod)"></button>
                                        <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="removeProducto(prod)"></button>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </ng-container>

                    <ng-template #noProductos>
                        <p class="mt-3 text-gray-600">⚠️ Este proveedor aún no tiene productos registrados.</p>
                    </ng-template>
                </div>
            </p-dialog>

            <!-- Dialog Producto -->
            <p-dialog header="Producto" [(visible)]="dialogProductoVisible" [modal]="true" [style]="{ width: '400px' }">
                <div class="p-fluid">
                    <div class="field"><label>Nombre</label><input pInputText [(ngModel)]="productoSeleccionado.nombreproducto" /></div>
                    <br />
                    <div class="field"><label>Descripción</label><input pInputText [(ngModel)]="productoSeleccionado.descripcion" /></div>
                    <br />
                    <div class="field"><label>Precio</label><input pInputText type="number" [(ngModel)]="productoSeleccionado.precio" /></div>
                    <br />
                    <div class="field"><label>Stock</label><input pInputText type="number" [(ngModel)]="productoSeleccionado.stock" /></div>
                    <br />
                </div>
                <ng-template pTemplate="footer">
                    <button pButton label="Cancelar" class="p-button-text" (click)="dialogProductoVisible = false"></button>
                    <button pButton label="Guardar" (click)="saveProducto()"></button>
                </ng-template>
            </p-dialog>

            <!-- 🔹 DIALOG CATÁLOGO -->
            <p-dialog header="🛍️ Catálogo General de Productos" [(visible)]="dialogCatalogoVisible" [modal]="true" [style]="{ width: '900px' }">
                <div *ngIf="catalogo.length > 0; else sinCatalogo">
                    <div class="grid grid-cols-3 gap-4">
                        <div *ngFor="let p of catalogo" class="border rounded-lg p-3 shadow-md bg-white hover:shadow-xl transition-transform transform hover:scale-105">
                            <h3 class="font-semibold text-lg mb-1 text-gray-800">{{ p.nombreproducto }}</h3>
                            <p class="text-sm text-gray-700 mb-1">{{ p.descripcion }}</p>
                            <p class="text-sm text-gray-500 mb-1">Proveedor: {{ p.empresa }}</p>
                            <p class="font-semibold text-green-600">Precio: {{ p.precio }} Bs</p>
                            <div *ngIf="p.stock > 0; else agotadoEtiqueta">
                                <p class="text-sm text-gray-600">Stock: {{ p.stock }}</p>
                            </div>

                            <ng-template #agotadoEtiqueta>
                                <span class="px-2 py-1 bg-red-500 text-white rounded text-sm font-semibold">AGOTADO</span>
                            </ng-template>
                        </div>
                    </div>
                </div>

                <ng-template #sinCatalogo>
                    <p class="mt-3 text-center text-gray-600">⚠️ No hay productos disponibles en el catálogo.</p>
                </ng-template>

                <ng-template pTemplate="footer">
                    <button pButton label="Cerrar" icon="pi pi-times" class="p-button-text" (click)="dialogCatalogoVisible = false"></button>
                </ng-template>
            </p-dialog>
        </div>
    `
})
export class ProveedorComponent implements OnInit {
    apiUrl = 'http://localhost:3000/api/proveedores';
    proveedores: any[] = [];
    proveedoresFiltrados: any[] = [];
    productos: any[] = [];
    productosFiltrados: any[] = [];
    catalogo: any[] = [];

    filtroProveedor = '';
    filtroProducto = '';

    dialogProveedorVisible = false;
    dialogProductosVisible = false;
    dialogProductoVisible = false;
    dialogCatalogoVisible = false;

    proveedorSeleccionado: any = {};
    productoSeleccionado: any = {};

    constructor(
        private http: HttpClient,
        private msg: MessageService
    ) {}

    ngOnInit() {
        this.loadProveedores();
        this.loadCatalogo();
    }

    private getHeaders() {
        const token = localStorage.getItem('token');
        return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    }

    // ==== PROVEEDORES ====
    loadProveedores() {
        this.http.get<any[]>(this.apiUrl, this.getHeaders()).subscribe({
            next: (r) => {
                this.proveedores = r;
                this.proveedoresFiltrados = r;
            },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pueden cargar proveedores' })
        });
    }

    filtrarProveedores() {
        const f = this.filtroProveedor.toLowerCase();
        this.proveedoresFiltrados = this.proveedores.filter((p) => p.empresa.toLowerCase().includes(f) || p.contacto.toLowerCase().includes(f) || p.mail.toLowerCase().includes(f));
    }

    openProveedorNew() {
        this.proveedorSeleccionado = {};
        this.dialogProveedorVisible = true;
    }
    editProveedor(p: any) {
        this.proveedorSeleccionado = { ...p };
        this.dialogProveedorVisible = true;
    }

    saveProveedor() {
        const data = this.proveedorSeleccionado;
        const req = data.id_proveedor ? this.http.put(`${this.apiUrl}/${data.id_proveedor}`, data, this.getHeaders()) : this.http.post(this.apiUrl, data, this.getHeaders());

        req.subscribe({
            next: () => {
                this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor guardado' });
                this.dialogProveedorVisible = false;
                this.loadProveedores();
            }
        });
    }

    removeProveedor(p: any) {
        if (!confirm('¿Eliminar proveedor?')) return;
        this.http.delete(`${this.apiUrl}/${p.id_proveedor}`, this.getHeaders()).subscribe({
            next: () => {
                this.msg.add({ severity: 'info', summary: 'Eliminado' });
                this.loadProveedores();
            }
        });
    }

    generarReporteProveedor(prov: any) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFontSize(16);
        doc.text('REPORTE DE PROVEEDOR', pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Empresa: ${prov.empresa}`, 14, 30);
        doc.text(`Contacto: ${prov.contacto}`, 14, 38);
        doc.text(`Mail: ${prov.mail}`, 14, 46);
        doc.text(`Teléfono: ${prov.telefono}`, 14, 54);
        doc.text(`Dirección: ${prov.direccion}`, 14, 62);
        doc.save(`proveedor_${prov.id_proveedor}.pdf`);
    }

    // ==== PRODUCTOS ====
    openProductosDialog(p: any) {
        this.proveedorSeleccionado = p;
        this.dialogProductosVisible = true;
        this.loadProductos(p.id_proveedor);
    }

    loadProductos(idProveedor: number) {
        this.http.get<any[]>(`${this.apiUrl}/${idProveedor}/productos`, this.getHeaders()).subscribe({
            next: (r) => {
                this.productos = r;
                this.productosFiltrados = r;
            },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pueden cargar productos' })
        });
    }

    filtrarProductos() {
        const f = this.filtroProducto.toLowerCase();
        this.productosFiltrados = this.productos.filter((p) => p.nombreproducto.toLowerCase().includes(f) || p.descripcion.toLowerCase().includes(f));
    }

    openProductoNew() {
        this.productoSeleccionado = {};
        this.dialogProductoVisible = true;
    }
    editProducto(p: any) {
        this.productoSeleccionado = { ...p };
        this.dialogProductoVisible = true;
    }

    saveProducto() {
        const p = this.productoSeleccionado;
        const req = p.id_producto ? this.http.put(`${this.apiUrl}/productos/${p.id_producto}`, p, this.getHeaders()) : this.http.post(`${this.apiUrl}/${this.proveedorSeleccionado.id_proveedor}/productos`, p, this.getHeaders());

        req.subscribe({
            next: () => {
                this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Producto guardado' });
                this.dialogProductoVisible = false;
                this.loadProductos(this.proveedorSeleccionado.id_proveedor);
            }
        });
    }

    removeProducto(p: any) {
        if (!confirm('¿Eliminar producto?')) return;
        this.http.delete(`${this.apiUrl}/productos/${p.id_producto}`, this.getHeaders()).subscribe({
            next: () => {
                this.msg.add({ severity: 'info', summary: 'Eliminado' });
                this.loadProductos(this.proveedorSeleccionado.id_proveedor);
            }
        });
    }

    generarReporteProductos() {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFontSize(16);
        doc.text(`PRODUCTOS - ${this.proveedorSeleccionado.empresa}`, pageWidth / 2, 15, { align: 'center' });

        const columnas = ['Nombre', 'Descripción', 'Precio', 'Stock'];
        const filas = this.productos.map((p) => [p.nombreproducto, p.descripcion, p.precio, p.stock]);

        (autoTable as any)(doc, { head: [columnas], body: filas, startY: 25, theme: 'grid' });
        doc.save(`productos_${this.proveedorSeleccionado.empresa}.pdf`);
    }

    // ==== CATÁLOGO ====
    loadCatalogo() {
        this.http.get<any[]>('http://localhost:3000/api/catalogo', this.getHeaders()).subscribe({
            next: (r) => (this.catalogo = r),
            error: () => console.warn('No se pudo cargar el catálogo (endpoint opcional)')
        });
    }
}
