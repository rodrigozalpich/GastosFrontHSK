import { apiBACK } from "./axiosInstance";
import type { GastoDTO, RespuestaTimbradoDTO } from "../types/gastos";

/**
 * Servicio de gestión de Timbrado de Gastos
 * Migrado de TimbradoService de Angular
 */
class TimbradoService {
	private readonly apiUrl = `${import.meta.env.VITE_API_BACK_BASE_URL}TimbradoGastos`;

	/**
	 * Obtiene gastos que necesitan ser timbrados
	 */
	async obtenerGastosPorTimbrar(idEmpresa: number): Promise<GastoDTO[]> {
		const response = await apiBACK.get<GastoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerGastosxTimbrar`
		);
		return response.data;
	}

	/**
	 * Obtiene gastos que ya están timbrados
	 */
	async obtenerGastosTimbrados(idEmpresa: number): Promise<GastoDTO[]> {
		const response = await apiBACK.get<GastoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerGastosTimbrados`
		);
		return response.data;
	}

	/**
	 * Timbra un gasto
	 */
	async timbrarGasto(idGastos: number[], idEmpresa: number): Promise<RespuestaTimbradoDTO[]> {
		const response = await apiBACK.put<RespuestaTimbradoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/Timbrar`,
			idGastos
		);
		return response.data;
	}

	/**
	 * Obtiene todos los gastos relacionados con timbrado (por timbrar y timbrados)
	 */
	async obtenerTodosGastosTimbrado(idEmpresa: number): Promise<GastoDTO[]> {
		const response = await apiBACK.get<GastoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerTodosGastosTimbrado`
		);
		return response.data;
	}
}

export const timbradoService = new TimbradoService();

