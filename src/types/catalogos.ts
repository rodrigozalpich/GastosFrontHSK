/**
 * Tipos e interfaces para los catálogos del sistema de gastos
 * Migrado de los módulos de catálogos de Angular
 */

//#region Centro de Costos

/**
 * DTO de Centro de Costos
 * Según el esquema de la API
 */
export interface CentroCostoDTO {
	id: number;
	nombre: string | null;
	codigo: string | null;
	estatus: number;
	fechaAlta: Date | string;
	fechaBaja: Date | string | null;
	borrado: boolean;
}

//#endregion

//#region Cuenta Contable

/**
 * DTO de Cuenta Contable de Gastos
 * Re-exporta el tipo de gastos.ts para mantener consistencia
 */
export type { CuentaContableGastosDTO as CuentaContableDTO } from "./gastos";

//#endregion

//#region Plazas

/**
 * DTO de Plaza
 * Según el esquema PlazasDTO de la API
 */
export interface PlazaDTO {
	id: number;
	idDivisiones: number;
	nombrePlaza: string | null;
	estatus: number;
	fechaAlta: Date | string;
	fechaBaja: Date | string | null;
	borrado: boolean;
	nombreDivision: string | null;
	esAutorizador: boolean;
	disponible: boolean;
	empleadoAsociado: string | null;
}

//#endregion

//#region División

/**
 * DTO de División
 * Según el esquema DivisionesDTO de la API
 */
export interface DivisionDTO {
	id: number;
	nombre: string | null;
	fechaAlta: Date | string | null;
	fechaBaja: Date | string | null;
	estatus: number;
	codigoSAP: string | null;
	asignaAC: boolean;
	registroPatronal: string | null;
	borrado: boolean;
}

//#endregion

//#region Clave Producto

/**
 * DTO de Clave Producto por División
 * Según el esquema ClaveProdxDivisionDTO de la API
 */
export interface ClaveProductoDTO {
	id: number;
	idClaveProd: number;
	idDivision: number;
	idCuentaContable: number;
	idCategoria: number;
	borrado: boolean;
	nombreClave: string;
	claveProd: string;
	nombreDivision: string;
	nombreCuentaContable: string;
}

export interface ClaveProductoSAT {
	id: number;
	claveProducto: string;
	estatus: number;
	fechaAlta: string;
	fechaBaja: string | null;
	nombre: string;
	tasaoCuota: number | null;
}

//#endregion

//#region Datos Empleado

/**
 * DTO de Usuario de Gastos (base para DatosEmpleado)
 */
export interface UsuarioGastosDTO {
	id: number;
	idUsuario: number;
	nombre: string;
	apellidoPaterno: string;
	apellidoMaterno: string;
	estatus: number;
	fechaAlta: Date | string;
	fechaBaja: Date | string | null;
	numeroEmpleado: string;
	numeroEmpleadoSAP: string | null;
	seguroSocial: string | null;
	rfc: string | null;
	curp: string | null;
	codigoPostal: string | null;
	fechaRelacionLaboral: Date | string | null;
	salarioDiario: number | null;
	claveContrato: number | null;
	claveRegimen: number | null;
	claveJornada: number | null;
	claveRiesgoPuesto: number | null;
	claveEstado: number | null;
	nombreContrato: string | null;
	nombreRegimen: string | null;
	nombrejornada: string | null;
	nombreRiesgo: string | null;
	nombreEstado: string | null;
}

/**
 * DTO de Datos de Empleado (extiende UsuarioGastosDTO)
 */
export interface DatosEmpleadoDTO extends UsuarioGastosDTO {
	id: number;
	numeroEmpleadoSAP: string | null;
	seguroSocial: string | null;
	rfc: string | null;
	curp: string | null;
	codigoPostal: string | null;
	fechaRelacionLaboral: Date | string | null;
	salarioDiario: number | null;
	claveContrato: number | null;
	claveRegimen: number | null;
	claveJornada: number | null;
	claveRiesgoPuesto: number | null;
	claveEstado: number | null;
}

/**
 * DTO de Plaza de Empleado
 */
export interface PlazaEmpleadoDTO {
	id: number;
	idPlaza: number;
	idEmpleado: number;
	idDivision: number;
	estatus: number;
	fechaAlta: Date | string;
	fechaBaja: Date | string | null;
	metodosPagosMultiples: boolean;
	limitePersonalizadoAlimentos: number;
	limitePersonalizadoHospedaje: number;
	limitePersonalizadoTransporte: number;
	conLimitesExtranjeros: boolean;
	limiteExtranjeroAlimentos: number;
	limiteExtranjeroHospedaje: number;
	limiteExtranjeroTransporte: number;
	nombreEmpleado: string;
	nombrePlaza: string;
	nombreDivision: string;
	borrado: boolean;
	tieneLimitesPersonalizados: boolean;
	idEmpresa?: number;
}

/**
 * DTO de Plaza Cuenta
 */
export interface PlazaCuentaDTO {
	id: number;
	idPlazaEmpleado: number;
	idCuentaContable: number;
	estatus: number;
	borrado: boolean;
	nombreCuenta: string;
	codigo: string;
	esDefault: boolean;
}

/**
 * DTO de Plaza Centro
 */
export interface PlazaCentroDTO {
	id: number;
	idCentroCosto: number;
	idPlazaEmpleado: number;
	estatus: number;
	borrado: boolean;
	fechaAlta: Date | string;
	fechaBaja: Date | string | null;
	nombreCentro: string;
	codigo: string;
}

/**
 * DTO de Árbol de Autorización
 */
export interface ArbolDTO {
	id: number;
	idPlazaEmpleado: number;
	fechaAlta: Date | string;
	esAnticipo: boolean;
}

/**
 * DTO de Autorizadores
 */
export interface AutorizadoresDTO {
	id: number;
	idArbol: number;
	idPlazaEmpleado: number;
	estatus: number;
	fechaAlta: Date | string;
	fechaBaja: Date | string | null;
	nombre: string;
	nivelAutorizacion: number;
	separador: boolean;
}

/**
 * DTO de Árbol Autorizadores (relación)
 */
export interface ArbolAutorizadoresDTO {
	id: number;
	idArbol: number;
	idAutorizador: number;
	nivelAutorizacion: number;
	estatus: number;
}

/**
 * DTO de Rol Plaza Empleado
 */
export interface RolPlazaEmpleadoDTO {
	id: number;
	idPlazaEmpleado: number;
	idRol: number;
	estatus: number;
}

/**
 * DTO de Contratos
 */
export interface ContratosDTO {
	id: number;
	clave: number;
	descripcion: string;
	estatus: number;
}

/**
 * DTO de Riesgos
 */
export interface RiesgosDTO {
	id: number;
	clave: number;
	descripcion: string;
	estatus: number;
}

/**
 * DTO de Regímenes
 */
export interface RegimenesDTO {
	id: number;
	clave: number;
	descripcion: string;
	estatus: number;
}

/**
 * DTO de Jornadas
 */
export interface JornadasDTO {
	id: number;
	clave: number;
	descripcion: string;
	estatus: number;
}

/**
 * DTO de Estado
 */
export interface EstadoDTO {
	ID: number;
	c_Estado: string;
	nombre: string;
	Pais_ID: number;
	estatus: number;
}

//#endregion

