import { type JSX, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parametrosService } from "../services/parametrosService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import { useTituloStore } from "../services/tituloService";
import type { ParametrosEmpresaGastosDTO } from "../types/gastos";
import Loader from "../components/Loader";
import ActionButton from "../components/ActionButton";
import ModalConfirmacion from "../components/ModalConfirmacion";
import { faSave } from "@fortawesome/free-solid-svg-icons";

/**
 * Configuración de permisos que se pueden configurar
 * Basado en los parámetros que regresa el endpoint
 */
const PERMISOS_CONFIG = [
	{
		clave: "NUMERO POLIZA INGRESO",
		label: "Número Póliza Ingreso",
		descripcion: "Número de póliza para ingresos",
		tipo: "input" as const,
	},
	{
		clave: "NUMERO POLIZA EGRESO",
		label: "Número Póliza Egreso",
		descripcion: "Número de póliza para egresos",
		tipo: "input" as const,
	},
	{
		clave: "NUMERO POLIZA DIARIO",
		label: "Número Póliza Diario",
		descripcion: "Número de póliza para diario",
		tipo: "input" as const,
	},
	{
		clave: "DiasDeEsperaParaNotificar",
		label: "Días de espera para notificar",
		descripcion: "Número de días de espera antes de notificar",
		tipo: "input" as const,
	},
	{
		clave: "NotificarAutorizacion",
		label: "Notificar autorización",
		descripcion: "Activa las notificaciones cuando se requiere autorización",
		tipo: "switch" as const,
	},
	{
		clave: "ValidacionPDFyXML",
		label: "Validación PDF y XML",
		descripcion: "Activa la validación de archivos PDF y XML",
		tipo: "switch" as const,
	},
	{
		clave: "TamañoArchivo",
		label: "Tamaño máximo de archivo (MB)",
		descripcion: "Establece el tamaño máximo permitido para archivos en megabytes",
		tipo: "input" as const,
	},
	{
		clave: "OrdenMantenimiento",
		label: "Orden de mantenimiento",
		descripcion: "Configura el orden de mantenimiento",
		tipo: "switch" as const,
	},
	{
		clave: "CentroCostos",
		label: "Centro de Costos",
		descripcion: "Configuración de centro de costos",
		tipo: "switch" as const,
	},
] as const;

/**
 * La página principal para configurar los parámetros del sistema.
 *
 * @page
 * @returns {JSX.Element} Un fragmento que contiene el diseño completo de la página de parámetros.
 */
