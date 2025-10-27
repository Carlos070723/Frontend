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
  selector: 'app-proveedor',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, ToastModule],
  providers: [MessageService],
  template: `
  <p-toast></p-toast>

  <div class="p-4">
    <h2 class="text-xl font-bold mb-3">Gestión de Proveedores</h2>

    <button pButton label="Nuevo Proveedor" icon="pi pi-plus" (click)="openProveedorNew()" class="mb-3"></button>

    <p-table [value]="proveedores" [paginator]="true" [rows]="8" [responsiveLayout]="'scroll'">
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
          <td>{{prov.id_proveedor}}</td>
          <td>{{prov.empresa}}</td>
          <td>{{prov.contacto}}</td>
          <td>{{prov.mail}}</td>
          <td>{{prov.telefono}}</td>
          <td>{{prov.direccion}}</td>
          <td>
            <button pButton icon="pi pi-pencil" class="p-button-text" (click)="editProveedor(prov)"></button>
            <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="removeProveedor(prov)"></button>
            <button pButton label="Productos" icon="pi pi-box" class="p-button-text" (click)="openProductosDialog(prov)"></button>
          </td>
        </tr>
      </ng-template>
    </p-table>

    <!-- Dialog de Proveedor -->
    <p-dialog header="Proveedor" [(visible)]="dialogProveedorVisible" [modal]="true" [closable]="false" [style]="{width:'400px'}">
      <div class="p-fluid">
        <div class="field"><label>Empresa</label><input pInputText [(ngModel)]="proveedorSeleccionado.empresa"/></div>
        <div class="field"><label>Contacto</label><input pInputText [(ngModel)]="proveedorSeleccionado.contacto"/></div>
        <div class="field"><label>Mail</label><input pInputText [(ngModel)]="proveedorSeleccionado.mail"/></div>
        <div class="field"><label>Teléfono</label><input pInputText [(ngModel)]="proveedorSeleccionado.telefono"/></div>
        <div class="field"><label>Dirección</label><input pInputText [(ngModel)]="proveedorSeleccionado.direccion"/></div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="dialogProveedorVisible=false"></button>
        <button pButton label="Guardar" (click)="saveProveedor()"></button>
      </ng-template>
    </p-dialog>

    <!-- Dialog de Productos -->
    <p-dialog header="Productos del Proveedor" [(visible)]="dialogProductosVisible" [modal]="true" [style]="{width:'800px'}">
      <div *ngIf="proveedorSeleccionado">
        <h3 class="text-lg font-semibold mb-2">Proveedor: {{proveedorSeleccionado.empresa}}</h3>
        <button pButton label="Nuevo Producto" icon="pi pi-plus" (click)="openProductoNew()" class="mb-2"></button>

        <ng-container *ngIf="productos.length > 0; else noProductos">
          <p-table [value]="productos" [paginator]="true" [rows]="6" [responsiveLayout]="'scroll'">
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
                <td>{{prod.id_producto}}</td>
                <td>{{prod.nombreproducto}}</td>
                <td>{{prod.descripcion}}</td>
                <td>{{prod.precio}}</td>
                <td>{{prod.stock}}</td>
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

    <!-- Dialog de Producto -->
    <p-dialog header="Producto" [(visible)]="dialogProductoVisible" [modal]="true" [style]="{width:'400px'}">
      <div class="p-fluid">
        <div class="field"><label>Nombre</label><input pInputText [(ngModel)]="productoSeleccionado.nombreproducto"/></div>
        <div class="field"><label>Descripción</label><input pInputText [(ngModel)]="productoSeleccionado.descripcion"/></div>
        <div class="field"><label>Precio</label><input pInputText type="number" [(ngModel)]="productoSeleccionado.precio"/></div>
        <div class="field"><label>Stock</label><input pInputText type="number" [(ngModel)]="productoSeleccionado.stock"/></div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="dialogProductoVisible=false"></button>
        <button pButton label="Guardar" (click)="saveProducto()"></button>
      </ng-template>
    </p-dialog>
  </div>
  `
})
export class ProveedorComponent implements OnInit {
  apiUrl = 'http://localhost:3000/api/proveedores';
  proveedores: any[] = [];
  productos: any[] = [];

