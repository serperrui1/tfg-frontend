import { Component, OnInit } from '@angular/core';
import { Producto } from '../../models/producto';
import { DatosTecnicos } from '../../models/datosTecnicos';
import { ProductoService } from 'src/app/services/producto.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { FileUploadService } from '../../services/file-upload.service';
import { SubirImagenService } from 'src/app/services/subir-imagen.service';
import { Proveedor } from '../../models/proveedor';
import { CargaImagenenesService } from 'src/app/services/carga-imagenenes.service';
import { SpamValidator } from '../../Validaciones-Customizadas.directive';
import { Spam } from '../../models/spam';
import { SpamService } from '../../services/spam.service';


const base_url = environment.base_url;


@Component({
  selector: 'actualizar-app-producto',
  templateUrl: './actualizar-producto.component.html',
  styleUrls: ['./actualizar-producto.component.css']
})
export class ActualizarProductoComponent implements OnInit {
  
  public productoForm: FormGroup;
  public producto: Producto;
  public misProductos: Producto[];
  public imagenSubir: File;
  public imgTemp: any = null;
  public imagenMostrar:string;
  public proveedor:string;
  public id: string;
  public token: string;
  public usuario:string;
  public prov: Proveedor;
  public stock: Number;
  public unidadesMinimas: Number;
  public precio: Number;
  public accesoDenegado: boolean = false;
  public direccionImagen = base_url+"/upload/productos/"
  public imagenesSubir: File[];
  public urlImagen:string;
  public spam: Spam;
  categoria: string;
  public expresionesSpam: string[];
  imagenMostrarFirebase:boolean= false;
  imagenesFirebase:boolean[]= [];

  constructor(private activatedRoute: ActivatedRoute,
    private fb:FormBuilder,
    private productoService: ProductoService,
    private fileUploadService: FileUploadService,
    private http: HttpClient,
    private router:Router,
    private usuarioService: UsuarioService,
    private cargaImagenService: CargaImagenenesService,
    private spamService: SpamService){

      this.usuario =localStorage.getItem('usuario');
      this.token =localStorage.getItem('token');

  }

  async ngOnInit() {

    this.prov = await this.usuarioService.getProveedor();
    this.spam = (await this.spamService.getSpam())[0];
    this.expresionesSpam = this.spam.expresiones;


    if(this.usuario === "proveedor" && this.token != null) {

      this.activatedRoute.params.subscribe( params => {
        this.id = params['id']; 
      });

      this.prov = await this.usuarioService.getProveedor();
      this.producto = await this.productoService.getProductoPorID(this.id);
      this.productoForm = this.fb.group({
        titulo: [ this.producto.titulo, [Validators.required, SpamValidator(this.expresionesSpam)]],
        descripcion: [ this.producto.descripcion, [Validators.required, SpamValidator(this.expresionesSpam)]],
        categoria: [ this.producto.categoria,  Validators.required ],
        unidadesMinimas: [this.producto.unidadesMinimas, [Validators.required, this.unidadesMinimasIncorrecto]],
        stock: [ this.producto.stock, [Validators.required, this.stockIncorrecto]],
        tiempoEnvio: [ this.producto.tiempoEnvio, [Validators.required]],
        precio: [ this.producto.precio, [Validators.required, this.precioIncorrecto]],
        subcategoria:[ this.producto.subcategoria],
        datosTecnicos: this.fb.array([this.fb.group({
          datosTecnicosTitulo:[],
          datosTecnicosDescripcion:[]
      })])
      });
      this.categoria = this.producto.categoria;
      for(let i = this.producto.imagenes.length -1; i>=0; i--){
        if(this.producto.imagenes[i].startsWith("http")){
          this.imagenesFirebase.push(true)
        }else{
          this.imagenesFirebase.push(false)
        }
      }
      console.log( this.imagenesFirebase);
      this.imagenMostrar = this.producto.imagenes[0];
      if(this.imagenMostrar.startsWith("http")){
        this.imagenMostrarFirebase = true;
      }else{
        this.imagenMostrarFirebase = false;
      }
      this.stock = this.producto.stock;
      this.unidadesMinimas = this.producto.unidadesMinimas;
      if(this.producto.proveedor != this.prov.uid){
          this.accesoDenegado = true;
      }
      
      this.proveedor = await this.usuarioService.getProveedorNombre(this.producto.proveedor)
      this.producto.proveedorNombre = this.proveedor;
      


     

    }else{
      console.log("Acceso denegado para actualizar este producto");
    };
  }
  
