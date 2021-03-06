import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Incidencia } from '../../models/incidencia';
import { IncidenciaService } from '../../services/incidencia.service';
import { AsistenteTecnico } from '../../models/asistente';
import { Comprador } from '../../models/comprador';
import { Proveedor } from '../../models/proveedor';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-incidencia-tarjeta',
  templateUrl: './incidencia-tarjeta.component.html',
  styleUrls: ['./incidencia-tarjeta.component.css']
})

export class IncidenciaTarjetaComponent implements OnInit {

  public incidencia: Incidencia;
  @Input() data: Incidencia;
  @Output() incidenciaSeleccionada: EventEmitter<string>;
  public aT: AsistenteTecnico;
  public comp: Comprador;
  public prov: Proveedor;
  public notificacion: boolean = false;
  public nombreProveedor: string;
  public nombreComprador: string;
  public nombreAsistente: string;
  public apellidosAsistente: string;
  public apellidosComprador: string;

  constructor(private incidenciaService: IncidenciaService,
    private usuarioService: UsuarioService) {
      this.incidenciaSeleccionada = new EventEmitter();
  }
  
  async ngOnInit() {
    this.incidencia = this.data;

    this.aT = await this.usuarioService.getAsistenteTecnico();
    if(this.aT === null){
      this.comp = await this.usuarioService.getComprador();
      if(this.comp === null){
        this.prov = await this.usuarioService.getProveedor();
      }
    }

    if(this.comp && this.incidencia.ultimoEmisor != this.comp.uid && !this.incidencia.leida){
      this.notificacion = true;
    }

    if(this.prov && this.incidencia.ultimoEmisor != this.prov.uid && !this.incidencia.leida){
      this.notificacion = true;
    }

    if(this.aT && this.incidencia.ultimoEmisor != this.aT.uid && !this.incidencia.leida && this.incidencia.asistenteId === this.aT.uid){
      this.notificacion = true;
    }

    this.nombreComprador = await this.usuarioService.getCompradorNombre(this.incidencia.creadorId);
    if(this.nombreComprador != "" && this.nombreComprador != null){
      var compradores = (await this.usuarioService.getCompradores()).filter((e) => e.uid == this.incidencia.creadorId);
      this.apellidosComprador = compradores[0].apellidos;
    }
    
    
    if(this.nombreComprador == "" || this.nombreComprador == null){
      this.nombreProveedor = await this.usuarioService.getProveedorNombre(this.incidencia.creadorId);
    }

    if(this.incidencia.asignado){
      this.nombreAsistente = await this.usuarioService.getAsistenteTecnicoNombre(this.incidencia.asistenteId);
      var asistentes = (await this.usuarioService.getAsistentes()).filter((e) => e.uid == this.incidencia.asistenteId);
      console.log(asistentes);
      this.apellidosAsistente = asistentes[0].apellidos;
    }

  }

  verIncidencia(){
    this.incidenciaSeleccionada.emit(this.incidencia._id);
  }

}
