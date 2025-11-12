import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
    <ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <!-- Usamos notación de índice para showIfLoggedIn -->
            <li app-menuitem 
                *ngIf="!item.separator && (item['showIfLoggedIn'] === undefined || (item['showIfLoggedIn'] && isLoggedIn))" 
                [item]="item" 
                [index]="i" 
                [root]="true">
            </li>
            
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul>
    `
})
export class AppMenu {
    model: MenuItem[] = [];
    isLoggedIn: boolean = false;

    ngOnInit() {
        // Comprobamos si hay token para definir login
        this.isLoggedIn = !!localStorage.getItem('token');

        this.model = [
            {
                items: [
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'Login',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/auth/login']
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Gestión',
                icon: 'pi pi-fw pi-briefcase',
                showIfLoggedIn: true, // propiedad personalizada
                items: [
                    { label: 'Cargos', icon: 'pi pi-fw pi-id-card', routerLink: ['/cargo'] },
                    { label: 'Empleados', icon: 'pi pi-fw pi-users', routerLink: ['/empleado'] },
                    { label: 'Proveedores', icon: 'pi pi-fw pi-users', routerLink: ['/proveedores'] },
                    { label: 'Ventas', icon: 'pi pi-fw pi-cart-plus', routerLink: ['/venta'] },
                    {label: 'Usuario', icon: 'pi pi-fw pi-user',routerLink:['/usuario']}
                ]
            }
        ];
    }
}

