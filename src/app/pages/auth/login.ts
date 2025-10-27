import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RippleModule,
    AppFloatingConfigurator,
  ],
  template: `
    <app-floating-configurator></app-floating-configurator>
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
      <div class="flex flex-col items-center justify-center">
        <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
          <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
            <div class="text-center mb-8">
              <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome to PrimeLand!</div>
              <span class="text-muted-color font-medium">Sign in to continue</span>
            </div>

            <div>
              <label for="nombre_usuario" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Usuario</label>
              <input pInputText id="nombre_usuario" type="text" placeholder="Nombre de usuario" class="w-full md:w-120 mb-8" [(ngModel)]="nombre_usuario" />

              <label for="pasword" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Contraseña</label>
              <p-password id="pasword" [(ngModel)]="pasword" placeholder="Contraseña" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

              <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                <div class="flex items-center">
                  <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
                  <label for="rememberme1">Recordarme</label>
                </div>
                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Olvidé mi contraseña</span>
              </div>

              <p-button label="Iniciar sesión" styleClass="w-full" (click)="onSubmit()"></p-button>
              <div *ngIf="error" class="text-red-600 mt-2">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Login {
  nombre_usuario: string = '';
  pasword: string = '';
  checked: boolean = false;
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.authService.login(this.nombre_usuario, this.pasword).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/']); // Redirige al home
      },
      error: (err) => {
        if (err.error?.msg) this.error = err.error.msg;
        else this.error = 'Error en el servidor';
      }
    });
  }
}
