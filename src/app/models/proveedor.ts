export interface Proveedor {

    nombreEmpresa: string;
    autonomo: boolean;
    sector: string;
    email: string;
    direccion: string;
    cuentaBancariaIBAN: string;
    titularCuenta: string;
    productosId: string[];
    uid?: string;
    img?:string
    fechaRegistro?: Date,
    registroMercantil?: string;
    nif?: string;
}