import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioService } from '../services/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class CompradorProveedorGuard implements CanActivate {
  constructor( private usuarioService:UsuarioService,
    private router:Router ){ }
    canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): boolean {
      if(this.usuarioService.token  &&  (localStorage.getItem('usuario')==="comprador" || localStorage.getItem('usuario')==="proveedor" )){
        return true;
      }else{
        this.router.navigateByUrl('/')
      }
    }
  
}
