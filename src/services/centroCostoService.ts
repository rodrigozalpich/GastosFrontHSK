import { apiBACK } from "./axiosInstance";
import type { CentroCostoDTO } from "../types/catalogos";
import type { RespuestaDTO } from "../types/utilidades";

/**
 * Servicio de gestión de Centros de Costos
 * Migrado de CentroCostosService de Angular
 */
class CentroCostoService {
	private readonly apiUrl = `${import.meta.env.VITE_API_BACK_BASE_URL}centrocosto`;

	/**
	 * Obtiene todos los centros de costos de una empresa
	 */
	async obtenerTodos(idEmpresa: number): Promise<CentroCostoDTO[]> {
		const response = await apiBACK.get<CentroCostoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenTodos`
		);
		return response.data;
	}

	/**
	 * Obtiene un centro de costo por ID
	 */
	async obtenerPorId(id: number, idEmpresa: number): Promise<CentroCostoDTO> {
		const response = await apiBACK.get<CentroCostoDTO>(
			`${this.apiUrl}/${idEmpresa}/ObtenerXId/${id}`
		);
		return response.data;
	}

	/**
	 * Crea un nuevo centro de costo
	 */
	async crear(centroCosto: CentroCostoDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/GuardarCentroCosto`,
			centroCosto
		);
		return response.data;
	}

	/**
	 * Actualiza un centro de costo existente
	 */
	async actualizar(centroCosto: CentroCostoDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/EditarCentroCosto`,
			centroCosto
		);
		return response.data;
	}

	/**
	 * Elimina un centro de costo
	 */
	async eliminar(id: number, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.delete<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/${id}`
		);
		return response.data;
	}
}

export const centroCostoService = new CentroCostoService();

