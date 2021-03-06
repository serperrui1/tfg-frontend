import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { CarritoService } from '../../services/carrito.service';
import { Incidencia } from '../../models/incidencia';
import { IncidenciaService } from '../../services/incidencia.service';
import { AsistenteTecnico } from '../../models/asistente';
import { Comprador } from '../../models/comprador';
import { Proveedor } from '../../models/proveedor';
import { ChatService } from '../../services/chat.service';
import { Chat } from 'src/app/models/chat';
import { Administrador } from '../../models/administrador';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'
  ]
})
export class NavbarComponent implements OnInit{

  public cuant:number[] = [];
  public temp:number = 0;
  public res:number = 0;
  public misIncidencias: Incidencia[];
  public misChats: Chat[];
  public incidencia: Incidencia;
  public chat: Chat;
  public existeTokenYProveedor= false;
  public mensajesNoLeidos= false;
  public incidenciasNoLeidas= false;
  public usuario:string;
  public token: string;
  public aT: AsistenteTecnico;
  public admin: Administrador;
  public comp: Comprador;
  public prov: Proveedor;
  sidebar:boolean = false;
  sidebarMovil:boolean = false;
  
  constructor(private fb:FormBuilder,
    private usuarioService: UsuarioService,
    private router:Router,
    private carritoService: CarritoService,
    private incidenciaService: IncidenciaService,
    private chatService: ChatService) { 
      this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
      };
      this.proveedor();
      this.usuario =localStorage.getItem('usuario');
      this.token =localStorage.getItem('token');
  }

  public buscadorForm = this.fb.group({
    producto:[''],
    busqueda:['producto']
  })
  
  async ngOnInit() {
    this.notifica();
    if(localStorage.getItem("token")){
      this.admin = await this.usuarioService.getAdministrador();
      await this.hayChatsSinLeer();
      await this.hayIncidenciasSinLeer();
    }
    

  }

  notifica(){
    this.cuant = this.carritoService.getCantidades();
    if(this.cuant != null){
      for (let i = 0; i < this.cuant.length; i++) {
        this.temp = this.temp + this.cuant[i].valueOf();
      }
    }
    this.res = this.temp;
  }

  async hayIncidenciasSinLeer(){
    this.misIncidencias = await (this.incidenciaService.getMisIncidencias());
    this.aT = await this.usuarioService.getAsistenteTecnico();
    if(this.aT === null){
      this.comp = await this.usuarioService.getComprador();
      if(this.comp === null){
        this.prov = await this.usuarioService.getProveedor();
      }
    }
    if(this.comp){
      if(this.misIncidencias.length>0){
      for (let i = 0; i < this.misIncidencias.length; i++) {
        this.incidencia = this.misIncidencias[i];
        if(!this.incidencia.leida && this.incidencia.ultimoEmisor != this.comp.uid){
          this.incidenciasNoLeidas = true;
        }else{
          this.incidenciasNoLeidas = false;
        }
      }}
    }
    if(this.prov){
      if(this.misIncidencias.length>0){
      for (let i = 0; i < this.misIncidencias.length; i++) {
        this.incidencia = this.misIncidencias[i];
        if(!this.incidencia.leida && this.incidencia.ultimoEmisor != this.prov.uid){
          this.incidenciasNoLeidas = true;
        }else{
          this.incidenciasNoLeidas = false;
        }
      }
    }
    }
    if(this.aT ){
      for (let i = 0; i < this.misIncidencias.length; i++) {
        this.incidencia = this.misIncidencias[i];
        if(!this.incidencia.leida && this.incidencia.ultimoEmisor != this.aT.uid){
          this.incidenciasNoLeidas = true;
        }else{
          this.incidenciasNoLeidas = false;
        }
      }
    }
  }

  async hayChatsSinLeer(){

    this.comp = await this.usuarioService.getComprador();
    if(this.comp === null){
      this.prov = await this.usuarioService.getProveedor();
    }

    if(this.comp){
      this.misChats = await (this.chatService.getMisChats());
      for (let i = 0; i < this.misChats.length; i++) {
        this.chat = this.misChats[i];
        if(!this.chat.leido && this.chat.ultimoEmisor != this.comp.uid){
          this.mensajesNoLeidos = true;
        }else{
          this.mensajesNoLeidos = false;
        }
      }
    }

    if(this.prov){
      this.misChats = await (this.chatService.getMisChats());
      for (let i = 0; i < this.misChats.length; i++) {
        this.chat = this.misChats[i];
        if(!this.chat.leido && this.chat.ultimoEmisor != this.prov.uid){
          this.mensajesNoLeidos = true;
        }else{
          this.mensajesNoLeidos = false;
        }
      }
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cuant']) {
        this.notifica();
    }
    if (changes['incicendiasNoLeidas']) {
      this.hayIncidenciasSinLeer();
    }
    if (changes['mensajesNoLeidos']) {
      this.hayChatsSinLeer();
    }
    if (changes['misIncidencias']) {
      this.hayIncidenciasSinLeer();
    }
    if (changes['misChats']) {
      this.hayChatsSinLeer();
    }
  }

  logout(){
    this.usuarioService.logout();
  }

  proveedor(){
    if(localStorage.getItem('usuario')==="proveedor" && localStorage.getItem('token')){
      this.existeTokenYProveedor=true;
    }
  }

  buscarProducto( ){
    if(this.buscadorForm.controls['busqueda'].value == "producto"){
      this.router.navigate( ['/buscador',this.buscadorForm.value['producto']] );
    }if(this.buscadorForm.controls['busqueda'].value == "proveedor"){
      let ruta = this.router.url;
      console.log(ruta);
      let sector = "";
      let proveedor = "";
      if(ruta.includes("/proveedores")){
        let rutaSplit = ruta.split("/proveedores/");
        let sector1 = rutaSplit[1].split("/")[0];
        sector = decodeURIComponent(sector1)
        console.log(sector);
      }
      else{
        sector = "todos";
      }
      if(this.buscadorForm.value['producto']==""){
        proveedor = "todos"
      }
      else{
        proveedor = this.buscadorForm.value['producto']
      }
      
      this.router.navigate( ['/proveedores',sector,proveedor] );
    }
    
  }
  abirMenuLateral(){
    document.getElementById("mySidenav").style.width = "350px";
    this.sidebar = true;


  }
  cerrarMenuLateral(){
    document.getElementById("mySidenav").style.width = "0";
    this.sidebar = false;

  }

  abirMenuLateralMovil(){
    document.getElementById("mySidenavMovil").style.width = "350px";
    this.sidebarMovil = true;


  }

  cerrarMenuLateralMovil(){
    document.getElementById("mySidenavMovil").style.width = "0";
    this.sidebarMovil = false;

  }
}
