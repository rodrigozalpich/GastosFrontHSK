import { apiBACK } from "./axiosInstance";

/**
 * Interfaz para una moneda
 */
export interface MonedaDTO {
	id: number;
	nombre?: string;
	descripcion?: string;
	codigo?: string;
	[key: string]: unknown;
}

/**
 * Servicio de gestión de Monedas
 * Usa los endpoints de /api/Moneda/{idEmpresa}/
 */
class MonedaService {
	private readonly apiUrl = `${import.meta.env.VITE_API_BACK_BASE_URL}Moneda`;

	/**
	 * Obtiene todas las monedas de una empresa
	 */
	async obtenerTodos(idEmpresa: number): Promise<MonedaDTO[]> {
		const response = await apiBACK.get<MonedaDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerMonedas`
		);
		return response.data;
	}
}

export const monedaService = new MonedaService();

