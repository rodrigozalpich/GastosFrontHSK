import axios from "axios";
import type { CredencialesUsuario, RespuestaAutenticacion } from "../types/seguridad";

/**
 * Servicio de seguridad multiempresa
 * Adaptado de SeguridadMultiEmpresaService de Angular
 */
class SeguridadService {
	private readonly zvLlaveToken = "token";
	private readonly zvLlaveExpiracion = "token-expiracion";
	private readonly idEmpresa = "idEmpresa";
	private readonly apiUrl = `${import.meta.env.VITE_API_SSO_BASE_URL}cuenta`;

	/**
	 * Realiza el login del usuario
	 * @param credenciales - Credenciales del usuario
	 * @returns Promise con la respuesta de autenticación
	 */
	async login(credenciales: CredencialesUsuario): Promise<RespuestaAutenticacion> {
		const response = await axios.post<RespuestaAutenticacion>(
			`${this.apiUrl}/login`,
			credenciales
		);
		return response.data;
	}

	/**
	 * Guarda el token y fecha de expiración en localStorage
	 * @param respuestaAutenticacion - Respuesta de autenticación del servidor
	 */
	guardarToken(respuestaAutenticacion: RespuestaAutenticacion): void {
		localStorage.setItem(this.zvLlaveToken, respuestaAutenticacion.token);
		if (respuestaAutenticacion.fechaExpiracion) {
			const fechaExpiracion = typeof respuestaAutenticacion.fechaExpiracion === "string"
				? respuestaAutenticacion.fechaExpiracion
				: respuestaAutenticacion.fechaExpiracion.toString();
			localStorage.setItem(this.zvLlaveExpiracion, fechaExpiracion);
		}
	}

	/**
	 * Obtiene el token del localStorage
	 * @returns Token JWT o null si no existe
	 */
	obtenerToken(): string | null {
		return localStorage.getItem(this.zvLlaveToken);
	}

	/**
	 * Verifica si el usuario está logueado
	 * @returns true si está logueado y el token no ha expirado
	 */
	estaLogueado(): boolean {
		const token = this.obtenerToken();
		if (!token) {
			return false;
		}

		const fechaExpiracion = localStorage.getItem(this.zvLlaveExpiracion);
		if (!fechaExpiracion) {
			return false;
		}

		const fechaExpiracionDate = new Date(fechaExpiracion);
		if (fechaExpiracionDate <= new Date()) {
			this.logout();
			return false;
		}

		return true;
	}

	/**
	 * Obtiene un campo específico del JWT decodificado
	 * @param campo - Nombre del campo a obtener
	 * @returns Valor del campo o string vacío si no existe
	 */
	obtenerCampoJwt(campo: string): string {
		const token = this.obtenerToken();
		if (!token) {
			return "";
		}

		try {
			const dataToken = this.parseJwtUtf8(token);
			const valor = dataToken[campo];
			
			// Convertir a string si existe, o retornar string vacío
			if (valor === undefined || valor === null) {
				return "";
			}
			return String(valor);
		} catch (error) {
			console.error("Error al decodificar JWT:", error);
			return "";
		}
	}

	/**
	 * Obtiene un permiso especial por pantalla del JWT
	 * @param valor - Clave del permiso
	 * @returns Valor del permiso o string vacío
	 */
	obtenerPermisoEspecialPantalla(valor: string): string {
		return this.obtenerCampoJwt(valor);
	}

	/**
	 * Decodifica un JWT con soporte UTF-8
	 * Mantiene la lógica exacta de Angular para compatibilidad
	 * @param token - Token JWT
	 * @returns Objeto con los datos del token
	 */
	private parseJwtUtf8(token: string): Record<string, unknown> {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
				.join("")
		);
		return JSON.parse(jsonPayload);
	}

	/**
	 * Obtiene el ID de la empresa activa del localStorage
	 * @returns ID de empresa o null
	 */
	obtenerIdEmpresa(): string | null {
		return localStorage.getItem(this.idEmpresa);
	}

	/**
	 * Guarda el ID de la empresa activa en localStorage
	 * @param idEmpresa - ID de la empresa
	 */
	guardarIdEmpresa(idEmpresa: number): void {
		localStorage.setItem(this.idEmpresa, idEmpresa.toString());
	}

	/**
	 * Envía respuesta del frontend al backend después del login
	 * Esta llamada puede no requerir autenticación o puede fallar sin afectar el login
	 * @param credenciales - Credenciales del usuario
	 * @returns Promise con la respuesta o null si falla
	 */
	async respuestaFront(credenciales: CredencialesUsuario): Promise<RespuestaAutenticacion | null> {
		// Crear una instancia de axios completamente nueva sin interceptores
		// para evitar que se agregue el token automáticamente
		const axiosSinInterceptores = axios.create({
			baseURL: import.meta.env.VITE_API_SSO_BASE_URL,
		});
		
		try {
			const response = await axiosSinInterceptores.post<RespuestaAutenticacion>(
				`${this.apiUrl}/RespuestaFront`,
				credenciales,
				{
					headers: {
						'Content-Type': 'application/json',
					},
					// Aceptar 200, 201, 204, 401 como respuestas válidas (no lanzar error)
					validateStatus: (status) => {
						return (status >= 200 && status < 300) || status === 401 || status === 204;
					},
				}
			);
			
			// Si es 401 o 204, retornar null sin error
			if (response.status === 401 || response.status === 204) {
				return null;
			}
			return response.data;
		} catch {
			// Suprimir completamente el error para esta llamada no crítica
			// 401 y 204 son respuestas esperadas y no son errores
			// No loguear ni mostrar errores en consola
			return null;
		}
	}

	/**
	 * Cierra la sesión del usuario y limpia el localStorage
	 */
	logout(): void {
		localStorage.removeItem(this.zvLlaveToken);
		localStorage.removeItem(this.zvLlaveExpiracion);
		localStorage.removeItem(this.idEmpresa);
	}
}

// Exportar instancia singleton
export const seguridadService = new SeguridadService();


