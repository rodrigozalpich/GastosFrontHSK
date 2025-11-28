import { apiBACK } from "./axiosInstance";
import type { PlazaDTO } from "../types/catalogos";
import type { RespuestaDTO } from "../types/utilidades";

/**
 * Servicio de gestión de Plazas
 * Migrado de PlazasService de Angular
 * Usa los endpoints de /api/Plazas/{idEmpresa}/
 */
class PlazaService {
	private readonly apiUrl = `${import.meta.env.VITE_API_BACK_BASE_URL}Plazas`;

	/**
	 * Obtiene todas las plazas de una empresa
	 */
	async obtenerTodos(idEmpresa: number): Promise<PlazaDTO[]> {
		const response = await apiBACK.get<PlazaDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerPlazas`
		);
		return response.data;
	}

	/**
	 * Obtiene una plaza por ID
	 */
	async obtenerPorId(id: number, idEmpresa: number): Promise<PlazaDTO> {
		const response = await apiBACK.get<PlazaDTO>(
			`${this.apiUrl}/${idEmpresa}/Obtenerxid/${id}`
		);
		return response.data;
	}

	/**
	 * Obtiene plazas por división
	 */
	async obtenerPorDivision(idDivision: number, idEmpresa: number): Promise<PlazaDTO[]> {
		const response = await apiBACK.get<PlazaDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerxidDivision/${idDivision}`
		);
		return response.data;
	}

	/**
	 * Obtiene plazas disponibles por división
	 */
	async obtenerPorDivisionDisponible(
		idDivision: number,
		idEmpresa: number
	): Promise<PlazaDTO[]> {
		const response = await apiBACK.get<PlazaDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerxidDivisionDisponible/${idDivision}`
		);
		return response.data;
	}

	/**
	 * Obtiene plazas disponibles por división (alias para compatibilidad)
	 */
	async obtenerXIdDivisionDisponibles(
		idDivision: number,
		idEmpresa: number
	): Promise<PlazaDTO[]> {
		return this.obtenerPorDivisionDisponible(idDivision, idEmpresa);
	}

	/**
	 * Crea una nueva plaza
	 */
	async crear(plaza: PlazaDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/Crear`,
			plaza
		);
		return response.data;
	}

	/**
	 * Actualiza una plaza existente
	 */
	async actualizar(plaza: PlazaDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/Editar`,
			plaza
		);
		return response.data;
	}

	/**
	 * Elimina una plaza (usando PUT según la documentación)
	 * Requiere el objeto completo con todos los campos necesarios
	 */
	async eliminar(plaza: PlazaDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/Borrar`,
			plaza
		);
		return response.data;
	}
}

export const plazaService = new PlazaService();

