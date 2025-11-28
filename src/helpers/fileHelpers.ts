/**
 * Helpers para manejo de archivos (carga, descarga, validación, etc.)
 */

/**
 * Crea un FormData a partir de un objeto
 * @param datos - Objeto con los datos a agregar al FormData
 * @returns FormData con los datos agregados
 */
export function crearFormData(datos: Record<string, unknown>): FormData {
	const formData = new FormData();
	
	Object.entries(datos).forEach(([key, value]) => {
		if (value !== null && value !== undefined) {
			if (value instanceof File || value instanceof Blob) {
				formData.append(key, value);
			} else if (Array.isArray(value)) {
				value.forEach((item, index) => {
					if (item instanceof File || item instanceof Blob) {
						formData.append(`${key}[${index}]`, item);
					} else {
						formData.append(`${key}[${index}]`, String(item));
					}
				});
			} else {
				formData.append(key, String(value));
			}
		}
	});
	
	return formData;
}

/**
 * Descarga un archivo desde un Blob o ArrayBuffer
 * @param data - Datos del archivo (Blob, ArrayBuffer, o string)
 * @param nombreArchivo - Nombre del archivo a descargar
 * @param tipoMIME - Tipo MIME del archivo (default: "application/octet-stream")
 */
export function descargarArchivo(
	data: Blob | ArrayBuffer | string,
	nombreArchivo: string,
	tipoMIME: string = "application/octet-stream"
): void {
	let blob: Blob;
	
	if (typeof data === "string") {
		// Si es un string, asumimos que es una URL o base64
		// Para URLs, mejor usar window.open o un enlace
		window.open(data, "_blank");
		return;
	} else if (data instanceof ArrayBuffer) {
		blob = new Blob([data], { type: tipoMIME });
	} else {
		blob = data;
	}
	
	const url = URL.createObjectURL(blob);
	const enlace = document.createElement("a");
	enlace.href = url;
	enlace.download = nombreArchivo;
	document.body.appendChild(enlace);
	enlace.click();
	document.body.removeChild(enlace);
	URL.revokeObjectURL(url);
}

/**
 * Descarga un archivo desde una respuesta de API (response.data)
 * @param responseData - Datos de la respuesta de la API (Blob o ArrayBuffer)
 * @param nombreArchivo - Nombre del archivo a descargar
 * @param tipoMIME - Tipo MIME del archivo (default: detectado automáticamente)
 */
export function descargarArchivoDesdeRespuesta(
	responseData: Blob | ArrayBuffer,
	nombreArchivo: string,
	tipoMIME?: string
): void {
	const blob = responseData instanceof ArrayBuffer 
		? new Blob([responseData], { type: tipoMIME || "application/octet-stream" })
		: responseData;
	
	descargarArchivo(blob, nombreArchivo, tipoMIME);
}

/**
 * Valida el tipo de archivo
 * @param archivo - Archivo a validar
 * @param tiposPermitidos - Array de tipos MIME permitidos (ej: ["image/jpeg", "image/png"])
 * @returns true si el tipo es permitido, false en caso contrario
 */
export function validarTipoArchivo(archivo: File, tiposPermitidos: string[]): boolean {
	return tiposPermitidos.includes(archivo.type);
}

/**
 * Valida el tamaño de un archivo
 * @param archivo - Archivo a validar
 * @param tamanoMaximoMB - Tamaño máximo en MB
 * @returns true si el tamaño es válido, false en caso contrario
 */
export function validarTamanoArchivo(archivo: File, tamanoMaximoMB: number): boolean {
	const tamanoMaximoBytes = tamanoMaximoMB * 1024 * 1024;
	return archivo.size <= tamanoMaximoBytes;
}

/**
 * Obtiene la extensión de un archivo
 * @param nombreArchivo - Nombre del archivo
 * @returns Extensión del archivo (sin el punto) o string vacío
 */
export function obtenerExtensionArchivo(nombreArchivo: string): string {
	const ultimoPunto = nombreArchivo.lastIndexOf(".");
	if (ultimoPunto === -1) return "";
	return nombreArchivo.slice(ultimoPunto + 1).toLowerCase();
}

/**
 * Obtiene el nombre del archivo sin la extensión
 * @param nombreArchivo - Nombre del archivo
 * @returns Nombre del archivo sin extensión
 */