  get datosTecnicos() {
    return this.productoForm.get('datosTecnicos') as FormArray;
  }

  get titulo()
  {
    return this.productoForm.get('titulo');
  }

  get descripcion()
  {
    return this.productoForm.get('descripcion');
  }

  addDatosTecnicos() {
    this.datosTecnicos.push(this.fb.group({
      datosTecnicosTitulo:['' ],
      datosTecnicosDescripcion:['']}));
  }

  deleteDatosTecnicos(index) {
    this.datosTecnicos.removeAt(index);
  }

  borrarDatosTecnicos(datos:DatosTecnicos) {
  Swal.fire({
      title: '¿Borrar el Dato Técnico?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrarlo'
    }).then((result) => {
      if (result.value) {

    const index = this.producto.datosTecnicos.indexOf(datos);
    if (index > -1) {
      this.producto.datosTecnicos.splice(index, 1);
    }
  }
})
}



  async actualizarProducto() {

    if(this.productoForm.invalid){
      this.productoForm.markAllAsTouched()
      return;
    }

    let productoActualizar = this.productoForm.value

    if(productoActualizar.datosTecnicos.length == 0){
      productoActualizar.datosTecnicosAntiguos = this.producto.datosTecnicos;
    }else if (productoActualizar.datosTecnicos.length > 0){
      for(let datosTecnicos of productoActualizar.datosTecnicos){
        if(datosTecnicos.datosTecnicosTitulo != null && datosTecnicos.datosTecnicosTitulo != ""){
          console.log(datosTecnicos.datosTecnicosTitulo);
          this.producto.datosTecnicos.push(datosTecnicos);
        }
      }
      productoActualizar.datosTecnicos = this.producto.datosTecnicos;
      
    }
    

    //dejar solo 2 decimales en el precio
    var precio = this.productoForm.value.precio;
    this.productoForm.value.precio = Math.round(precio * 100) / 100;
    //------------------------------------


    // if(this.imagenesSubir != undefined){
    //   await this.subirImagenes()
    // }

    productoActualizar.imagenes = this.producto.imagenes;
    if(this.imagenesSubir != undefined){
      for(let imagen of this.imagenesSubir){
        await this.subirImagen(imagen);
        productoActualizar.imagenes.push(this.urlImagen);
      }
    }
    this.productoService.actualizarProducto( productoActualizar, this.producto._id )
    .subscribe( () => {
      Swal.fire('Guardado', 'Producto actualizado correctamente.', 'success');
      this.router.navigateByUrl("/producto/"+this.producto._id);
    }, (err) => {
      Swal.fire('Error', err.error.msg, 'error');
    });
   
  }
  cambiaCategoria(){
    this.categoria = this.productoForm.get("categoria").value;
  }
  cambiarImagen( file: File ) {
    this.imagenSubir = file;
    if ( !file ) { 
      return this.imgTemp = null;
    }
    const reader = new FileReader();
    reader.readAsDataURL( file );
    reader.onloadend = () => {
      this.imgTemp = reader.result;
    }
  }

  // async subirImagenes() {
  //   if(this.usuario === "proveedor"){
  //     for(let imagen of this.imagenesSubir){
  //     // let imagenNombre = 
  //     await this.subirImagenService.postearImagen(imagen, 'productos', this.producto._id)

  //           // this.producto.imagenes.push(imagenNombre);

  //   }
    
  // }}
  async subirImagen(imagenSubir:File){
    let nombre = Math.random().toString() + imagenSubir.name; 
    await this.cargaImagenService.subirCloudStorage(nombre, imagenSubir);
    this.urlImagen = await this.cargaImagenService.referenciaCloudStorage(nombre);
  }
  get imagenUrl(){
    if(this.usuario === "proveedor"){
      if(this.producto.imagenes.includes('http')){
        return this.producto.imagenes;
      }
      // if(this.producto.imagenes){
      //     return `${base_url}/upload/productos/${ this.producto.imagenes }`;
      // }
      else{
          return `${base_url}/upload/productos/no-image`;
      }
    }
  }

