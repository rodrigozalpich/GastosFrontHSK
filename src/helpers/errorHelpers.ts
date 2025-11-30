/**
 * Helpers para manejo centralizado de errores en la aplicación
 */

/**
 * Tipos de errores comunes en la aplicación
 */
export type ErrorType = 
	| "NETWORK_ERROR"
	| "AUTH_ERROR"
	| "VALIDATION_ERROR"
	| "SERVER_ERROR"
	| "UNKNOWN_ERROR";

/**
 * Interfaz para errores estructurados
 */
export interface AppError {
	type: ErrorType;
	message: string;
	originalError?: unknown;
	statusCode?: number;
}

/**
 * Extrae un mensaje legible de un error
 * @param error - Error desconocido
 * @returns Mensaje de error legible
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	if (error && typeof error === "object" && "message" in error) {
		return String(error.message);
	}
	return "Error desconocido";
}

/**
 * Crea un objeto de error estructurado
 * @param error - Error original
 * @param type - Tipo de error
 * @returns Objeto de error estructurado
 */
export function createAppError(error: unknown, type: ErrorType = "UNKNOWN_ERROR"): AppError {
	const message = getErrorMessage(error);
	
	let statusCode: number | undefined;
	if (error && typeof error === "object" && "response" in error) {
		const axiosError = error as { response?: { status?: number } };
		statusCode = axiosError.response?.status;
	}

	return {
		type,
		message,
		originalError: error,
		statusCode,
	};
}

/**
 * Determina el tipo de error basado en el código de estado HTTP
 * @param statusCode - Código de estado HTTP
 * @returns Tipo de error
 */
export function getErrorTypeFromStatusCode(statusCode?: number): ErrorType {
	if (!statusCode) {
		return "UNKNOWN_ERROR";
	}
	
	if (statusCode === 401 || statusCode === 403) {
		return "AUTH_ERROR";
	}
	if (statusCode >= 400 && statusCode < 500) {
		return "VALIDATION_ERROR";
	}
	if (statusCode >= 500) {
		return "SERVER_ERROR";
	}
	if (statusCode === 0 || statusCode === -1) {
		return "NETWORK_ERROR";
	}
	
	return "UNKNOWN_ERROR";
}

/**
 * Formatea un error para mostrar al usuario
 * @param error - Error a formatear
 * @returns Mensaje formateado para el usuario
 */
export function formatErrorForUser(error: unknown): string {
	const appError = createAppError(error);
	
	switch (appError.type) {
		case "NETWORK_ERROR":
			return "Error de conexión. Por favor, verifica tu conexión a internet.";
		case "AUTH_ERROR":
			return "Error de autenticación. Por favor, inicia sesión nuevamente.";
		case "VALIDATION_ERROR":
			return appError.message || "Error de validación. Por favor, verifica los datos ingresados.";
		case "SERVER_ERROR":
			return "Error del servidor. Por favor, intenta nuevamente más tarde.";
		default:
			return appError.message || "Ha ocurrido un error inesperado.";
	}
}

/**
 * Log de errores para debugging (en producción podría enviarse a un servicio de logging)
 * @param error - Error a loguear
 * @param context - Contexto adicional del error
 */
export function logError(error: unknown, context?: string): void {
	const appError = createAppError(error);
	
	if (import.meta.env.DEV) {
		console.error("Error:", {
			type: appError.type,
			message: appError.message,
			statusCode: appError.statusCode,
			context,
			originalError: appError.originalError,
		});
	}
	// En producción, aquí se podría enviar a un servicio de logging como Sentry, LogRocket, etc.
}

