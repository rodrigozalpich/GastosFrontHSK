import { apiBACK } from "./axiosInstance";
import type {
	DatosEmpleadoDTO,
	PlazaEmpleadoDTO,
	PlazaCuentaDTO,
	PlazaCentroDTO,
	ArbolDTO,
	AutorizadoresDTO,
	ArbolAutorizadoresDTO,
	RolPlazaEmpleadoDTO,
	ContratosDTO,
	RiesgosDTO,
	RegimenesDTO,
	JornadasDTO,
	EstadoDTO,
	UsuarioGastosDTO,
} from "../types/catalogos";
import type { RespuestaDTO } from "../types/utilidades";

/**
 * Servicio de gestión de Datos de Empleado
 * Migrado de DatosEmpleadoService de Angular
 */
class DatosEmpleadoService {
	private readonly apiUrl = `${import.meta.env.VITE_API_BACK_BASE_URL}EmpleadoGastos`;
	private readonly apiUrlArbol = `${import.meta.env.VITE_API_BACK_BASE_URL}ArbolAutorizacion`;

	//#region Empleados

	/**
	 * Obtiene todos los empleados operativos de una empresa
	 */
	async obtenerEmpleadosGastos(idEmpresa: number): Promise<UsuarioGastosDTO[]> {
		const response = await apiBACK.get<UsuarioGastosDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerEmpleadoOperativo`
		);
		return response.data;
	}

	/**
	 * Obtiene empleado por ID de usuario
	 */
	async obtenerEmpleadosGastosxidUsuario(idUsuario: number, idEmpresa: number): Promise<DatosEmpleadoDTO> {
		const response = await apiBACK.get<DatosEmpleadoDTO>(
			`${this.apiUrl}/${idEmpresa}/ObtenerEmpleadoOperativoxidUsuario/${idUsuario}`
		);
		return response.data;
	}

	/**
	 * Obtiene empleado por ID de plaza empleado
	 */
	async obtenerUsuarioGastosxPlazaE(idPlazaE: number, idEmpresa: number): Promise<UsuarioGastosDTO> {
		const response = await apiBACK.get<UsuarioGastosDTO>(
			`${this.apiUrl}/${idEmpresa}/ObtenerEmpleadoXPlazaempleado/${idPlazaE}`
		);
		return response.data;
	}

	/**
	 * Obtiene empleado por ID
	 */
	async obtenerXId(id: number, idEmpresa: number): Promise<DatosEmpleadoDTO> {
		const response = await apiBACK.get<DatosEmpleadoDTO>(
			`${this.apiUrl}/${idEmpresa}/Obtenerxid/${id}`
		);
		return response.data;
	}

	/**
	 * Crea un nuevo empleado
	 */
	async crearEmpleado(registro: DatosEmpleadoDTO, idEmpresa: number): Promise<DatosEmpleadoDTO> {
		const response = await apiBACK.post<DatosEmpleadoDTO>(
			`${this.apiUrl}/${idEmpresa}/CrearEmpleado`,
			registro
		);
		return response.data;
	}

	/**
	 * Edita un empleado existente
	 */
	async editarEmpleado(registro: DatosEmpleadoDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/EditarEmpleado`,
			registro
		);
		return response.data;
	}

	//#endregion

	//#region Plazas Empleado

	/**
	 * Obtiene plazas de un empleado por ID de empleado
	 */
	async obtenerPaginadoPlazaEmpleadoxidEmpleado(
		idEmpleado: number,
		idEmpresa: number
	): Promise<PlazaEmpleadoDTO[]> {
		const response = await apiBACK.get<PlazaEmpleadoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerPlazaEmpleados/${idEmpleado}`
		);
		return response.data;
	}

	/**
	 * Obtiene plazas de un empleado por división
	 */
	async obtenerPaginadoPlazaEmpleadoxDivision(
		idDivision: number,
		idEmpresa: number,
		idPlazaE: number
	): Promise<PlazaEmpleadoDTO[]> {
		const response = await apiBACK.get<PlazaEmpleadoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerPlazaEmpleadosxDivision/${idDivision}/${idPlazaE}`
		);
		return response.data;
	}

	/**
	 * Obtiene todas las plazas empleado
	 */
	async obtenerplazaempleado(idEmpresa: number): Promise<PlazaEmpleadoDTO[]> {
		const response = await apiBACK.get<PlazaEmpleadoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerPlazaEmpleado`
		);
		return response.data;
	}

	/**
	 * Crea una relación plaza-empleado
	 */
	async crearPlazaEmpleado(registro: PlazaEmpleadoDTO, idEmpresa: number): Promise<PlazaEmpleadoDTO> {
		const response = await apiBACK.post<PlazaEmpleadoDTO>(
			`${this.apiUrl}/${idEmpresa}/CrearRelacionPlazaEmpleado`,
			registro
		);
		return response.data;
	}

	/**
	 * Edita una relación plaza-empleado
	 */
	async EditarPlazaEmpleado(registro: PlazaEmpleadoDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/EditarPlazaEmpleados`,
			registro
		);
		return response.data;
	}

	/**
	 * Edita límites de una plaza empleado
	 */
	async editarLimites(registro: PlazaEmpleadoDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/EditarLimites`,
			registro
		);
		return response.data;
	}

	//#endregion

	//#region Plaza Cuenta

	/**
	 * Obtiene cuentas contables de una plaza empleado
	 */
	async obtenerPaginadoPlazaCuenta(
		idPlazaEmpleado: number,
		idEmpresa: number
	): Promise<PlazaCuentaDTO[]> {
		const response = await apiBACK.get<PlazaCuentaDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerPlazaCuenta/${idPlazaEmpleado}`
		);
		return response.data;
	}

	/**
	 * Crea una relación plaza-cuenta
	 */
	async crearPlazaCuenta(registro: PlazaCuentaDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/CrearRelacionPlazaCuenta`,
			registro
		);
		return response.data;
	}

	/**
	 * Edita una relación plaza-cuenta
	 */
	async EditarPlazaCuenta(registro: PlazaCuentaDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/EditarPlazaCuenta`,
			registro
		);
		return response.data;
	}

	/**
	 * Asigna cuenta por defecto
	 */
	async AsignarCuentaDefault(registro: PlazaCuentaDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/AsignarCuentaDefault`,
			registro
		);
		return response.data;
	}

	//#endregion

	//#region Plaza Centro

	/**
	 * Obtiene centros de costo de una plaza empleado
	 */
	async obtenerPaginadoPlazaCentro(
		idPlazaEmpleado: number,
		idEmpresa: number
	): Promise<PlazaCentroDTO[]> {
		const response = await apiBACK.get<PlazaCentroDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerPlazaCentro/${idPlazaEmpleado}`
		);
		return response.data;
	}

	/**
	 * Crea una relación plaza-centro
	 */
	async crearPlazaCentro(registro: PlazaCentroDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/CrearRelacionPlazaCentro`,
			registro
		);
		return response.data;
	}

	/**
	 * Edita una relación plaza-centro
	 */
	async EditarPlazaCentro(registro: PlazaCentroDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/EditarPlazaCentro`,
			registro
		);
		return response.data;
	}

	//#endregion

	//#region Árbol de Autorización

	/**
	 * Crea un árbol de autorización
	 */
	async crearArbol(registro: ArbolDTO, idEmpresa: number): Promise<ArbolDTO> {
		const response = await apiBACK.post<ArbolDTO>(
			`${this.apiUrlArbol}/${idEmpresa}/CrearArbol`,
			registro
		);
		return response.data;
	}

	/**
	 * Obtiene árbol por plaza
	 */
	async obtenerArbolxPlaza(idPlaza: number, idEmpresa: number): Promise<ArbolDTO> {
		const response = await apiBACK.get<ArbolDTO>(
			`${this.apiUrlArbol}/${idEmpresa}/ObtenerArbol/${idPlaza}`
		);
		return response.data;
	}

	/**
	 * Obtiene árbol de anticipo
	 */
	async obtenerArbolAnticipo(idPlaza: number, idEmpresa: number): Promise<ArbolDTO> {
		const response = await apiBACK.get<ArbolDTO>(
			`${this.apiUrlArbol}/${idEmpresa}/ObtenerArbolAnticipo/${idPlaza}`
		);
		return response.data;
	}

	/**
	 * Obtiene árbol de ejercido
	 */
	async obtenerArbolEjercido(idPlaza: number, idEmpresa: number): Promise<ArbolDTO> {
		const response = await apiBACK.get<ArbolDTO>(
			`${this.apiUrlArbol}/${idEmpresa}/ObtenerArbolEjercido/${idPlaza}`
		);
		return response.data;
	}

	/**
	 * Obtiene todos los autorizadores
	 */
	async obtenerPaginadoAutorizadores(idEmpresa: number): Promise<AutorizadoresDTO[]> {
		const response = await apiBACK.get<AutorizadoresDTO[]>(
			`${this.apiUrlArbol}/${idEmpresa}/ObtenerAutorizadores`
		);
		return response.data;
	}

	/**
	 * Obtiene autorizadores de un árbol
	 */
	async obtenerArbol_Autorizadores(idArbol: number, idEmpresa: number): Promise<ArbolAutorizadoresDTO[]> {
		const response = await apiBACK.get<ArbolAutorizadoresDTO[]>(
			`${this.apiUrlArbol}/${idEmpresa}/ObtenerArbol_autorizadores/${idArbol}`
		);
		return response.data;
	}

	/**
	 * Obtiene autorizadores disponibles para un árbol
	 * Retorna los autorizadores que pueden ser asignados al árbol específico
	 */
	async obtenerAutorizadoresDisponibles(
		idArbol: number,
		idEmpresa: number,
		idplaza: number
	): Promise<AutorizadoresDTO[]> {
		const response = await apiBACK.get<AutorizadoresDTO[]>(
			`${this.apiUrlArbol}/${idEmpresa}/ObtenerAutorizadores/${idArbol}/${idplaza}`
		);
		return response.data;
	}

	/**
	 * Obtiene autorizadores relacionados por nivel
	 * El backend retorna AutorizadoresDTO[][] directamente (no ArbolAutorizadoresDTO[][])
	 */
	async obtenerAutorizadoresRelacionados(
		idArbol: number,
		idEmpresa: number
	): Promise<AutorizadoresDTO[][]> {
		const response = await apiBACK.get<AutorizadoresDTO[][]>(
			`${this.apiUrlArbol}/${idEmpresa}/ObtenerAutorizadoresRelacionados/${idArbol}`
		);
		return response.data;
	}

	/**
	 * Crea relación árbol-autorizador
	 */
	async CrearRelación_ArbolxAutorizador(
		registro: AutorizadoresDTO[][],
		idArbol: number,
		idEmpresa: number
	): Promise<RespuestaDTO> {
		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrlArbol}/${idEmpresa}/CrearRelacion_ArbolxAutorizador/${idArbol}`,
			registro
		);
		return response.data;
	}

	/**
	 * Elimina todas las relaciones árbol-autorizador
	 */
	async EliminarArbolxAutorizador(idArbol: number, idEmpresa: number): Promise<void> {
		await apiBACK.get(`${this.apiUrlArbol}/${idEmpresa}/BorrarArbolxAutorizador/${idArbol}`);
	}

	//#endregion

	//#region Catálogos

	/**
	 * Obtiene contratos
	 */
	async obtenerContrato(idEmpresa: number): Promise<ContratosDTO[]> {
		const response = await apiBACK.get<ContratosDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerClaveContrato`
		);
		return response.data;
	}

	/**
	 * Obtiene riesgos
	 */
	async obtenerRiesgo(idEmpresa: number): Promise<RiesgosDTO[]> {
		const response = await apiBACK.get<RiesgosDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerClaveRiesgo`
		);
		return response.data;
	}

	/**
	 * Obtiene regímenes
	 */
	async obtenerRegimen(idEmpresa: number): Promise<RegimenesDTO[]> {
		const response = await apiBACK.get<RegimenesDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerClaveRegimen`
		);
		return response.data;
	}

	/**
	 * Obtiene jornadas
	 */
	async obtenerJornada(idEmpresa: number): Promise<JornadasDTO[]> {
		const response = await apiBACK.get<JornadasDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerClaveJornada`
		);
		return response.data;
	}

	/**
	 * Obtiene estados
	 */
	async obtenerEstado(idEmpresa: number): Promise<EstadoDTO[]> {
		const response = await apiBACK.get<EstadoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerClaveEstado`
		);
		return response.data;
	}

	//#endregion

	//#region Roles

	/**
	 * Crea un rol plaza empleado
	 */
	async crearRolPlazaEmpleado(registro: RolPlazaEmpleadoDTO, idEmpresa: number): Promise<RespuestaDTO> {
		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/CrearRolPlazaEmpleado`,
			registro
		);
		return response.data;
	}

	//#endregion
}

export const datosEmpleadoService = new DatosEmpleadoService();

