/**
 * Interfaz para las empresas que pertenecen al usuario
 * Usada en el selector de empresas del header
 */
export interface Empresa1 {
	estatus: boolean;
	fechaRegistro: Date;
	guidEmpresa: string;
	id: number;
	idCorporativo: number;
	nombreComercial: string;
	rfc: string;
	sociedad: string;
	codigoPostal: string;
}

