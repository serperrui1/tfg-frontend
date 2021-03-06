import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { LoginEmpleadoComponent } from './login-empleado/login-empleado.component';
import { RegisterCompradorComponent } from './register-comprador/register-comprador.component';
import { RegisterProveedorComponent } from './register-proveedor/register-proveedor.component';
import { RegisterAsistenteTecnicoComponent } from './register-asistente-tecnico/register-asistente-tecnico.component';

const routes: Routes = [

    { path: 'login', component: LoginComponent },
    { path: 'login/empleado', component: LoginEmpleadoComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'register/comprador', component: RegisterCompradorComponent },
    { path: 'register/proveedor', component: RegisterProveedorComponent },
    { path: 'register/asistente-tecnico', component: RegisterAsistenteTecnicoComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {}
