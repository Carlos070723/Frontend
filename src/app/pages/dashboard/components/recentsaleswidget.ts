import { Component } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

interface Car {
    image: string;
    name: string;
    price: number;
}

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    template: `<div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">Ventas Recientes</div>
        <p-table [value]="cars" [paginator]="true" [rows]="5" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th>Imagen</th>
                    <th pSortableColumn="name">Nombre <p-sortIcon field="name"></p-sortIcon></th>
                    <th pSortableColumn="price">Precio <p-sortIcon field="price"></p-sortIcon></th>
                    <th>Ver</th>
                </tr>
            </ng-template>
            <ng-template #body let-car>
                <tr>
                    <td style="width: 15%; min-width: 5rem;">
                        <img src="assets/cars/{{ car.image }}" class="shadow-lg" alt="{{ car.name }}" width="50" />
                    </td>
                    <td style="width: 35%; min-width: 7rem;">{{ car.name }}</td>
                    <td style="width: 35%; min-width: 8rem;">{{ car.price | currency: 'USD' }}</td>
                    <td style="width: 15%;">
                        <button pButton pRipple type="button" icon="pi pi-search" class="p-button p-component p-button-text p-button-icon-only"></button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>`
})
export class RecentSalesWidget {
    cars: Car[] = [
        { image: 'tesla-model3.jpeg', name: 'Tesla Model 3', price: 79000 },
        { image: 'ford-f150.jpeg', name: 'Ford F-150', price: 55000 },
        { image: 'bmw-x5.jpeg', name: 'BMW X5', price: 65000 },
        { image: 'toyota-corolla.jpeg', name: 'Toyota Corolla', price: 25000 },
        { image: 'honda-civic.jpeg', name: 'Honda Civic', price: 27000 },
        { image: 'jeep-wrangler.jpeg', name: 'Jeep Wrangler', price: 45000 }
    ];
}

