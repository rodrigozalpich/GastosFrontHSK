/**
 * Tipos e interfaces para el módulo de gastos
 * Migrado de tsGestion-de-gastos.ts de Angular
 */

//#region Gastos

/**
 * DTO principal de gasto
 */
export interface GastoDTO {
	id: number;
	idPlazaEmpleado: number;
	idDivision: number;
	idCentroCosto: number;
	presupuesto: number;
	estatus: number;
	estatusSolicitud: number;
	fechaAlta: Date | string;
	fechaModificacion: Date | string | null;
	nombre: string;
	descripcion: string;
	esCerrado: boolean;
	esPagado: boolean;
	fechaInicio: Date | string;
	fechaFin: Date | string | null;
	esAnticipo: boolean;
	idArchivoJustificante: number | null;
	descripArchivoJustificante: string | null;
	pendientePago: boolean;
	fechaCierre: Date | string | null;
	borrado: boolean;
	nivelSiguiente: number;
	autorizador: string | null;
	idAutorizador: number;
	nivelAutorizador: number;
	validacionAutorizacion: boolean | null;
	devolucionTotal?: number;
	esDevolucion: boolean | null;
	comprobado?: number;
	remanente: number;
	nivelMaximo: boolean | null;
	nombreASiguiente: string[];
	siguienteAutorizador: string;
	editarRechazado: boolean | null;
	devolucionPagada: boolean | null;
	tienePolizaDiario: boolean;
	tienePolizaIngreso: boolean;
	tienePolizaEgreso: boolean;
	abono?: number;
	seleccionado: boolean;
	nombreEmpleado: string;
	esPrimeraVuelta: boolean | null;
	notieneCFDI: boolean;
	Aceptado: number;
	tieneDevolucion: boolean;
	editable: boolean;
}

//#endregion

//#region Archivos de Comprobación

/**
 * DTO de archivo de comprobación
 */
export interface ArchivoComprobacionDTO {
	id: number;
	idGasto: number;
	idCentroCosto: number;
	estatus: number;
	fechaEmision: Date | string | null;
	fechaTimbrado: Date | string | null;
	fechaValidacion: Date | string | null;
	rfcEmisor: string;
	rfcRecepetor: string;
	uuid: string;
	serie: string;
	folio: string;
	subtotal: number;
	total: number;
	ruta: string;
	esCfdi: boolean;
	tipoPago: string;
	metodoPago: string;
	Descuento: number;
	totalAceptado: number;
	tipoMoneda: number;
	tipoCambio: number;
	tipoComprobante: string;
	cargadaPorCorreo: boolean;
	esDeducible: boolean;
	ordenMtto: string | null;
	borrado: boolean;
	asientoContable: string;
	nombreCentro: string;
	empleadosC: string[];
	esHospedaje: boolean;
	IdPDF: number | null;
	IdXml: number;
}

/**
 * DTO de fecha de archivo
 */
export interface ArchivoFechaDTO {
	id: number;
	idArchivo: number;
	fechaInicio: Date | string;
	fechaFin: Date | string;
	estatus: number;
}

//#endregion

//#region Conceptos

/**
 * DTO de concepto de gasto
 */
export interface ConceptoGastosDTO {
	id: number;
	idGasto: number;
	idArchivoComprobacion: number;
	idCuentaContableDestino: number;
	idCentroCostos: number;
	descripcion: string;
	cantidad: number;
	precioUnitario: number;
	MontoComprobado: number;
	montoAceptado: number;
	descuento: number;
	formaPago: string;
	codigoSAT: string;
	importe: number;
	total: number;
	impuestos: number;
	listaImpuestos: ConceptoImpuestosGastosDTO[];
}

/**
 * DTO de impuestos de concepto
 */
export interface ConceptoImpuestosGastosDTO {
	id: number;
	idConcepto: number;
	numeroImpuesto: string;
	tipoFactor: string;
	tasaOCuota: number;
	importe: number;
	importeAceptado: number;
	estatus: number;
	esTraslado: boolean;
}

//#endregion

//#region Autorización

/**
 * DTO de gasto autorizado
 */
export interface GastoAutorizadoDTO {
	id: number;
	idGasto: number;
	idAutorizador: number;
	esAutorizado: boolean;
	fechaAutorizacion: Date | string;
	estatus: number;
	numeroRechazos: number;
	nivelAutorizacion: number;
	VueltaAnticipo: number | null;
}

/**
 * DTO de gasto rechazado
 */