export default function ConfigParametros(): JSX.Element {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);
	const { actualizarTitulo } = useTituloStore();

	const idEmpresa = obtenerIdEmpresa();

	const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
	const [parametrosEstado, setParametrosEstado] = useState<Record<string, ParametrosEmpresaGastosDTO>>({});
	const [parametrosOriginales, setParametrosOriginales] = useState<Record<string, ParametrosEmpresaGastosDTO>>({});
	const [ultimoIdEmpresa, setUltimoIdEmpresa] = useState<number | null>(null);

	useEffect(() => {
		actualizarTitulo("Parámetros de Gastos");
	}, [actualizarTitulo]);

	const queryKey = ["parametros", idEmpresa] as const;

	// Consulta para obtener todos los parámetros
	const {
		data: parametros = [],
		isLoading,
		isError,
		error,
	} = useQuery<ParametrosEmpresaGastosDTO[]>({
		queryKey,
		queryFn: async () => {
			if (!idEmpresa) {
				throw new Error("No hay empresa seleccionada");
			}
			return await parametrosService.obtenerTodos(idEmpresa);
		},
		enabled: Boolean(idEmpresa),
		retry: false,
	});

	// Calcular si los parámetros están inicializados
	const parametrosInicializados = ultimoIdEmpresa === idEmpresa && Object.keys(parametrosEstado).length > 0;

	// Inicializar parámetros cuando se cargan los datos
	useEffect(() => {
		if (!idEmpresa) {
			return;
		}

		// Si cambió la empresa, resetear estado usando setTimeout para evitar setState síncrono
		if (ultimoIdEmpresa !== null && ultimoIdEmpresa !== idEmpresa) {
			setTimeout(() => {
				setParametrosEstado({});
				setParametrosOriginales({});
			}, 0);
			return;
		}

		if (isLoading) {
			return;
		}

		// Solo inicializar si aún no se ha hecho para esta empresa
		if (parametrosInicializados) {
			return;
		}

		const estadoInicial: Record<string, ParametrosEmpresaGastosDTO> = {};
		const originales: Record<string, ParametrosEmpresaGastosDTO> = {};

		PERMISOS_CONFIG.forEach((config) => {
			const parametroExistente = parametros.find((p) => p.permiso === config.clave);

			if (parametroExistente) {
				estadoInicial[config.clave] = { ...parametroExistente };
				originales[config.clave] = { ...parametroExistente };
			} else {
				// Si no existe, crear un objeto por defecto
				const nuevoParametro: ParametrosEmpresaGastosDTO = {
					id: 0,
					permiso: config.clave,
					valor: config.tipo === "switch" ? "0" : "",
					estatus: config.tipo === "switch" ? false : true,
					editablexUsuario: false,
				};
				estadoInicial[config.clave] = nuevoParametro;
				originales[config.clave] = { ...nuevoParametro };
			}
		});

		// Usar setTimeout para evitar setState síncrono en el efecto
		setTimeout(() => {
			setUltimoIdEmpresa(idEmpresa);
			setParametrosEstado(estadoInicial);
			setParametrosOriginales(originales);
		}, 0);
	}, [parametros, idEmpresa, isLoading, ultimoIdEmpresa, parametrosInicializados]);

	// Mutación para editar parámetros
	const editarParametrosMutation = useMutation({
		mutationFn: async (parametrosAEditar: ParametrosEmpresaGastosDTO[]) => {
			if (!idEmpresa) {
				throw new Error("No hay empresa seleccionada");
			}
			const resultados = await Promise.all(
				parametrosAEditar.map(async (param) => {
					if (param.id === 0) {
						return await parametrosService.guardar(param, idEmpresa);
					} else {
						return await parametrosService.editar(param, idEmpresa);
					}
				})
			);
			return resultados;
		},
		onSuccess: () => {
			// Cerrar el modal inmediatamente sin animación para evitar destello
			setMostrarConfirmacion(false);
			
			// Actualizar los parámetros originales con los valores actuales
			// Esto refleja los cambios en la UI sin necesidad de refrescar
			setParametrosOriginales({ ...parametrosEstado });
			
			mostrarNotificacion("Parámetros editados correctamente", "success");
			
			// Invalidar queries para asegurar que los datos estén actualizados
			queryClient.invalidateQueries({ queryKey });
		},
		onError: (error) => {
			console.error("Error al editar parámetros:", error);
			mostrarNotificacion("Error al editar los parámetros. Intente de nuevo.", "error");
		},
	});

	// Detectar cambios comparando estado actual con originales
	const hayCambios = useMemo(() => {
		if (!parametrosInicializados) return false;

		return PERMISOS_CONFIG.some((config) => {
			const actual = parametrosEstado[config.clave];
			const original = parametrosOriginales[config.clave];

			if (!actual || !original) return false;

			if (config.tipo === "switch") {
				return actual.estatus !== original.estatus;
			} else {
				return actual.valor !== original.valor;
			}
		});
	}, [parametrosEstado, parametrosOriginales, parametrosInicializados]);

	// Manejar cambios en switches
	const handleSwitchChange = (clave: string, checked: boolean) => {
		setParametrosEstado((prev) => {
			const param = prev[clave];
			if (!param) return prev;
			return {
				...prev,
				[clave]: {
					...param,
					estatus: checked,
					valor: checked ? "1" : "0",
				},
			};
		});
	};

	// Manejar cambios en inputs
	const handleInputChange = (clave: string, value: string) => {
		setParametrosEstado((prev) => {
			const param = prev[clave];
			if (!param) return prev;
			return {
				...prev,
				[clave]: {
					...param,
					valor: value,
				},
			};
		});
	};

	// Preparar parámetros modificados para guardar
	const obtenerParametrosModificados = (): ParametrosEmpresaGastosDTO[] => {
		const modificados: ParametrosEmpresaGastosDTO[] = [];

		PERMISOS_CONFIG.forEach((config) => {
			const actual = parametrosEstado[config.clave];
			const original = parametrosOriginales[config.clave];

			if (!actual || !original) return;

			let haCambiado = false;
			if (config.tipo === "switch") {
				haCambiado = actual.estatus !== original.estatus;
			} else {
				haCambiado = actual.valor !== original.valor;
			}

			if (haCambiado) {
				modificados.push(actual);
			}
		});

		return modificados;
	};

	// Manejar confirmación de guardado
	const handleConfirmarGuardar = () => {
		const parametrosModificados = obtenerParametrosModificados();
		if (parametrosModificados.length > 0) {
			// Cerrar el modal inmediatamente antes de guardar para evitar destello
			setMostrarConfirmacion(false);
			editarParametrosMutation.mutate(parametrosModificados);
		} else {
			// Si no hay cambios, simplemente cerrar el modal
			setMostrarConfirmacion(false);
		}
	};

	if (!idEmpresa) {
		return (
			<div className="p-6">
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<p className="text-yellow-800">
						No hay empresa seleccionada. Por favor, seleccione una empresa para configurar los parámetros.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-3 sm:p-4 lg:p-6">
			<div className="mb-4 sm:mb-6 flex justify-between items-center">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-900">Parámetros de Gastos</h1>
				<ActionButton
					type="button"
					text="Guardar cambios"
					icon={faSave}
					variant="save"
					disabled={!hayCambios || editarParametrosMutation.isPending}
					isLoading={editarParametrosMutation.isPending}
					onClick={() => setMostrarConfirmacion(true)}
				/>
			</div>

			{/* Mostrar estado de carga de parámetros */}
			{isLoading && (
				<div className="flex justify-center items-center p-8">
					<Loader text="Cargando parámetros..." />
				</div>
			)}

			{/* Mostrar error al cargar parámetros */}
			{isError && (
				<div className="p-6 bg-white rounded-lg shadow-md">
					<div className="p-4 text-center text-red-500">
						Error al cargar los parámetros:{" "}
						{error instanceof Error ? error.message : "Error desconocido"}
					</div>
					{error instanceof Error && error.message.includes("404") && (
						<div className="p-4 text-center text-gray-600">
							<p className="mb-2">Es posible que la empresa aún no tenga parámetros configurados.</p>
							<p>Puede continuar y se crearán cuando guarde los cambios.</p>
						</div>
					)}
				</div>
			)}

			{/* Mostrar formulario de parámetros */}
			{!isLoading &&
				!isError &&
				parametrosInicializados && (
					<div className="gap-6 grid grid-cols-1 md:grid-cols-2 p-6 bg-white rounded-lg shadow-md">
						{PERMISOS_CONFIG.map((config) => {
							const parametro = parametrosEstado[config.clave];
							if (!parametro) return null;

							return (
								<div key={config.clave} className="p-4 border-2 border-gray-200 rounded-lg">
									<div className="mb-3">
										<h3 className="text-lg font-semibold text-gray-900">{config.label}</h3>
										<p className="text-sm text-gray-600">{config.descripcion}</p>
									</div>
									<div className="mt-4">
										{config.tipo === "switch" ? (
											<div className="flex items-center">
												<input
													type="checkbox"
													id={config.clave}
													checked={parametro.estatus}
													onChange={(e) => handleSwitchChange(config.clave, e.target.checked)}
													className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
												/>
												<label htmlFor={config.clave} className="ml-2 block text-sm text-gray-700">
													{parametro.estatus ? "Activo" : "Inactivo"}
												</label>
											</div>
										) : (
											<div>
												<label htmlFor={`input-${config.clave}`} className="block text-sm font-medium text-gray-700 mb-1">
													{config.label}
												</label>
												<input
													id={`input-${config.clave}`}
													type="number"
													inputMode="numeric"
													value={parametro.valor}
													onChange={(e) => handleInputChange(config.clave, e.target.value)}
													className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
												/>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}

			<ModalConfirmacion
				abierto={mostrarConfirmacion}
				titulo="Confirmar guardado"
				mensaje="¿Está seguro de que desea guardar los cambios realizados en los parámetros?"
				textoConfirmar="Guardar"
				textoCancelar="Cancelar"
				colorConfirmar="blue"
				onConfirmar={handleConfirmarGuardar}
				onCancelar={() => setMostrarConfirmacion(false)}
			/>
		</div>
	);
}
