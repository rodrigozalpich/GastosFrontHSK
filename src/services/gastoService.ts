import { apiBACK } from "./axiosInstance";
import type {
	GastoDTO,
	ArchivoComprobacionDTO,
	ConceptoGastosDTO,
	ConceptoImpuestosGastosDTO,
	GastoAutorizadoDTO,
	GastoRechazadoDTO,
	MovimientosCuentaContableDTO,
	MovimientosGastosDTO,
	AutorizadorDTO,
	CuentaContableGastosDTO,
} from "../types/gastos";
// Tipos que se usarán en fases posteriores:
// MovimientosGastosDTO, PolizaGastosDTO, PolizaDetalleGastosDTO,
// ArchivoFechaDTO, NoDeducibleDTO, DevolucionesDTO,
// ParametrosEmpresaGastosDTO, GastoCompartidoDTO
import type {
	RespuestaDTO,
	RespuestaJustificanteDTO,
	RespuestaMultipleDTO,
} from "../types/utilidades";
import type { UsuarioGastoDTO } from "../types/seguridad";

/**
 * Servicio de gestión de gastos
 *
 * Servicio principal para todas las operaciones relacionadas con gastos.
 * Migrado de GastoService de Angular, adaptado para usar Axios y Promises.
 *
 * @class GastoService
 * @example
 * ```typescript
 * const gastos = await gastoService.obtenerGastos(idEmpleado, idEmpresa);
 * ```
 */
class GastoService {
	private readonly apiUrl = `${import.meta.env.VITE_API_BACK_BASE_URL}Gasto`;
	// URLs que se usarán en fases posteriores:
	// private readonly apiUrlExcel = `${import.meta.env.VITE_API_BACK_BASE_URL}GenerarExcel`;
	// private readonly apiUrlNotifi = `${import.meta.env.VITE_API_BACK_BASE_URL}Notificador`;
	private readonly apiUrlUsuario = `${
		import.meta.env.VITE_API_SSO_BASE_URL
	}usuarioGastos`;
	// private readonly apiUrlPE = `${import.meta.env.VITE_API_BACK_BASE_URL}EmpleadoGastos`;
	private readonly apiUrlArchivo = `${
		import.meta.env.VITE_API_BACK_BASE_URL
	}archivoComprobacion`;
	// private readonly apiPolizaGastos = `${import.meta.env.VITE_API_BACK_BASE_URL}PolizasGastos`;
	// private readonly apiParametros = `${import.meta.env.VITE_API_BACK_BASE_URL}ParametrosEmpresaGastos`;

	//#region Gastos

