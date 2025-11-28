import { format, parseISO, isValid, isDate } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Helpers para manejo y formateo de fechas
 * Migrado de FechasService de Angular
 */

/**
 * Formatea una fecha a string en formato corto (dd/MM/yyyy)
 * @param fecha - Fecha a formatear (Date, string ISO, o null/undefined)
 * @returns String formateado o "-" si la fecha es inválida
 */
export function formatearFechaCorta(fecha: Date | string | null | undefined): string {
	if (!fecha) return "-";
	
	try {
		const fechaDate = typeof fecha === "string" ? parseISO(fecha) : fecha;
		if (!isValid(fechaDate) || !isDate(fechaDate)) return "-";
		
		return format(fechaDate, "dd/MM/yyyy", { locale: es });
	} catch {
		return "-";
	}
}

/**
 * Formatea una fecha a string en formato largo (dd de MMMM de yyyy)
 * @param fecha - Fecha a formatear (Date, string ISO, o null/undefined)
 * @returns String formateado o "-" si la fecha es inválida
 */
export function formatearFechaLarga(fecha: Date | string | null | undefined): string {
	if (!fecha) return "-";
	
	try {
		const fechaDate = typeof fecha === "string" ? parseISO(fecha) : fecha;
		if (!isValid(fechaDate) || !isDate(fechaDate)) return "-";
		
		return format(fechaDate, "dd 'de' MMMM 'de' yyyy", { locale: es });
	} catch {
		return "-";
	}
}

/**
 * Formatea una fecha a string en formato para input date (yyyy-MM-dd)
 * @param fecha - Fecha a formatear (Date, string ISO, o null/undefined)
 * @returns String formateado o string vacío si la fecha es inválida
 */
export function formatearFechaInput(fecha: Date | string | null | undefined): string {
	if (!fecha) return "";
	
	try {
		const fechaDate = typeof fecha === "string" ? parseISO(fecha) : fecha;
		if (!isValid(fechaDate) || !isDate(fechaDate)) return "";
		
		return format(fechaDate, "yyyy-MM-dd");
	} catch {
		return "";
	}
}

/**
 * Formatea una fecha a string con hora (dd/MM/yyyy HH:mm)
 * @param fecha - Fecha a formatear (Date, string ISO, o null/undefined)
 * @returns String formateado o "-" si la fecha es inválida
 */
export function formatearFechaConHora(fecha: Date | string | null | undefined): string {
	if (!fecha) return "-";
	
	try {
		const fechaDate = typeof fecha === "string" ? parseISO(fecha) : fecha;
		if (!isValid(fechaDate) || !isDate(fechaDate)) return "-";
		
		return format(fechaDate, "dd/MM/yyyy HH:mm", { locale: es });
	} catch {
		return "-";
	}
}

/**
 * Formatea una fecha usando toLocaleDateString (compatibilidad con código existente)
 * @param fecha - Fecha a formatear (Date, string ISO, o null/undefined)
 * @param locale - Locale a usar (default: "es-MX")
 * @returns String formateado o "-" si la fecha es inválida
 */
export function formatearFechaLocalizada(
	fecha: Date | string | null | undefined,
	locale: string = "es-MX"
): string {
	if (!fecha) return "-";
	
	try {
		const fechaDate = typeof fecha === "string" ? new Date(fecha) : fecha;
		if (!isValid(fechaDate) || !isDate(fechaDate)) return "-";
		
		return fechaDate.toLocaleDateString(locale);
	} catch {
		return "-";
	}
}

/**
 * Convierte una fecha a Date object, manejando strings ISO y Date objects
 * @param fecha - Fecha a convertir
 * @returns Date object o null si es inválida
 */
export function convertirAFecha(fecha: Date | string | null | undefined): Date | null {
	if (!fecha) return null;
	
	try {
		const fechaDate = typeof fecha === "string" ? parseISO(fecha) : fecha;
		if (!isValid(fechaDate) || !isDate(fechaDate)) return null;
		
		return fechaDate;
	} catch {
		return null;
	}
}

/**
 * Valida si una fecha es válida
 * @param fecha - Fecha a validar
 * @returns true si la fecha es válida, false en caso contrario
 */
export function esFechaValida(fecha: Date | string | null | undefined): boolean {
	if (!fecha) return false;
	
	try {
		const fechaDate = typeof fecha === "string" ? parseISO(fecha) : fecha;
		return isValid(fechaDate) && isDate(fechaDate);
	} catch {
		return false;
	}
}

/**
 * Obtiene la fecha actual formateada
 * @param formato - Formato a usar (default: "dd/MM/yyyy")
 * @returns String con la fecha actual formateada
 */
export function obtenerFechaActual(formato: string = "dd/MM/yyyy"): string {
	return format(new Date(), formato, { locale: es });
}

