import { apiBACK } from "./axiosInstance";
import type { CuentaContableGastosDTO as CuentaContableDTO } from "../types/gastos";
import type { RespuestaDTO } from "../types/utilidades";

/**
 * Servicio de gestión de Cuentas Contables
 * Migrado de CuentaContableGastosService de Angular
 * Usa los endpoints de /api/CuentasContablesGastos/{idEmpresa}/
 */
class CuentaContableService {
	private readonly apiUrl = `${import.meta.env.VITE_API_BACK_BASE_URL}CuentasContablesGastos`;

	/**
	 * Obtiene todas las cuentas contables de una empresa
	 */
	async obtenerTodos(idEmpresa: number): Promise<CuentaContableDTO[]> {
		const response = await apiBACK.get<CuentaContableDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerCuentasContables`
		);
		return response.data;
	}

	/**
	 * Obtiene una cuenta contable por ID
	 */
	async obtenerPorId(id: number, idEmpresa: number): Promise<CuentaContableDTO> {
		const response = await apiBACK.get<CuentaContableDTO>(
			`${this.apiUrl}/${idEmpresa}/Obtenerxid/${id}`
		);
		return response.data;
	}

	/**
	 * Obtiene cuentas contables para un empleado
	 */
	async obtenerParaEmpleado(idEmpresa: number): Promise<CuentaContableDTO[]> {
		const response = await apiBACK.get<CuentaContableDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerCuentasContablesParaEmpleado`
		);
		return response.data;
	}

	/**
	 * Obtiene cuentas contables por origen
	 */
	async obtenerOrigen(idEmpresa: number): Promise<CuentaContableDTO[]> {
		const response = await apiBACK.get<CuentaContableDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerCuentasContablesorigen`
		);
		return response.data;
	}

	/**
	 * Obtiene cuentas contables por tipo y plaza de empleado
	 */
	async obtenerPorTipo(
		idPlazaE: number,
		tipo: number,
		idEmpresa: number
	): Promise<CuentaContableDTO[]> {
		const response = await apiBACK.get<CuentaContableDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerCuentasContableXTipo/${idPlazaE}/${tipo}`
		);
		return response.data;
	}

	/**
	 * Obtiene cuentas contables por plaza de empleado
	 */
	async obtenerPorPlaza(
		idPlazaEm: number,
		idEmpresa: number
	): Promise<CuentaContableDTO[]> {
		const response = await apiBACK.get<CuentaContableDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerCuentasContablesXplaza/${idPlazaEm}`
		);
		return response.data;
	}

	/**
	 * Obtiene los tipos de cuentas contables
	 */
	async obtenerTipos(idEmpresa: number): Promise<unknown[]> {
		const response = await apiBACK.get<unknown[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerTipoCuentasContables`
		);
		return response.data;
	}

	/**
	 * Crea una nueva cuenta contable
	 */
	async crear(cuentaContable: CuentaContableDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/Crear`,
			cuentaContable
		);
		return response.data;
	}

	/**
	 * Actualiza una cuenta contable existente
	 */
	async actualizar(cuentaContable: CuentaContableDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/Editar`,
			cuentaContable
		);
		return response.data;
	}

	/**
	 * Elimina una cuenta contable (usando PUT según la documentación)
	 * Requiere el objeto completo con todos los campos necesarios
	 */
	async eliminar(cuentaContable: CuentaContableDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/Borrar`,
			cuentaContable
		);
		return response.data;
	}
}

export const cuentaContableService = new CuentaContableService();

