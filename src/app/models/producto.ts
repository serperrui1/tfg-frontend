import { DatosTecnicos } from './datosTecnicos';
import { Valoracion } from './valoracion';

export class Producto {
    constructor(
    public titulo: string,
    public descripcion: string,
    public categoria: string,
    public unidadesMinimas: number,
    public stock: number,
    public imagenes: string[],
    public precio: number,
    public valoraciones: Valoracion[],
    public proveedorNombre: string,
    public proveedor: string,
    public tiempoEnvio: string,
    public datosTecnicos?: DatosTecnicos[],
    public posicion?: {
        lat:number,
        lng:number
    },
    public unidadesVendidas?:number,
    public puntuacionMedia?:number,
    public productoEstrella?:boolean,
    public _id?: string,
    public subcategoria?: string,
    ){}
}