export function obtenerNombreSinExtension(nombreArchivo: string): string {
	const ultimoPunto = nombreArchivo.lastIndexOf(".");
	if (ultimoPunto === -1) return nombreArchivo;
	return nombreArchivo.slice(0, ultimoPunto);
}

/**
 * Convierte un archivo a base64
 * @param archivo - Archivo a convertir
 * @returns Promise con el string base64
 */
export function convertirArchivoABase64(archivo: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		
		reader.onload = () => {
			if (typeof reader.result === "string") {
				// Remover el prefijo data:type;base64,
				const base64 = reader.result.split(",")[1];
				resolve(base64);
			} else {
				reject(new Error("Error al convertir archivo a base64"));
			}
		};
		
		reader.onerror = () => {
			reject(new Error("Error al leer el archivo"));
		};
		
		reader.readAsDataURL(archivo);
	});
}

/**
 * Convierte un archivo a ArrayBuffer
 * @param archivo - Archivo a convertir
 * @returns Promise con el ArrayBuffer
 */
export function convertirArchivoAArrayBuffer(archivo: File): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		
		reader.onload = () => {
			if (reader.result instanceof ArrayBuffer) {
				resolve(reader.result);
			} else {
				reject(new Error("Error al convertir archivo a ArrayBuffer"));
			}
		};
		
		reader.onerror = () => {
			reject(new Error("Error al leer el archivo"));
		};
		
		reader.readAsArrayBuffer(archivo);
	});
}

/**
 * Valida si un archivo es una imagen
 * @param archivo - Archivo a validar
 * @returns true si es una imagen, false en caso contrario
 */
export function esImagen(archivo: File): boolean {
	return archivo.type.startsWith("image/");
}

/**
 * Valida si un archivo es un PDF
 * @param archivo - Archivo a validar
 * @returns true si es un PDF, false en caso contrario
 */
export function esPDF(archivo: File): boolean {
	return archivo.type === "application/pdf" || obtenerExtensionArchivo(archivo.name) === "pdf";
}

/**
 * Valida si un archivo es un Excel
 * @param archivo - Archivo a validar
 * @returns true si es un Excel, false en caso contrario
 */
export function esExcel(archivo: File): boolean {
	const extension = obtenerExtensionArchivo(archivo.name);
	const tiposExcel = ["xlsx", "xls", "xlsm"];
	return tiposExcel.includes(extension) || 
		archivo.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
		archivo.type === "application/vnd.ms-excel";
}

/**
 * Valida si un archivo es un XML
 * @param archivo - Archivo a validar
 * @returns true si es un XML, false en caso contrario
 */
export function esXML(archivo: File): boolean {
	return archivo.type === "application/xml" || 
		archivo.type === "text/xml" ||
		obtenerExtensionArchivo(archivo.name) === "xml";
}

/**
 * Obtiene un mensaje de error para tipo de archivo inválido
 * @param tiposPermitidos - Tipos MIME permitidos
 * @returns Mensaje de error
 */
export function obtenerMensajeErrorTipoArchivo(tiposPermitidos: string[]): string {
	const extensiones = tiposPermitidos.map(tipo => {
		if (tipo.includes("image")) return "imágenes";
		if (tipo.includes("pdf")) return "PDF";
		if (tipo.includes("excel") || tipo.includes("spreadsheet")) return "Excel";
		if (tipo.includes("xml")) return "XML";
		return tipo;
	});
	
	return `Solo se permiten archivos: ${extensiones.join(", ")}`;
}

/**
 * Obtiene un mensaje de error para tamaño de archivo inválido
 * @param tamanoMaximoMB - Tamaño máximo en MB
 * @returns Mensaje de error
 */
export function obtenerMensajeErrorTamanoArchivo(tamanoMaximoMB: number): string {
	return `El archivo no puede ser mayor a ${tamanoMaximoMB} MB`;
}

/**
 * Crea una URL de objeto (blob URL) para previsualizar un archivo
 * @param archivo - Archivo a previsualizar
 * @returns URL del blob o null si hay error
 */
export function crearURLPrevisualizacion(archivo: File): string | null {
	try {
		return URL.createObjectURL(archivo);
	} catch (error) {
		console.error("Error al crear URL de previsualización:", error);
		return null;
	}
}

/**
 * Revoca una URL de objeto (blob URL) para liberar memoria
 * @param url - URL del blob a revocar
 */
export function revocarURLPrevisualizacion(url: string): void {
	try {
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error("Error al revocar URL de previsualización:", error);
	}
}

