/**
 * Tipos de utilidades y respuestas de API
 */

/**
 * DTO de respuesta genérica de la API
 */
export interface RespuestaDTO {
	estatus: boolean;
	descripcion: string;
}

/**
 * DTO de respuesta de justificante
 */
export interface RespuestaJustificanteDTO {
	estatus: boolean;
	descripcion: string;
	idArchivo?: number;
	ruta?: string;
}

/**
 * DTO de respuesta múltiple
 */
export interface RespuestaMultipleDTO {
	estatus: boolean[];
	descripcion: string[];
	nombre: string[];
}

