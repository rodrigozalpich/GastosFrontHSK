import { apiBACK } from "./axiosInstance";
import type { PolizaGastosDTO, PolizaDetalleGastosDTO, GastoDTO } from "../types/gastos";
import type { RespuestaDTO } from "../types/utilidades";

/**
 * Servicio de gestión de Pólizas de Gastos
 * Migrado de PolizasService de Angular
 */
class PolizaService {
	private readonly apiUrl = `${import.meta.env.VITE_API_BACK_BASE_URL}PolizasGastos`;

	/**
	 * Obtiene gastos disponibles para crear pólizas
	 */
	async obtenerGastosParaPolizas(idEmpresa: number): Promise<GastoDTO[]> {
		const response = await apiBACK.get<GastoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerGastosParaPolizas`
		);
		return response.data;
	}

	/**
	 * Obtiene todas las pólizas de una empresa (legacy, usar obtenerGastosParaPolizas)
	 */
	async obtenerTodas(idEmpresa: number): Promise<GastoDTO[]> {
		return this.obtenerGastosParaPolizas(idEmpresa);
	}

	/**
	 * Obtiene una póliza por ID
	 */
	async obtenerPorId(id: number, idEmpresa: number): Promise<PolizaGastosDTO> {
		const response = await apiBACK.get<PolizaGastosDTO>(
			`${this.apiUrl}/${idEmpresa}/ObtenerPolizaxId/${id}`
		);
		return response.data;
	}

	/**
	 * Obtiene los detalles de una póliza
	 */
	async obtenerDetalles(idPoliza: number, idEmpresa: number): Promise<PolizaDetalleGastosDTO[]> {
		const response = await apiBACK.get<PolizaDetalleGastosDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerDetallesPoliza/${idPoliza}`
		);
		return response.data;
	}

	/**
	 * Carga las pólizas para un rango de fechas
	 */
	async cargarPolizas(
		fechaInicio: string,
		fechaFin: string,
		idEmpresa: number
	): Promise<PolizaGastosDTO[]> {
		const response = await apiBACK.get<PolizaGastosDTO[]>(
			`${this.apiUrl}/${idEmpresa}/CargarPolizas`,
			{
				params: {
					fechaInicio,
					fechaFin,
				},
			}
		);
		return response.data;
	}

	/**
	 * Crea una nueva póliza de gastos
	 * @param idGasto - ID del gasto
	 * @param tipoPoliza - Tipo de póliza: 1 = Ingreso, 2 = Egreso, 3 = Diario
	 * @param idEmpresa - ID de la empresa
	 */
	async crearPoliza(idGasto: number, tipoPoliza: number, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.get<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/Crear/${idGasto}/${tipoPoliza}`
		);
		return response.data;
	}

	/**
	 * Obtiene una póliza por ID de gasto y tipo de póliza
	 * @param idGasto - ID del gasto
	 * @param tipoPoliza - Tipo de póliza: 1 = Ingreso, 2 = Egreso, 3 = Diario
	 * @param idEmpresa - ID de la empresa
	 */
	async obtenerPolizaxidGastoYTipoPoliza(
		idGasto: number,
		tipoPoliza: number,
		idEmpresa: number
	): Promise<PolizaGastosDTO> {
		const response = await apiBACK.get<PolizaGastosDTO>(
			`${this.apiUrl}/${idEmpresa}/ObtenerPolizaxidGastoYTipoPoliza/${idGasto}/${tipoPoliza}`
		);
		return response.data;
	}

	/**
	 * Obtiene los detalles de una póliza por ID de póliza
	 */
	async obtenerDetallePolizasxidPoliza(
		idPoliza: number,
		idEmpresa: number
	): Promise<PolizaDetalleGastosDTO[]> {
		const response = await apiBACK.get<PolizaDetalleGastosDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerDetallePolizasxidPoliza/${idPoliza}`
		);
		return response.data;
	}

	/**
	 * Actualiza una póliza existente
	 */
	async actualizarPoliza(poliza: PolizaGastosDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/EditarPoliza`,
			poliza
		);
		return response.data;
	}

	/**
	 * Elimina una póliza
	 */
	async eliminarPoliza(id: number, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.delete<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/${id}`
		);
		return response.data;
	}
}

export const polizaService = new PolizaService();

