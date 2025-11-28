/**
 * Helpers para formateo de valores (moneda, números, etc.)
 */

/**
 * Formatea un número como moneda mexicana (MXN)
 * @param valor - Valor numérico a formatear
 * @param mostrarSimbolo - Si debe mostrar el símbolo $ (default: true)
 * @returns String formateado como moneda o "$0.00" si el valor es inválido
 */
export function formatearMoneda(
	valor: number | null | undefined,
	mostrarSimbolo: boolean = true
): string {
	if (valor === null || valor === undefined || isNaN(valor)) {
		return mostrarSimbolo ? "$0.00" : "0.00";
	}
	
	const formateado = valor.toLocaleString("es-MX", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	
	return mostrarSimbolo ? `$${formateado}` : formateado;
}

/**
 * Formatea un número con separadores de miles
 * @param valor - Valor numérico a formatear
 * @param decimales - Número de decimales (default: 0)
 * @returns String formateado o "0" si el valor es inválido
 */
export function formatearNumero(
	valor: number | null | undefined,
	decimales: number = 0
): string {
	if (valor === null || valor === undefined || isNaN(valor)) {
		return "0";
	}
	
	return valor.toLocaleString("es-MX", {
		minimumFractionDigits: decimales,
		maximumFractionDigits: decimales,
	});
}

/**
 * Formatea un porcentaje
 * @param valor - Valor numérico a formatear (0-100 o 0-1)
 * @param esDecimal - Si el valor está en formato decimal (0-1) en lugar de porcentaje (0-100)
 * @param decimales - Número de decimales (default: 2)
 * @returns String formateado como porcentaje
 */
export function formatearPorcentaje(
	valor: number | null | undefined,
	esDecimal: boolean = false,
	decimales: number = 2
): string {
	if (valor === null || valor === undefined || isNaN(valor)) {
		return "0%";
	}
	
	const porcentaje = esDecimal ? valor * 100 : valor;
	
	return `${porcentaje.toLocaleString("es-MX", {
		minimumFractionDigits: decimales,
		maximumFractionDigits: decimales,
	})}%`;
}

/**
 * Formatea un número de teléfono mexicano
 * @param telefono - Número de teléfono a formatear
 * @returns String formateado o el valor original si no se puede formatear
 */
export function formatearTelefono(telefono: string | null | undefined): string {
	if (!telefono) return "";
	
	// Remover caracteres no numéricos
	const numeros = telefono.replace(/\D/g, "");
	
	// Formatear según la longitud
	if (numeros.length === 10) {
		return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
	} else if (numeros.length === 12) {
		// Con código de país
		return `+${numeros.slice(0, 2)} (${numeros.slice(2, 4)}) ${numeros.slice(4, 8)}-${numeros.slice(8)}`;
	}
	
	return telefono; // Retornar original si no coincide con formato esperado
}

/**
 * Formatea un RFC mexicano
 * @param rfc - RFC a formatear
 * @returns String formateado en mayúsculas o el valor original
 */
export function formatearRFC(rfc: string | null | undefined): string {
	if (!rfc) return "";
	
	return rfc.toUpperCase().trim();
}

/**
 * Trunca un texto a una longitud máxima
 * @param texto - Texto a truncar
 * @param longitudMaxima - Longitud máxima (default: 50)
 * @param sufijo - Sufijo a agregar si se trunca (default: "...")
 * @returns Texto truncado
 */
export function truncarTexto(
	texto: string | null | undefined,
	longitudMaxima: number = 50,
	sufijo: string = "..."
): string {
	if (!texto) return "";
	
	if (texto.length <= longitudMaxima) {
		return texto;
	}
	
	return `${texto.slice(0, longitudMaxima)}${sufijo}`;
}

/**
 * Capitaliza la primera letra de un texto
 * @param texto - Texto a capitalizar
 * @returns Texto con la primera letra en mayúscula
 */
export function capitalizar(texto: string | null | undefined): string {
	if (!texto) return "";
	
	return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Formatea bytes a formato legible (KB, MB, GB, etc.)
 * @param bytes - Cantidad de bytes
 * @param decimales - Número de decimales (default: 2)
 * @returns String formateado
 */
export function formatearBytes(bytes: number | null | undefined, decimales: number = 2): string {
	if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) {
		return "0 Bytes";
	}
	
	const k = 1024;
	const dm = decimales < 0 ? 0 : decimales;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

