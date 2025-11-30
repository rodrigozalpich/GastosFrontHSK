import { type JSX, useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSitemap,
	faUndo,
	faTrash,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { datosEmpleadoService } from "../services/datosEmpleadoService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import type {
	ArbolDTO,
	AutorizadoresDTO,
} from "../types/catalogos";
import CustomButton from "./CustomButton";
import ModalConfirmacion from "./ModalConfirmacion";
import Loader from "./Loader";
import ActionButton from "./ActionButton";

interface ConfiguracionArbolProps {
	idPlazaEmpleado: number;
	nombrePlaza: string;
	idEmpresa: number;
	tipoArbol: "ejercido" | "anticipo";
	onSuccess?: () => void;
}

interface Nivel {
	nivel: number;
	autorizadores: AutorizadoresDTO[];
}

/**
 * Componente para configurar el árbol de autorización
 * Maneja dos tipos: ejercido y anticipo
 */
export default function ConfiguracionArbol({
	idPlazaEmpleado,
	nombrePlaza,
	idEmpresa,
	tipoArbol,
	onSuccess,
}: ConfiguracionArbolProps): JSX.Element {
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore(
		(state) => state.mostrarNotificacion
	);
	const idEmpresaActual = obtenerIdEmpresa() || idEmpresa;

	const [arbol, setArbol] = useState<ArbolDTO | null>(null);
	const [autorizadoresDisponibles, setAutorizadoresDisponibles] = useState<
		AutorizadoresDTO[]
	>([]);
	const [niveles, setNiveles] = useState<Nivel[]>([]);
	const [nivelesOriginales, setNivelesOriginales] = useState<Nivel[]>([]);
	const [mostrarConfirmacionGuardar, setMostrarConfirmacionGuardar] =
		useState(false);
	const [nivelSeleccionado, setNivelSeleccionado] = useState<number | null>(
		null
	);
	const [mostrarSelectorAutorizadores, setMostrarSelectorAutorizadores] =
		useState(false);

	// Cargar árbol (obtener o crear)
	const {
		data: arbolData,
		isLoading: cargandoArbol,
		refetch: refetchArbol,
	} = useQuery<ArbolDTO>({
		queryKey: ["arbol", idPlazaEmpleado, idEmpresaActual, tipoArbol],
		queryFn: async () => {
			if (!idEmpresaActual) throw new Error("Falta el ID de empresa");
			// Intentar obtener el árbol según el tipo
			let arbolExistente: ArbolDTO;
			if (tipoArbol === "anticipo") {
				arbolExistente = await datosEmpleadoService.obtenerArbolAnticipo(
					idPlazaEmpleado,
					idEmpresaActual
				);
			} else {
				arbolExistente = await datosEmpleadoService.obtenerArbolEjercido(
					idPlazaEmpleado,
					idEmpresaActual
				);
			}

			// Si no existe, crear uno nuevo
			if (!arbolExistente || arbolExistente.id === 0) {
				const nuevoArbol: ArbolDTO = {
					id: 0,
					idPlazaEmpleado: idPlazaEmpleado,
					fechaAlta: new Date().toISOString(),
					esAnticipo: tipoArbol === "anticipo",
				};
				const arbolCreado = await datosEmpleadoService.crearArbol(
					nuevoArbol,
					idEmpresaActual
				);
				return arbolCreado;
			}

			return arbolExistente;
		},
		enabled: !!idEmpresaActual && !!idPlazaEmpleado,
	});

	// Cargar autorizadores disponibles para el árbol específico
	const { data: autorizadoresData = [], isLoading: cargandoAutorizadores } =
		useQuery<AutorizadoresDTO[]>({
			queryKey: [
				"autorizadoresDisponibles",
				arbolData?.id,
				idPlazaEmpleado,
				idEmpresaActual,
			],
			queryFn: async () => {
				if (!arbolData?.id || !idPlazaEmpleado || !idEmpresaActual) {
					throw new Error("Faltan datos necesarios (árbol, plaza o empresa)");
				}
				return await datosEmpleadoService.obtenerAutorizadoresDisponibles(
					arbolData.id,
					idEmpresaActual,
					idPlazaEmpleado
				);
			},
			enabled: !!arbolData?.id && !!idPlazaEmpleado && !!idEmpresaActual,
		});

	// Cargar niveles (autorizadores relacionados)
	// El backend retorna AutorizadoresDTO[][] directamente
	const {
		data: nivelesData,
		isLoading: cargandoNiveles,
		refetch: refetchNiveles,
	} = useQuery<AutorizadoresDTO[][]>({
		queryKey: ["arbolAutorizadores", arbolData?.id, idEmpresaActual],
		queryFn: async () => {
			if (!arbolData || !arbolData.id || !idEmpresaActual) return [];
			return await datosEmpleadoService.obtenerAutorizadoresRelacionados(
				arbolData.id,
				idEmpresaActual
			);
		},
		enabled: !!arbolData && !!arbolData.id && !!idEmpresaActual,
	});

	// Sincronizar estados cuando cambian los datos
	useEffect(() => {
		if (arbolData) {
			setTimeout(() => {
				setArbol(arbolData);
			}, 0);
		}
	}, [arbolData]);

	useEffect(() => {
		if (autorizadoresData) {
			// Filtrar autorizadores con ID válido y log para depuración
			const autorizadoresValidos = autorizadoresData.filter(
				(a) => a.id && a.id > 0
			);
			if (autorizadoresValidos.length !== autorizadoresData.length) {
				const invalidos = autorizadoresData.filter((a) => !a.id || a.id === 0);
				console.warn(
					"Algunos autorizadores tienen ID inválido y serán filtrados:",
					invalidos
				);
				mostrarNotificacion(
					`Se filtraron ${invalidos.length} autorizador(es) con ID inválido`,
					"warning"
				);
			}
			console.log(
				"Autorizadores disponibles cargados (con ID válido):",
				autorizadoresValidos
			);
			setTimeout(() => {
				setAutorizadoresDisponibles(autorizadoresValidos);
			}, 0);
		}
	}, [autorizadoresData, mostrarNotificacion]);

	useEffect(() => {
		if (nivelesData && nivelesData.length > 0) {
			// El backend retorna AutorizadoresDTO[][] directamente
			// No necesitamos mapear, solo convertir a nuestro formato Nivel[]
			const nivelesFormateados: Nivel[] = nivelesData.map(
				(nivelArray, index) => {
					// nivelArray ya es AutorizadoresDTO[], solo necesitamos formatearlo
					return {
						nivel: index + 1,
						autorizadores: nivelArray, // Ya son AutorizadoresDTO completos con todos los datos
					};
				}
			);

			setTimeout(() => {
				setNiveles(nivelesFormateados);
				setNivelesOriginales(JSON.parse(JSON.stringify(nivelesFormateados)));
			}, 0);
		} else {
			setTimeout(() => {
				setNiveles([]);
				setNivelesOriginales([]);
			}, 0);
		}
	}, [nivelesData]);

	const crearRelacionMutation = useMutation({
		mutationFn: async (nivelesParaGuardar: AutorizadoresDTO[][]) => {
			if (!arbol || !arbol.id || !idEmpresaActual) {
				throw new Error("Falta el árbol o el ID de empresa");
			}
			// Primero eliminar todas las relaciones existentes
			await datosEmpleadoService.EliminarArbolxAutorizador(
				arbol.id,
				idEmpresaActual
			);
			// Luego crear las nuevas relaciones
			return await datosEmpleadoService.CrearRelación_ArbolxAutorizador(
				nivelesParaGuardar,
				arbol.id,
				idEmpresaActual
			);
		},
		onSuccess: async () => {
      mostrarNotificacion(
        "Árbol de autorización guardado exitosamente",
        "success"
      );
      await refetchArbol();
      await refetchNiveles();
      setMostrarConfirmacionGuardar(false);
      onSuccess?.();
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al guardar árbol: ${
					error instanceof Error ? error.message : "Error desconocido"
				}`,
				"error"
			);
		},
	});

	const agregarNivel = () => {
		const nuevoNivel =
			niveles.length > 0 ? Math.max(...niveles.map((n) => n.nivel)) + 1 : 1;
		setNiveles((prev) => [...prev, { nivel: nuevoNivel, autorizadores: [] }]);
		mostrarNotificacion(`Nivel ${nuevoNivel} agregado`, "success");
	};

	const eliminarNivel = (nivelAEliminar: number) => {
		setNiveles((prev) => prev.filter((n) => n.nivel !== nivelAEliminar));
		mostrarNotificacion(`Nivel ${nivelAEliminar} eliminado`, "info");
	};

	const agregarAutorizadorANivel = (autorizador: AutorizadoresDTO) => {
		if (nivelSeleccionado === null) return;

		setNiveles((prev) =>
			prev.map((nivel) =>
				nivel.nivel === nivelSeleccionado
					? {
							...nivel,
							autorizadores: [...nivel.autorizadores, autorizador],
					  }
					: nivel
			)
		);

		setMostrarSelectorAutorizadores(false);
		setNivelSeleccionado(null);
		mostrarNotificacion(
			`${autorizador.nombre} agregado al nivel ${nivelSeleccionado}`,
			"success"
		);
	};

	const eliminarAutorizadorDeNivel = (
		nivel: number,
		autorizador: AutorizadoresDTO
	) => {
		setNiveles((prev) =>
			prev.map((n) =>
				n.nivel === nivel
					? {
							...n,
							autorizadores: n.autorizadores.filter(
								(a) => a.id !== autorizador.id
							),
					  }
					: n
			)
		);
		mostrarNotificacion(
			`${autorizador.nombre} eliminado del nivel ${nivel}`,
			"info"
		);
	};

	const autorizadoresAsignados = useMemo(() => {
		return niveles.flatMap((nivel) => nivel.autorizadores);
	}, [niveles]);

	const autorizadoresDisponiblesParaSeleccionar = useMemo(() => {
		return autorizadoresDisponibles.filter(
			(a) => !autorizadoresAsignados.some((asignado) => asignado.id === a.id)
		);
	}, [autorizadoresDisponibles, autorizadoresAsignados]);

	// Función helper para obtener los autorizadores de un nivel desde nivelesData
	const obtenerAutorizadoresDelNivel = useCallback(
		(nivelNumero: number): AutorizadoresDTO[] => {
			// Priorizar el estado local si hay cambios sin guardar
			// Si hay cambios locales, usar esos; si no, usar los datos del backend
			const nivelLocal = niveles.find((n) => n.nivel === nivelNumero);
			if (nivelLocal && nivelLocal.autorizadores.length > 0) {
				return nivelLocal.autorizadores;
			}

			// Si no hay cambios locales, usar datos del backend (nivelesData)
			// El backend retorna AutorizadoresDTO[][] directamente, no necesitamos mapear
			if (nivelesData && nivelesData.length > 0) {
				const nivelIndex = nivelNumero - 1; // Convertir número de nivel a índice (nivel 1 = índice 0)
				if (nivelIndex >= 0 && nivelIndex < nivelesData.length) {
					const nivelArray = nivelesData[nivelIndex];
					// nivelArray ya es AutorizadoresDTO[], retornarlo directamente
					return nivelArray;
				}
			}

			// Si no hay datos, retornar array vacío
			return [];
		},
		[nivelesData, niveles]
	);

	const hayCambios = useMemo(() => {
		return JSON.stringify(niveles) !== JSON.stringify(nivelesOriginales);
	}, [niveles, nivelesOriginales]);

	const validarConfiguracion = (): { valida: boolean; mensaje?: string } => {
		if (niveles.length === 0) {
			return {
				valida: false,
				mensaje: "Debe configurar al menos un nivel de autorización",
			};
		}

		const nivelesSinAutorizadores = niveles.filter(
			(nivel) => nivel.autorizadores.length === 0
		);
		if (nivelesSinAutorizadores.length > 0) {
			return {
				valida: false,
				mensaje: `Los niveles ${nivelesSinAutorizadores
					.map((n) => n.nivel)
					.join(", ")} deben tener al menos un autorizador`,
			};
		}

		// Verificar duplicados en el mismo nivel
		for (const nivel of niveles) {
			const ids = nivel.autorizadores.map((a) => a.id);
			const idsUnicos = new Set(ids);
			if (ids.length !== idsUnicos.size) {
				return {
					valida: false,
					mensaje: `El nivel ${nivel.nivel} tiene autorizadores duplicados`,
				};
			}
		}

		return { valida: true };
	};

	const guardarCambios = () => {
		const validacion = validarConfiguracion();
		if (!validacion.valida) {
			mostrarNotificacion(
				validacion.mensaje || "La configuración no es válida",
				"error"
			);
			return;
		}

		// Convertir niveles a formato AutorizadoresDTO[][]
		// El backend solo usa el campo 'id' del AutorizadoresDTO para obtener el idAutorizador
		// El backend construye su propio objeto arbol_autorizadoresDTO con:
		// - id = 0 (nuevo registro)
		// - idArbol = idArbol (del parámetro)
		// - idAutorizador = relacion[i][l].id (el ID del autorizador)
		// - nivelAutorizacion = i+1 (índice del array + 1)
		// - estatus = 1
		const nivelesParaGuardar: AutorizadoresDTO[][] = niveles.map((nivel) =>
			nivel.autorizadores.map((autorizador) => {
				// Validar que el ID del autorizador sea válido
				if (!autorizador.id || autorizador.id === 0) {
					console.error(
						"Error: El autorizador no tiene un ID válido",
						autorizador
					);
					mostrarNotificacion(
						`Error: El autorizador "${autorizador.nombre}" no tiene un ID válido`,
						"error"
					);
					throw new Error(
						`El autorizador "${autorizador.nombre}" no tiene un ID válido`
					);
				}

				// El backend solo necesita el 'id', pero enviamos el objeto completo
				// con valores mínimos requeridos para cumplir con la interfaz
				return {
					id: autorizador.id, // Este es el ID que el backend usa como idAutorizador
					idArbol: arbol?.id || 0,
					idPlazaEmpleado: idPlazaEmpleado,
					estatus: 1,
					fechaAlta: new Date().toISOString(),
					fechaBaja: null,
					nombre: autorizador.nombre || "",
					nivelAutorizacion: nivel.nivel, // El backend ignora esto y usa el índice del array + 1
					separador: false,
				};
			})
		);

		// Validar que todos los niveles tengan al menos un autorizador con ID válido
		const nivelesVacios = nivelesParaGuardar.filter(
			(nivel) => nivel.length === 0
		);
		if (nivelesVacios.length > 0) {
			mostrarNotificacion(
				"Todos los niveles deben tener al menos un autorizador",
				"error"
			);
			return;
		}

		console.log(
			"Datos a enviar al backend:",
			JSON.stringify(nivelesParaGuardar, null, 2)
		);
		console.log(
			"Estructura esperada por backend: List<List<AutorizadoresDTO>> donde solo se usa el campo 'id'"
		);

		crearRelacionMutation.mutate(nivelesParaGuardar);
	};

	const revertirCambios = () => {
		setNiveles(JSON.parse(JSON.stringify(nivelesOriginales)));
		mostrarNotificacion("Cambios revertidos", "info");
	};

	if (cargandoArbol || cargandoAutorizadores || cargandoNiveles) {
		return <Loader text="Cargando configuración del árbol..." />;
	}

	if (!arbol) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error: No se pudo cargar el árbol de autorización
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
				<div className="flex items-center gap-3">
					<FontAwesomeIcon
						icon={faSitemap}
						className="text-2xl text-blue-500"
					/>
					<div>
						<h2 className="text-xl font-bold text-gray-800">
							Árbol de Autorización{" "}
							{tipoArbol === "ejercido" ? "Ejercido" : "Anticipo"}
						</h2>
						<p className="text-sm text-gray-600">Plaza: {nombrePlaza}</p>
					</div>
				</div>

				<div className="flex gap-2">
					{hayCambios && (
						<CustomButton
							type="button"
							text="Revertir"
							onClick={revertirCambios}
							className="bg-gray-500 hover:bg-gray-600 text-white"
						/>
					)}
					<CustomButton
						type="button"
						text="Agregar Nivel"
						onClick={agregarNivel}
						className="bg-blue-500 hover:bg-blue-600 text-white"
					/>
					<CustomButton
						type="button"
						text="Guardar Cambios"
						onClick={() => setMostrarConfirmacionGuardar(true)}
						disabled={!hayCambios || crearRelacionMutation.isPending}
						isLoading={crearRelacionMutation.isPending}
						className="bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300"
					/>
				</div>
			</div>

			{/* Indicador de cambios pendientes */}
			{hayCambios && (
				<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
					<div className="flex items-center gap-2 text-yellow-800">
						<FontAwesomeIcon icon={faUndo} />
						<span className="text-sm font-medium">
							Tienes cambios sin guardar. No olvides guardar antes de salir.
						</span>
					</div>
				</div>
			)}

			{/* Indicador de validación */}
			{(() => {
				const validacion = validarConfiguracion();
				if (!validacion.valida && niveles.length > 0) {
					return (
						<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
							<div className="flex items-center gap-2 text-red-800">
								<FontAwesomeIcon icon={faUndo} />
								<span className="text-sm font-medium">
									{validacion.mensaje}
								</span>
							</div>
						</div>
					);
				}
				return null;
			})()}

			{/* Lista de niveles */}
			<div className="space-y-4">
				{niveles.length > 0 ? (
					niveles
						.sort((a, b) => a.nivel - b.nivel)
						.map((nivel) => (
							<div
								key={nivel.nivel}
								className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm"
							>
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold text-gray-800">
										Nivel {nivel.nivel}
									</h3>
									<div className="flex gap-2">
										<CustomButton
											type="button"
											text="Agregar Autorizador"
											onClick={() => {
												setNivelSeleccionado(nivel.nivel);
												setMostrarSelectorAutorizadores(true);
											}}
											disabled={
												autorizadoresDisponiblesParaSeleccionar.length === 0
											}
											className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
										/>
										<ActionButton
											icon={faTrash}
											tooltip="Eliminar nivel"
											text="Eliminar"
											variant="custom"
											customClassName="bg-red-500 text-white hover:bg-red-600"
											onClick={() => eliminarNivel(nivel.nivel)}
											showText={false}
										/>
									</div>
								</div>

								{(() => {
									// Obtener autorizadores del nivel desde nivelesData o estado local
									const autorizadoresDelNivel = obtenerAutorizadoresDelNivel(nivel.nivel);
									
									return autorizadoresDelNivel.length > 0 ? (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
											{autorizadoresDelNivel.map((autorizador) => (
												<div
													key={autorizador.id}
													className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
												>
													<span className="text-sm text-gray-700">
														{autorizador.nombre}
													</span>
													<ActionButton
														icon={faTimes}
														tooltip="Eliminar"
														text="Eliminar"
														variant="custom"
														customClassName="bg-red-500 text-white hover:bg-red-600"
														onClick={() =>
															eliminarAutorizadorDeNivel(nivel.nivel, autorizador)
														}
														showText={false}
													/>
												</div>
											))}
										</div>
									) : (
										<p className="text-sm text-gray-500 italic">
											No hay autorizadores en este nivel
										</p>
									);
								})()}
							</div>
						))
				) : (
					<div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
						<FontAwesomeIcon
							icon={faSitemap}
							className="text-6xl text-gray-300 mb-4"
						/>
						<h3 className="text-lg font-medium text-gray-600 mb-2">
							No hay niveles configurados
						</h3>
						<p className="text-gray-500 mb-4">
							Comienza agregando el primer nivel de autorización
						</p>
						<CustomButton
							type="button"
							text="Agregar Primer Nivel"
							onClick={agregarNivel}
							className="bg-blue-500 hover:bg-blue-600 text-white"
						/>
					</div>
				)}
			</div>

			{/* Modal de selección de autorizadores */}
			{mostrarSelectorAutorizadores && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">
								Agregar Autorizador al Nivel {nivelSeleccionado}
							</h3>
							<ActionButton
								icon={faTimes}
								tooltip="Cerrar"
								text="Cerrar"
								variant="cancel"
								onClick={() => {
									setMostrarSelectorAutorizadores(false);
									setNivelSeleccionado(null);
								}}
								showText={false}
							/>
						</div>

						{autorizadoresDisponiblesParaSeleccionar.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								{autorizadoresDisponiblesParaSeleccionar.map((autorizador) => (
									<button
										key={autorizador.id}
										onClick={() => agregarAutorizadorANivel(autorizador)}
										className="p-3 text-left bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
									>
										<span className="text-sm font-medium text-gray-800">
											{autorizador.nombre}
										</span>
									</button>
								))}
							</div>
						) : (
							<p className="text-sm text-gray-500 text-center py-4">
								No hay autorizadores disponibles para agregar
							</p>
						)}
					</div>
				</div>
			)}

			{/* Modal de confirmación para guardar */}
			<ModalConfirmacion
				abierto={mostrarConfirmacionGuardar}
				titulo="Confirmar guardado"
				mensaje="¿Está seguro de que desea guardar los cambios realizados en la configuración del árbol de autorización?"
				textoConfirmar="Guardar"
				textoCancelar="Cancelar"
				colorConfirmar="green"
				onConfirmar={guardarCambios}
				onCancelar={() => setMostrarConfirmacionGuardar(false)}
			/>
		</div>
	);
}