export interface GastoRechazadoDTO {
	id: number;
	idGastoAutorizado: number;
	motivo: string;
	fechaRechazo: Date | string;
}

/**
 * DTO de autorizador
 */
export interface AutorizadorDTO {
	id: number;
	idPlazaEmpleado: number;
	estatus: number;
	fechaAlta: Date | string;
	fechaBaja: Date | string;
	nombre: string;
	nivel: number;
}

//#endregion

//#region Movimientos y Pagos

/**
 * DTO de movimiento de cuenta contable
 */
export interface MovimientosCuentaContableDTO {
	id: number;
	idGasto: number;
	idCuentaContable: number;
	SaldoAnterior: number;
	monto: number;
	saldoActual: number;
	fechaAlta: Date | string;
	estatus: number;
}

/**
 * DTO de movimiento de gasto
 */
export interface MovimientosGastosDTO {
	id: number;
	idGasto: number;
	idMovimiento: number;
	estatus: number;
	idArchivo: number;
}

//#endregion

//#region Pólizas

/**
 * DTO de póliza de gastos
 */
export interface PolizaGastosDTO {
	id: number;
	idGasto: number;
	descripcion: string;
	fechaPoliza: Date | string;
	totalAbono: number;
	totalCargo: number;
	numeroPoliza: number;
	tipoPoliza: number; // 1: Ingreso, 2: Egreso, 3: Diario
	fechaAlta: Date | string;
	esSap: boolean | null;
	fechaEnvioSap: Date | string | null;
}

/**
 * DTO de detalle de póliza
 */
export interface PolizaDetalleGastosDTO {
	id: number;
	idPoliza: number;
	idClaveProdxDivision: number | null;
	idArchivoComprobacion: number;
	concepto: string;
	cargo: number;
	abono: number;
	asientoContable: string | null;
	cuentaContableString: string | null;
	seleccionado: boolean;
}

//#endregion

//#region Otros DTOs

/**
 * DTO de gasto compartido
 */
export interface GastoCompartidoDTO {
	id: number;
	idGasto: number;
	idArchivoComprobacion: number;
	idPlazaEmpleado: number;
}

/**
 * DTO de cuenta contable de gastos
 */
export interface CuentaContableGastosDTO {
	id: number;
	codigo: string | null;
	descripcion: string | null;
	tipoMoneda: number;
	idPadre: number;
	nivel: number;
	existeMovimiento: boolean;
	existePoliza: boolean;
	fechaAlta: Date | string;
	esAcreedor: boolean;
	estatus: boolean;
	tipoCuenta: number;
	borrado: boolean;
	permiso: boolean;
	tipoDeCuentaN: string | null;
	esDefault: boolean | null;
	editarDefault: boolean | null;
}

/**
 * DTO de no deducible
 */
export interface NoDeducibleDTO {
	nombre: string;
	total: number;
	observaciones: string;
	idCuentacontable: number;
	NombrecuentaContable: string;
	idCentroCosto: number;
	idGasto: number;
	esExtranjero: boolean;
}

/**
 * DTO de devoluciones
 */
export interface DevolucionesDTO {
	id: number;
	idGasto: number;
	idCuentaOrigen: number;
	idCuentaDestino: number;
	montoDevolucion: number;
	estatus: number;
	fechaDevolucion: Date | string;
	rutaarchivo: string;
	borrado: boolean;
}

/**
 * DTO de parámetros de empresa de gastos
 */
export interface ParametrosEmpresaGastosDTO {
	id: number;
	permiso: string;
	valor: string;
	estatus: boolean;
	editablexUsuario: boolean;
}

/**
 * Constantes de permisos de gastos
 */
export const PermisosGastos = {
	INGRESO: "numero poliza ingreso",
	EGRESO: "numero poliza egreso",
	DIARIO: "numero poliza diario",
	NOTIFICAR_DIAS: "DiasDeEsperaParaNotificar",
	NOTIFICAR: "NotificarAutorizacion",
	PDF: "ValidacionPDFyXML",
	TAMANO: "TamañoArchivo",
	MANTENIMIENTO: "OrdenMantenimiento",
	CentroC: "CentroCostos",
} as const;

export type PermisosGastosType = typeof PermisosGastos[keyof typeof PermisosGastos];

//#endregion

//#region Timbrado

/**
 * DTO de respuesta de timbrado
 */
export interface RespuestaTimbradoDTO {
	idEmpleado: number | null;
	estatus: boolean;
	descripcion: string;
	nombre: string;
	nombreGasto: string;
}

//#endregion