	/**
	 * Obtiene todos los gastos de un empleado
	 *
	 * @param idEmpleado - ID del empleado
	 * @param idEmpresa - ID de la empresa
	 * @returns Promise con array de gastos del empleado
	 * @throws Error si la petición falla
	 */
	async obtenerGastos(
		idEmpleado: number,
		idEmpresa: number
	): Promise<GastoDTO[]> {
		const response = await apiBACK.get<GastoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerTodosGastos/${idEmpleado}`
		);
		return response.data;
	}

	/**
	 * Obtiene todos los gastos de un empleado específico
	 */
	async obtenerTodosGastosEmpleadoEspecifico(
		idEmpleado: number,
		idEmpresa: number
	): Promise<GastoDTO[]> {
		const response = await apiBACK.get<GastoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerTodoslosGastosPorEmpleadoEspecifico/${idEmpleado}`
		);
		return response.data;
	}

	/**
	 * Obtiene gastos por ID de empleado
	 */
	async obtenerXIdEmpleado(
		idEmpleado: number,
		idEmpresa: number
	): Promise<GastoDTO[]> {
		const response = await apiBACK.get<GastoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerGastosxPlaza/${idEmpleado}`
		);
		return response.data;
	}

	/**
	 * Crea un nuevo gasto
	 *
	 * @param registro - Datos del gasto a crear
	 * @param idEmpresa - ID de la empresa
	 * @returns Promise con respuesta del servidor
	 * @throws Error si la petición falla o los datos son inválidos
	 */
	async crearGasto(
		registro: GastoDTO,
		idEmpresa: number
	): Promise<RespuestaDTO> {
		// Preparar el objeto para el backend según el ejemplo de Swagger
		// El objeto se envía directamente (sin envolver) como muestra Swagger
		// Campos boolean no nullable deben ser boolean, no null
		const gastoParaEnviar: GastoDTO = {
			...registro,
			// Campos boolean no nullable (según modelo C#: public bool ... { get; set; })
			validacionAutorizacion: registro.validacionAutorizacion ?? false,
			esDevolucion: registro.esDevolucion ?? false,
			nivelMaximo: registro.nivelMaximo ?? false,
			// Asegurar campos que pueden faltar
			timbrado: registro.timbrado ?? false,
		};

		// Enviar el objeto directamente según el ejemplo de Swagger (sin envolver)
		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/CrearGasto`,
			gastoParaEnviar
		);
		return response.data;
	}

	/**
	 * Obtiene un gasto por su ID
	 */
	async obtenerGastoXId(id: number, idEmpresa: number): Promise<GastoDTO> {
		const response = await apiBACK.get<GastoDTO>(
			`${this.apiUrl}/${idEmpresa}/ObtenerGastoxid/${id}`
		);
		return response.data;
	}

	/**
	 * Edita un gasto existente
	 */
	async editarGasto(
		registro: GastoDTO,
		idEmpresa: number
	): Promise<RespuestaDTO> {
		const response = await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/EditarGasto`,
			registro
		);
		return response.data;
	}

	/**
	 * Borra un gasto (soft delete)
	 */
	async borrarGasto(registro: GastoDTO, idEmpresa: number): Promise<void> {
		await apiBACK.put<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/BorrarGasto`,
			registro
		);
	}

	//#endregion

	//#region Archivos de Comprobación

	/**
	 * Carga un justificante (archivo)
	 */
	async cargarJustificante(
		file: File,
		idEmpresa: number
	): Promise<RespuestaJustificanteDTO> {
		const formData = new FormData();
		formData.append("file", file);

		const response = await apiBACK.post<RespuestaJustificanteDTO>(
			`${this.apiUrl}/${idEmpresa}/CargarJustificante`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return response.data;
	}

	/**
	 * Carga múltiples archivos no deducibles
	 */
	async cargaNoDeduciblesJus(
		files: File[],
		idEmpresa: number
	): Promise<RespuestaDTO> {
		const formData = new FormData();
		for (let i = 0; i < files.length; i++) {
			formData.append("files", files[i]);
		}

		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrl}/${idEmpresa}/CargarJustificante`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return response.data;
	}

	/**
	 * Obtiene archivos de comprobación de un gasto
	 */
	async obtenerArchivoComprobacion(
		idGasto: number,
		idPlazaEmpleado: number,
		idEmpresa: number
	): Promise<ArchivoComprobacionDTO[]> {
		const response = await apiBACK.get<ArchivoComprobacionDTO[]>(
			`${this.apiUrlArchivo}/${idEmpresa}/ObtenerTodosArchivosxidGasto/${idGasto}/${idPlazaEmpleado}`
		);
		return response.data;
	}

	/**
	 * Carga una factura (archivo)
	 */
	async cargaFactura(
		files: File[],
		idEmpresa: number,
		idGasto: number,
		idCentroCostos: number,
		idplazasEmpleadosCompartir: number[]
	): Promise<RespuestaMultipleDTO> {
		const formData = new FormData();
		for (let i = 0; i < files.length; i++) {
			formData.append("files", files[i]);
		}
		for (let i = 0; i < idplazasEmpleadosCompartir.length; i++) {
			formData.append("listaPlazas", idplazasEmpleadosCompartir[i].toString());
		}

		const response = await apiBACK.post<RespuestaMultipleDTO>(
			`${this.apiUrlArchivo}/${idEmpresa}/Validar/${idGasto}/${idCentroCostos}`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return response.data;
	}

	/**
	 * Borra un archivo de comprobación
	 */
	async borrarArchivo(
		registro: ArchivoComprobacionDTO,
		idEmpresa: number
	): Promise<RespuestaDTO> {
		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrlArchivo}/${idEmpresa}/borrarArchivoComprobacion`,
			registro
		);
		return response.data;
	}

	/**
	 * Descarga el PDF de detalles de un gasto
	 */
	async descargarPDFDetalle(idGasto: number, idEmpresa: number): Promise<Blob> {
		const response = await apiBACK.get<Blob>(
			`${this.apiUrl}/${idEmpresa}/DescargaPDFDetalle/${idGasto}`,
			{
				responseType: "blob",
			}
		);
		return response.data;
	}

	/**
	 * Descarga el justificante de un gasto
	 */
	async descargarJustificante(
		idGasto: number,
		idEmpresa: number
	): Promise<{ blob: Blob; filename: string }> {
		const response = await apiBACK.get<Blob>(
			`${this.apiUrl}/${idEmpresa}/obtenJustificante/${idGasto}`,
			{
				responseType: "blob",
			}
		);

		const contentType =
			response.headers["content-type"] || "application/octet-stream";
		const contentDisposition = response.headers["content-disposition"];

		// Detectar extensión por Content-Type
		let extension = "";
		switch (contentType) {
			case "application/pdf":
				extension = ".pdf";
				break;
			case "image/jpeg":
				extension = ".jpg";
				break;
			case "image/png":
				extension = ".png";
				break;
			case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				extension = ".docx";
				break;
			case "application/msword":
				extension = ".doc";
				break;
			case "text/plain":
				extension = ".txt";
				break;
			default:
				extension = "";
		}

		// Si la API manda Content-Disposition con filename
		let filename = "";
		if (contentDisposition && contentDisposition.includes("filename=")) {
			filename = contentDisposition
				.split("filename=")[1]
				.split(";")[0]
				.replace(/['"]/g, "");
		} else {
			// Si no lo manda, usamos un nombre por defecto
			filename = `Justificante gasto ${idGasto}${extension}`;
		}

		return { blob: response.data, filename };
	}

	/**
	 * Descarga un lote de archivos de comprobación
	 */
	async descargarLoteArchivos(
		idGasto: number,
		idEmpresa: number
	): Promise<Blob> {
		const response = await apiBACK.get<Blob>(
			`${this.apiUrl}/${idEmpresa}/obtenLoteArchivos/${idGasto}`,
			{
				responseType: "blob",
			}
		);
		return response.data;
	}

	/**
	 * Descarga un lote de archivos de pago
	 */
	async descargarLotePagos(idGasto: number, idEmpresa: number): Promise<Blob> {
		const response = await apiBACK.get<Blob>(
			`${this.apiUrl}/${idEmpresa}/obtenLoteArchivosPagos/${idGasto}`,
			{
				responseType: "blob",
			}
		);
		return response.data;
	}

	/**
	 * Obtiene cuentas contables no deducibles para una plaza empleado
	 */
	async obtenerCuentaContableNoDeducible(
		idPlazaEmpleado: number,
		idEmpresa: number
	): Promise<CuentaContableGastosDTO[]> {
		const response = await apiBACK.get<CuentaContableGastosDTO[]>(
			`${this.apiUrlArchivo}/${idEmpresa}/obtenerCuentaContableNoDecucibe/${idPlazaEmpleado}`
		);
		return response.data;
	}

	/**
	 * Registra un comprobante sin factura (no deducible)
	 */
	async registrarNoDeducible(
		datos: {
			esExtranjero: boolean;
			concepto: string;
			total: number;
			observaciones: string;
			idCuentaContable: number;
			idGasto: number;
			idCentroCosto: number;
			archivo: File;
		},
		idEmpresa: number
	): Promise<RespuestaDTO> {
		const formData = new FormData();

		// El backend espera el archivo como "files"
		formData.append("files", datos.archivo);

		// Crear el objeto noDeducibleDTO según el tipo en gastos.ts
		const noDeducibleDTO = {
			nombre: datos.concepto,
			total: datos.total,
			observaciones: datos.observaciones,
			idCuentacontable: datos.idCuentaContable,
			NombrecuentaContable: "", // No lo tenemos, se puede dejar vacío
			idCentroCosto: datos.idCentroCosto,
			idGasto: datos.idGasto,
			esExtranjero: datos.esExtranjero,
		};

		// Serializar el DTO como JSON string en el campo "archivo"
		formData.append("archivo", JSON.stringify(noDeducibleDTO));

		const response = await apiBACK.post<RespuestaDTO>(
			`${this.apiUrlArchivo}/${idEmpresa}/RegistrarNoDeducibe`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return response.data;
	}

	/**
	 * Edita un archivo de comprobación
	 */
	async editarArchivoComprobacion(
		archivo: ArchivoComprobacionDTO,
		idEmpresa: number
	): Promise<ArchivoComprobacionDTO> {
		const response = await apiBACK.put<ArchivoComprobacionDTO>(
			`${this.apiUrlArchivo}/${idEmpresa}/EditarArchivoComprobacion`,
			archivo
		);
		return response.data;
	}

	//#endregion

	//#region Conceptos

	/**
	 * Obtiene conceptos por ID de archivo
	 */
	async obtenerConceptosxidArchivo(
		idArchivo: number,
		idEmpresa: number
	): Promise<ConceptoGastosDTO[]> {
		const response = await apiBACK.get<ConceptoGastosDTO[]>(
			`${this.apiUrlArchivo}/${idEmpresa}/ObtenerTodosConceptosxidArchivo/${idArchivo}`
		);
		return response.data;
	}

	/**
	 * Obtiene impuestos por ID de concepto
	 */
	async obtenerImpuestosxidConcepto(
		idConcepto: number,
		idEmpresa: number
	): Promise<ConceptoImpuestosGastosDTO[]> {
		const response = await apiBACK.get<ConceptoImpuestosGastosDTO[]>(
			`${this.apiUrlArchivo}/${idEmpresa}/ObtenerConceptoImpuestosxidConcepto/${idConcepto}`
		);
		return response.data;
	}

	//#endregion

	//#region Autorización

	/**
	 * Obtiene gastos rechazados por ID de gasto autorizado
	 */
	async obtenerGastoRechazadoxidGastoAutorizado(
		idgastoAutorizado: number,
		idEmpresa: number
	): Promise<GastoRechazadoDTO> {
		const response = await apiBACK.get<GastoRechazadoDTO>(
			`${this.apiUrl}/${idEmpresa}/ObtenerGastoRechazadoxidGastoAutorizado/${idgastoAutorizado}`
		);
		return response.data;
	}

	/**
	 * Valida si un gasto está rechazado
	 */
	async validarGastoRechazado(
		idGasto: number,
		idEmpresa: number
	): Promise<GastoRechazadoDTO> {
		const response = await apiBACK.get<GastoRechazadoDTO>(
			`${this.apiUrl}/${idEmpresa}/ValidarGastoRechazado/${idGasto}`
		);
		return response.data;
	}

	/**
	 * Crea un gasto rechazado
	 */
	async crearGastoRechazado(
		gastoRechazado: GastoRechazadoDTO,
		idEmpresa: number
	): Promise<GastoRechazadoDTO> {
		const response = await apiBACK.post<GastoRechazadoDTO>(
			`${this.apiUrl}/${idEmpresa}/CrearGastoRechazado`,
			gastoRechazado
		);
		return response.data;
	}

	/**
	 * Obtiene autorizadores
	 */
	async obtenerAutorizador(
		idEmpresa: number,
		idUsuario: number,
		plazaem: number
	): Promise<AutorizadorDTO[]> {
		const response = await apiBACK.get<AutorizadorDTO[]>(
			`${this.apiUrl}/${idEmpresa}/obtenerAutorizador/${idUsuario}/${plazaem}`
		);
		return response.data;
	}

	/**
	 * Obtiene autorizadores por ID de empleado
	 */
	async obtenerAutorizadorxidEmpleado(
		idEmpleado: number,
		idEmpresa: number
	): Promise<AutorizadorDTO[]> {
		const response = await apiBACK.get<AutorizadorDTO[]>(
			`${this.apiUrl}/${idEmpresa}/obtenerAutorizadorxidEmpleado/${idEmpleado}`
		);
		return response.data;
	}

	/**
	 * Obtiene gastos por autorizador
	 */
	async obtenerGastosxAutorizador(
		listaAutorizadores: number[],
		idEmpresa: number
	): Promise<GastoDTO[]> {
		const formData = new FormData();
		for (let i = 0; i < listaAutorizadores.length; i++) {
			const jsonData = JSON.stringify(listaAutorizadores[i]);
			formData.append("listaAutorizadores", jsonData);
		}

		const response = await apiBACK.post<GastoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerGastosxAutorizador`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return response.data;
	}

	/**
	 * Obtiene gasto autorizado por ID de gasto
	 */
	async obtenerGastoAutorizado(
		idGasto: number,
		idEmpresa: number
	): Promise<GastoAutorizadoDTO[]> {
		const response = await apiBACK.get<GastoAutorizadoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/obtenerGastoAutorizadoxidGasto/${idGasto}`
		);
		return response.data;
	}

	/**
	 * Autoriza un gasto
	 */
	async autorizarGasto(
		gastoAutorizado: GastoAutorizadoDTO,
		idEmpresa: number
	): Promise<GastoAutorizadoDTO> {
		const response = await apiBACK.post<GastoAutorizadoDTO>(
			`${this.apiUrl}/${idEmpresa}/CrearGastoAutorizado`,
			gastoAutorizado
		);
		return response.data;
	}

	/**
	 * Rechaza un gasto
	 */
	async rechazarGasto(
		gasto: GastoAutorizadoDTO,
		idEmpresa: number
	): Promise<GastoAutorizadoDTO> {
		const response = await apiBACK.post<GastoAutorizadoDTO>(
			`${this.apiUrl}/${idEmpresa}/CrearGastoAutorizado`,
			gasto
		);
		return response.data;
	}

	//#endregion

	//#region Pagos

	/**
	 * Obtiene gastos por pagar por ID de empleado
	 */
	async obtenerGastosxPagarxidEmpleado(
		idEmpleado: number,
		idEmpresa: number
	): Promise<GastoDTO[]> {
		const response = await apiBACK.get<GastoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerGastosxPagarxPermiso/${idEmpleado}`
		);
		return response.data;
	}

	/**
	 * Obtiene todos los gastos por pagar
	 */
	async obtenerTodosGastosxPagar(idEmpresa: number): Promise<GastoDTO[]> {
		const response = await apiBACK.get<GastoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerTodosGastosxPagar`
		);
		return response.data;
	}

	/**
	 * Obtiene todos los gastos autorizados de un empleado
	 */
	async obtenerTodosGastosAutorizados(
		idEmpleado: number,
		idEmpresa: number
	): Promise<GastoDTO[]> {
		const response = await apiBACK.get<GastoDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenerGastosAutorizadosXEmpleado/${idEmpleado}`
		);
		return response.data;
	}

	/**
	 * Paga un gasto
	 */
	async pagarElGasto(
		file: File | null,
		idEmpresa: number,
		archivo: MovimientosCuentaContableDTO
	): Promise<MovimientosCuentaContableDTO> {
		const formData = new FormData();
		if (file) {
			formData.append("files", file);
		}
		const jsonData = JSON.stringify(archivo);
		formData.append("archivo", jsonData);

		const response = await apiBACK.post<MovimientosCuentaContableDTO>(
			`${this.apiUrl}/${idEmpresa}/Pagar`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return response.data;
	}

	/**
	 * Obtiene movimientos por ID de gasto
	 */
	async obtenerMovimientosxidGasto(
		idGasto: number,
		idEmpresa: number
	): Promise<MovimientosGastosDTO[]> {
		const response = await apiBACK.get<MovimientosGastosDTO[]>(
			`${this.apiUrl}/${idEmpresa}/ObtenMovimientosxidGasto/${idGasto}`
		);
		return response.data;
	}

	/**
	 * Valida si un gasto tiene todos los asientos contables asignados
	 */
	async validarAsientoContable(
		idGasto: number,
		idEmpresa: number
	): Promise<boolean> {
		const response = await apiBACK.get<boolean>(
			`${this.apiUrl}/${idEmpresa}/validarAsientoContable/${idGasto}`
		);
		return response.data;
	}

	//#endregion

	//#region Usuarios

	/**
	 * Obtiene usuario de gastos por ID de usuario
	 */
	async obtenerUsuarioGastosxidUsuario(
		idUsuario: number
	): Promise<UsuarioGastoDTO> {
		const response = await apiBACK.get<UsuarioGastoDTO>(
			`${this.apiUrlUsuario}/ObtenerUsuarioGastosxidUsuario/${idUsuario}`
		);
		return response.data;
	}

	//#endregion
}

// Exportar instancia singleton
export const gastoService = new GastoService();

