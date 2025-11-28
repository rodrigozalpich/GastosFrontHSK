/**
 * Helpers para validación de formularios y datos
 */

/**
 * Valida si un email es válido
 * @param email - Email a validar
 * @returns true si el email es válido, false en caso contrario
 */
export function esEmailValido(email: string | null | undefined): boolean {
	if (!email) return false;
	
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email.trim());
}

/**
 * Valida si un RFC mexicano es válido
 * @param rfc - RFC a validar
 * @returns true si el RFC es válido, false en caso contrario
 */
export function esRFCValido(rfc: string | null | undefined): boolean {
	if (!rfc) return false;
	
	const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
	return rfcRegex.test(rfc.toUpperCase().trim());
}

/**
 * Valida si un CURP mexicano es válido
 * @param curp - CURP a validar
 * @returns true si el CURP es válido, false en caso contrario
 */
export function esCURPValido(curp: string | null | undefined): boolean {
	if (!curp) return false;
	
	const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
	return curpRegex.test(curp.toUpperCase().trim());
}

/**
 * Valida si un número de teléfono mexicano es válido
 * @param telefono - Teléfono a validar
 * @returns true si el teléfono es válido, false en caso contrario
 */
export function esTelefonoValido(telefono: string | null | undefined): boolean {
	if (!telefono) return false;
	
	// Remover caracteres no numéricos
	const numeros = telefono.replace(/\D/g, "");
	
	// Validar que tenga 10 dígitos (número local) o 12 (con código de país)
	return numeros.length === 10 || numeros.length === 12;
}

/**
 * Valida si un código postal mexicano es válido
 * @param codigoPostal - Código postal a validar
 * @returns true si el código postal es válido, false en caso contrario
 */
export function esCodigoPostalValido(codigoPostal: string | null | undefined): boolean {
	if (!codigoPostal) return false;
	
	const cpRegex = /^\d{5}$/;
	return cpRegex.test(codigoPostal.trim());
}

/**
 * Valida si un campo requerido tiene valor
 * @param valor - Valor a validar
 * @returns true si el valor existe y no está vacío, false en caso contrario
 */
export function esRequerido(valor: unknown): boolean {
	if (valor === null || valor === undefined) return false;
	
	if (typeof valor === "string") {
		return valor.trim().length > 0;
	}
	
	if (typeof valor === "number") {
		return !isNaN(valor);
	}
	
	if (Array.isArray(valor)) {
		return valor.length > 0;
	}
	
	return true;
}

/**
 * Valida si un número está dentro de un rango
 * @param valor - Valor numérico a validar
 * @param min - Valor mínimo (inclusive)
 * @param max - Valor máximo (inclusive)
 * @returns true si el valor está en el rango, false en caso contrario
 */
export function estaEnRango(
	valor: number | null | undefined,
	min: number,
	max: number
): boolean {
	if (valor === null || valor === undefined || isNaN(valor)) return false;
	
	return valor >= min && valor <= max;
}

/**
 * Valida si un texto tiene una longitud mínima
 * @param texto - Texto a validar
 * @param longitudMinima - Longitud mínima requerida
 * @returns true si el texto cumple con la longitud mínima, false en caso contrario
 */
export function tieneLongitudMinima(
	texto: string | null | undefined,
	longitudMinima: number
): boolean {
	if (!texto) return false;
	
	return texto.trim().length >= longitudMinima;
}

/**
 * Valida si un texto tiene una longitud máxima
 * @param texto - Texto a validar
 * @param longitudMaxima - Longitud máxima permitida
 * @returns true si el texto cumple con la longitud máxima, false en caso contrario
 */
export function tieneLongitudMaxima(
	texto: string | null | undefined,
	longitudMaxima: number
): boolean {
	if (!texto) return true; // Texto vacío cumple con cualquier longitud máxima
	
	return texto.trim().length <= longitudMaxima;
}

/**
 * Valida si un texto tiene una longitud exacta
 * @param texto - Texto a validar
 * @param longitud - Longitud exacta requerida
 * @returns true si el texto tiene la longitud exacta, false en caso contrario
 */
export function tieneLongitudExacta(
	texto: string | null | undefined,
	longitud: number
): boolean {
	if (!texto) return longitud === 0;
	
	return texto.trim().length === longitud;
}

/**
 * Valida si un número es positivo
 * @param valor - Valor numérico a validar
 * @returns true si el valor es positivo, false en caso contrario
 */
export function esPositivo(valor: number | null | undefined): boolean {
	if (valor === null || valor === undefined || isNaN(valor)) return false;
	
	return valor > 0;
}

/**
 * Valida si un número es negativo
 * @param valor - Valor numérico a validar
 * @returns true si el valor es negativo, false en caso contrario
 */
export function esNegativo(valor: number | null | undefined): boolean {
	if (valor === null || valor === undefined || isNaN(valor)) return false;
	
	return valor < 0;
}

/**
 * Valida si una URL es válida
 * @param url - URL a validar
 * @returns true si la URL es válida, false en caso contrario
 */
export function esURLValida(url: string | null | undefined): boolean {
	if (!url) return false;
	
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

/**
 * Obtiene un mensaje de error para un campo requerido
 * @param nombreCampo - Nombre del campo
 * @returns Mensaje de error
 */
export function obtenerMensajeRequerido(nombreCampo: string): string {
	return `${nombreCampo} es requerido`;
}

/**
 * Obtiene un mensaje de error para un campo con longitud mínima
 * @param nombreCampo - Nombre del campo
 * @param longitudMinima - Longitud mínima requerida
 * @returns Mensaje de error
 */
export function obtenerMensajeLongitudMinima(nombreCampo: string, longitudMinima: number): string {
	return `${nombreCampo} debe tener al menos ${longitudMinima} caracteres`;
}

/**
 * Obtiene un mensaje de error para un campo con longitud máxima
 * @param nombreCampo - Nombre del campo
 * @param longitudMaxima - Longitud máxima permitida
 * @returns Mensaje de error
 */
export function obtenerMensajeLongitudMaxima(nombreCampo: string, longitudMaxima: number): string {
	return `${nombreCampo} no puede tener más de ${longitudMaxima} caracteres`;
}

/**
 * Obtiene un mensaje de error para un campo con formato inválido
 * @param nombreCampo - Nombre del campo
 * @returns Mensaje de error
 */
export function obtenerMensajeFormatoInvalido(nombreCampo: string): string {
	return `${nombreCampo} tiene un formato inválido`;
}

