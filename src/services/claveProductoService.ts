import { apiBACK } from "./axiosInstance";
import type { ClaveProductoDTO } from "../types/catalogos";
import type { RespuestaDTO } from "../types/utilidades";

/**
 * Servicio de gestión de Claves de Producto
 * Migrado de ClaveProdSATService de Angular
 * Usa los endpoints de /api/ClavesProdSAT/{idEmpresa}/
 */
class ClaveProductoService {
	private readonly apiUrl = `${import.meta.env.VITE_API_BACK_BASE_URL}ClavesProdSAT`;

	/**
	 * Obtiene claves de producto por impuesto y división
	 * @param impuesto - true para impuestos, false para productos
	 */
	async obtenerPorImpuestoYDivision(
		impuesto: boolean,
		idDivision: number,
		idEmpresa: number
	): Promise<ClaveProductoDTO[]> {
		// Convertir booleano a string para la URL
		const impuestoStr = impuesto ? "true" : "false";
		const response = await apiBACK.get<ClaveProductoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerClavesProd/${impuestoStr}/${idDivision}`
		);
		return response.data;
	}

	/**
	 * Obtiene una clave de producto por ID
	 */
	async obtenerPorId(id: number, idEmpresa: number): Promise<ClaveProductoDTO> {
		const response = await apiBACK.get<ClaveProductoDTO>(
			`${this.apiUrl}/${idEmpresa}/ObtenerClavexid/${id}`
		);
		return response.data;
	}

	/**
	 * Obtiene todas las claves de producto con división
	 */
	async obtenerConDivision(idEmpresa: number): Promise<ClaveProductoDTO[]> {
		const response = await apiBACK.get<ClaveProductoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerClavesProdDivision`
		);
		return response.data;
	}

	/**
	 * Obtiene claves de producto por división (por ID)
	 */
	async obtenerPorDivision(id: number, idEmpresa: number): Promise<ClaveProductoDTO> {
		const response = await apiBACK.get<ClaveProductoDTO>(
			`${this.apiUrl}/${idEmpresa}/ObtenerClaveDivisionxid/${id}`
		);
		return response.data;
	}

	/**
	 * Obtiene todas las claves de producto de una empresa
	 * (Wrapper para mantener compatibilidad con el hook)
	 */
	async obtenerTodos(idEmpresa: number): Promise<ClaveProductoDTO[]> {
		return this.obtenerConDivision(idEmpresa);
	}

	/**
	 * Crea una nueva clave de producto por división
	 */
	async crear(claveProducto: ClaveProductoDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/CrearxDivision`,
			claveProducto
		);
		return response.data;
	}

	/**
	 * Elimina una clave de producto de división (usando PUT según la documentación)
	 * Requiere el objeto completo con todos los campos necesarios
	 */
	async eliminar(claveProducto: ClaveProductoDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/BorrarClaveDivision`,
			claveProducto
		);
		return response.data;
	}

	/**
	 * Obtiene categorías por tipo
	 * @param tipo - true para impuestos, false para productos
	 */
	async obtenerCategorias(tipo: boolean, idEmpresa: number): Promise<unknown[]> {
		// Convertir booleano a string para la URL
		const tipoStr = tipo ? "true" : "false";
		const response = await apiBACK.get<unknown[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerCategorias/${tipoStr}`
		);
		return response.data;
	}

	/**
	 * Obtiene categoría por ID
	 */
	async obtenerCategoriaPorId(id: number, idEmpresa: number): Promise<unknown> {
		const response = await apiBACK.get<unknown>(
			`${this.apiUrl}/${idEmpresa}/ObtenerCategoriaXID/${id}`
		);
		return response.data;
	}
}

export const claveProductoService = new ClaveProductoService();