  dialogProveedorVisible = false;
  dialogProductosVisible = false;
  dialogProductoVisible = false;

  proveedorSeleccionado: any = {};
  productoSeleccionado: any = {};

  constructor(private http: HttpClient, private msg: MessageService) {}

  ngOnInit() { this.loadProveedores(); }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }

  // ==== PROVEEDORES ====
  loadProveedores() {
    this.http.get<any[]>(this.apiUrl, this.getHeaders()).subscribe({
      next: r => this.proveedores = r,
      error: () => this.msg.add({severity:'error', summary:'Error', detail:'No se pueden cargar proveedores'})
    });
  }

  openProveedorNew() { this.proveedorSeleccionado = {}; this.dialogProveedorVisible = true; }

  editProveedor(p: any) { this.proveedorSeleccionado = {...p}; this.dialogProveedorVisible = true; }

  saveProveedor() {
    const data = this.proveedorSeleccionado;
    if (data.id_proveedor) {
      this.http.put(`${this.apiUrl}/${data.id_proveedor}`, data, this.getHeaders()).subscribe({
        next: () => {
          this.msg.add({severity:'success', summary:'Actualizado', detail:'Proveedor actualizado'});
          this.dialogProveedorVisible = false;
          this.loadProveedores();
        }
      });
    } else {
      this.http.post(this.apiUrl, data, this.getHeaders()).subscribe({
        next: () => {
          this.msg.add({severity:'success', summary:'Creado', detail:'Proveedor registrado'});
          this.dialogProveedorVisible = false;
          this.loadProveedores();
        }
      });
    }
  }

  removeProveedor(p: any) {
    if (!confirm('¿Eliminar proveedor?')) return;
    this.http.delete(`${this.apiUrl}/${p.id_proveedor}`, this.getHeaders()).subscribe({
      next: () => {
        this.msg.add({severity:'info', summary:'Eliminado', detail:'Proveedor eliminado'});
        this.loadProveedores();
      }
    });
  }

  // ==== PRODUCTOS ====
  openProductosDialog(p: any) {
    this.proveedorSeleccionado = p;
    this.dialogProductosVisible = true;
    this.loadProductos(p.id_proveedor);
  }

  loadProductos(idProveedor: number) {
    this.http.get<any[]>(`${this.apiUrl}/${idProveedor}/productos`, this.getHeaders()).subscribe({
      next: r => this.productos = r,
      error: () => this.msg.add({severity:'error', summary:'Error', detail:'No se pueden cargar productos'})
    });
  }

  openProductoNew() { this.productoSeleccionado = {}; this.dialogProductoVisible = true; }

  editProducto(p: any) { this.productoSeleccionado = {...p}; this.dialogProductoVisible = true; }

  saveProducto() {
    const p = this.productoSeleccionado;
    if (p.id_producto) {
      this.http.put(`${this.apiUrl}/productos/${p.id_producto}`, p, this.getHeaders()).subscribe({
        next: () => {
          this.msg.add({severity:'success', summary:'Actualizado', detail:'Producto actualizado'});
          this.dialogProductoVisible = false;
          this.loadProductos(this.proveedorSeleccionado.id_proveedor);
        }
      });
    } else {
      this.http.post(`${this.apiUrl}/${this.proveedorSeleccionado.id_proveedor}/productos`, p, this.getHeaders()).subscribe({
        next: () => {
          this.msg.add({severity:'success', summary:'Creado', detail:'Producto registrado'});
          this.dialogProductoVisible = false;
          this.loadProductos(this.proveedorSeleccionado.id_proveedor);
        }
      });
    }
  }

  removeProducto(p: any) {
    if (!confirm('¿Eliminar producto?')) return;
    this.http.delete(`${this.apiUrl}/productos/${p.id_producto}`, this.getHeaders()).subscribe({
      next: () => {
        this.msg.add({severity:'info', summary:'Eliminado', detail:'Producto eliminado'});
        this.loadProductos(this.proveedorSeleccionado.id_proveedor);
      }
    });
  }
}
