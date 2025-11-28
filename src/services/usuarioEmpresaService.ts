import { apiSSO } from "./axiosInstance";
import type { Empresa1 } from "../types/empresas";

/**
 * Servicio para gestionar las empresas asociadas a un usuario
 */
export const usuarioEmpresaService = {
	/**
	 * Obtiene las empresas a las que pertenece el usuario actual
	 * @returns Promise con el array de empresas
	 */
	async obtenEmpresasPorUsuario(): Promise<Empresa1[]> {
		const { data } = await apiSSO.get<Empresa1[]>("usuarioempresas/empresasPertenecientes");
		return data;
	},
};

