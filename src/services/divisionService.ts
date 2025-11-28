import { apiBACK } from "./axiosInstance";
import type { DivisionDTO } from "../types/catalogos";
import type { RespuestaDTO } from "../types/utilidades";

/**
 * Servicio de gestión de Divisiones
 * Migrado de DivisionService de Angular
 * Usa los endpoints de /api/Divisiones/{idEmpresa}/
 */
class DivisionService {
	private readonly apiUrl = `${import.meta.env.VITE_API_BACK_BASE_URL}Divisiones`;

	/**
	 * Obtiene todas las divisiones de una empresa
	 */
	async obtenerTodos(idEmpresa: number): Promise<DivisionDTO[]> {
		const response = await apiBACK.get<DivisionDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerDivisiones`
		);
		return response.data;
	}

	/**
	 * Obtiene todas las divisiones activas de una empresa
	 */
	async obtenerActivos(idEmpresa: number): Promise<DivisionDTO[]> {
		const response = await apiBACK.get<DivisionDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerDivisionesActivos`
		);
		return response.data;
	}

	/**
	 * Obtiene divisiones por ID de empleado
	 */
	async obtenerPorIdEmpleado(idEmpleado: number, idEmpresa: number): Promise<DivisionDTO[]> {
		const response = await apiBACK.get<DivisionDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerDivisionesxidEmpleado/${idEmpleado}`
		);
		return response.data;
	}

	/**
	 * Obtiene una división por ID
	 */
	async obtenerPorId(id: number, idEmpresa: number): Promise<DivisionDTO> {
		const response = await apiBACK.get<DivisionDTO>(
			`${this.apiUrl}/${idEmpresa}/Obtenerxid/${id}`
		);
		return response.data;
	}

	/**
	 * Crea una nueva división
	 */
	async crear(division: DivisionDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/Crear`,
			division
		);
		return response.data;
	}

	/**
	 * Actualiza una división existente
	 */
	async actualizar(division: DivisionDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/Editar`,
			division
		);
		return response.data;
	}

	/**
	 * Elimina una división (usando PUT según la documentación)
	 * Requiere el objeto completo con todos los campos necesarios
	 */
	async eliminar(division: DivisionDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/Borrar`,
			division
		);
		return response.data;
	}
}

export const divisionService = new DivisionService();

