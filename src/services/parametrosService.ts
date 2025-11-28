import { apiBACK } from "./axiosInstance";
import type { ParametrosEmpresaGastosDTO } from "../types/gastos";
import type { RespuestaDTO } from "../types/utilidades";

/**
 * Servicio de gestión de Parámetros de Empresa de Gastos
 * Migrado de ParametrosEmpresaGastosService de Angular
 */
class ParametrosService {
	private readonly apiUrl = `${import.meta.env.VITE_API_BACK_BASE_URL}ParametrosEmpresaGastos`;

	/**
	 * Obtiene todos los parámetros de una empresa
	 */
	async obtenerTodos(idEmpresa: number): Promise<ParametrosEmpresaGastosDTO[]> {
		const response = await apiBACK.get<ParametrosEmpresaGastosDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerParametros`
		);
		return response.data;
	}

	/**
	 * Obtiene un parámetro por ID
	 */
	async obtenerPorId(id: number, idEmpresa: number): Promise<ParametrosEmpresaGastosDTO> {
		const response = await apiBACK.get<ParametrosEmpresaGastosDTO>(
			`${this.apiUrl}/${idEmpresa}/ObtenerParametroxId/${id}`
		);
		return response.data;
	}

	/**
	 * Obtiene un parámetro por permiso
	 */
	async obtenerPorPermiso(permiso: string, idEmpresa: number): Promise<ParametrosEmpresaGastosDTO | null> {
		const response = await apiBACK.get<ParametrosEmpresaGastosDTO>(
			`${this.apiUrl}/${idEmpresa}/ObtenerXPermiso/${permiso}`
		);
		return response.data || null;
	}

	/**
	 * Obtiene un parámetro por permiso con detalle
	 * Nota: El endpoint no requiere parámetro de permiso según la documentación
	 */
	async obtenerPorPermisoDetamano(idEmpresa: number): Promise<ParametrosEmpresaGastosDTO | null> {
		const response = await apiBACK.get<ParametrosEmpresaGastosDTO>(
			`${this.apiUrl}/${idEmpresa}/ObtenerXPermisoDetamano`
		);
		return response.data || null;
	}

	/**
	 * Guarda un parámetro (crea o actualiza)
	 */
	async guardar(parametro: ParametrosEmpresaGastosDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/Guardar`,
			parametro
		);
		return response.data;
	}

	/**
	 * Edita un parámetro existente
	 */
	async editar(parametro: ParametrosEmpresaGastosDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/Editar`,
			parametro
		);
		return response.data;
	}

	/**
	 * Elimina un parámetro
	 */
	async eliminar(id: number, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.delete<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/BorrarParametro/${id}`
		);
		return response.data;
	}
}

export const parametrosService = new ParametrosService();