  borrarProducto( producto: Producto ) {
   
    Swal.fire({
      title: '¿Desea borrar el Producto?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrarlo'
    }).then((result) => {
      if (result.value) {
        this.productoService.borrarProducto( producto._id )
        .subscribe( resp => {
          Swal.fire( 'Borrado', producto.titulo, 'success' );
          this.router.navigateByUrl("/mis-productos");
        });
      }});

  }
  borrarImagen() {
    Swal.fire({
        title: '¿Borrar la imagen?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrarlo'
      }).then((result) => {
        if (result.value) {
          if(this.producto.imagenes.length>1){
            for(let imagen of this.producto.imagenes){
              if(imagen == this.imagenMostrar){
                // const index: number = this.producto.imagenes.indexOf(imagen);
                // console.log(index);
                // this.producto.imagenes.slice(index,1);
                // console.log(this.producto.imagenes);
                this.producto.imagenes = this.producto.imagenes.filter(item => item !== imagen);
              }
            }
          }else{
            Swal.fire(  "","Debe haber al menos una imagen del producto", 'error' );
          }
          
    }
  })
  }

  multiplesImagenes(files: File[]){

    this.imagenesSubir = files;
    
    for(let file of files){
      if ( !file ) { 
        return this.imgTemp = null;
      }  
    const reader = new FileReader();
    reader.readAsDataURL( file );
    reader.onloadend = () => {
      this.imgTemp = reader.result;
    }
    }
  }



  //Validaciones
  get tituloNoValido(){
    return this.tituloCampoRequerido
  }
  get tituloCampoRequerido(){
    return this.productoForm.get('titulo').errors ? this.productoForm.get('titulo').errors.required && this.productoForm.get('titulo').touched : null
  }



  get descripcionNoValido(){
    return this.descripcionCampoRequerido
  }
  get descripcionCampoRequerido(){
    return this.productoForm.get('descripcion').errors ? this.productoForm.get('descripcion').errors.required && this.productoForm.get('descripcion').touched : null
  }



  get unidadesMinimasNoValido(){
    return this.unidadesMinimasCampoRequerido || this.unidadesMinimasFormato
  }
  get unidadesMinimasCampoRequerido(){
    return this.productoForm.get('unidadesMinimas').errors ? this.productoForm.get('unidadesMinimas').errors.required && this.productoForm.get('unidadesMinimas').touched : null
  }
  get unidadesMinimasFormato(){
    return this.productoForm.get('unidadesMinimas').errors ? this.productoForm.get('unidadesMinimas').errors.unidadesMinimasIncorrecto && this.productoForm.get('unidadesMinimas').touched : null
  }
  unidadesMinimasIncorrecto = (control:FormControl):{[s:string]:boolean} =>{
    const pattern = "^[0-9]+$"
    let cP = String(control.value);
    let cX = Number(control.value);
    if(!cP.match(pattern) || cX < 0 || cX > this.stock){
      return {
        unidadesMinimasIncorrecto:true
      }
    }
    return null
  }

  get envioRequerido(){
    return this.productoForm.get('tiempoEnvio').errors ? this.productoForm.get('tiempoEnvio').errors.required && this.productoForm.get('tiempoEnvio').touched : null
  }
  get envioNoValido(){
    return this.envioRequerido;
  }

  get stockNoValido(){
    return this.stockCampoRequerido || this.stockFormato
  }
  get stockCampoRequerido(){
    return this.productoForm.get('stock').errors ? this.productoForm.get('stock').errors.required && this.productoForm.get('stock').touched : null
  }
  get stockFormato(){
    return this.productoForm.get('stock').errors ? this.productoForm.get('stock').errors.stockIncorrecto && this.productoForm.get('stock').touched : null
  }
  stockIncorrecto = (control:FormControl):{[s:string]:boolean} =>{
    const pattern = "^[0-9]+$"
    let cP = String(control.value);
    let cX = Number(control.value);
    if(!cP.match(pattern) || cX < 0 || cX < this.unidadesMinimas){
      return {
        stockIncorrecto:true
      }
    }
    return null
  }




  get precioNoValido(){
    return this.precioCampoRequerido || this.precioFormato
  }
  get precioCampoRequerido(){
    return this.productoForm.get('precio').errors ? this.productoForm.get('precio').errors.required && this.productoForm.get('precio').touched : null
  }
  get precioFormato(){
    return this.productoForm.get('precio').errors ? this.productoForm.get('precio').errors.precioIncorrecto && this.productoForm.get('precio').touched : null
  }
  precioIncorrecto(control:FormControl):{[s:string]:boolean}{
    let cX = Number(control.value);
    if(cX < 0){
      return {
        precioIncorrecto:true
      }
    }
    return null
  }



}
