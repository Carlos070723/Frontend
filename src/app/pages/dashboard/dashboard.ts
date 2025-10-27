import { Component } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        CarouselModule,
        StatsWidget,
        RecentSalesWidget,
        BestSellingWidget,
        RevenueStreamWidget,
        NotificationsWidget
    ],
    template: `
        <!-- Vista cuando NO hay sesión -->
        <div *ngIf="!isLoggedIn" class="flex flex-col items-center justify-center min-h-screen gap-12">
            <h1 class="text-6xl font-extrabold text-center text-indigo-600 animate-pulse">SAKAI</h1>
            
            <p-carousel [value]="cars" [numVisible]="1" [numScroll]="1" [circular]="true" [autoplayInterval]="3000" class="w-full md:w-3/4">
                <ng-template pTemplate="item" let-car>
                    <div class="flex justify-center">
                        <img [src]="car.img" [alt]="car.name" class="w-96 h-auto rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-500"/>
                    </div>
                </ng-template>
            </p-carousel>
        </div>

        <!-- Vista cuando hay sesión -->
        <div *ngIf="isLoggedIn" class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-sales-widget />
                <app-best-selling-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-revenue-stream-widget />
                <app-notifications-widget />
            </div>
        </div>
    `
})
export class Dashboard {
    isLoggedIn: boolean = false;

    // Lista de autos con rutas locales en assets
    cars = [
        { name: 'Tesla Model 3', img: 'assets/cars/tesla-model3.jpeg' },
        { name: 'Ford F-150', img: 'assets/cars/ford-f150.jpeg' },
        { name: 'BMW X5', img: 'assets/cars/bmw-x5.jpeg' },
        { name: 'Toyota Corolla', img: 'assets/cars/toyota-corolla.jpeg' },
        { name: 'Honda Civic', img: 'assets/cars/honda-civic.jpeg' }
    ];

    ngOnInit() {
        this.isLoggedIn = !!localStorage.getItem('token');
    }
}


