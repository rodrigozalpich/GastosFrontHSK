import { type JSX, useMemo, useEffect, useState } from "react";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gastoService } from "../../services/gastoService";
import { useAuthStore } from "../../store/authStore";
import Loader from "../../components/Loader";
import { useNotificacionStore } from "../../store/notificacionStore";
import type { GastoDTO, GastoAutorizadoDTO } from "../../types/gastos";
import { MRT_Localization_ES } from "../../config/mrtLocalization";
import { useTituloStore } from "../../services/tituloService";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import TableActionButton from "../../components/TableActionButton";
import ActionButton from "../../components/ActionButton";
import { formatearMoneda } from "../../helpers/formatHelpers";
import { formatearFechaLocalizada } from "../../helpers/dateHelpers";
import BotonesNavegacionGastos from "../../components/BotonesNavegacionGastos";

/**
 * Componente de gastos por autorizar
 * Muestra gastos en estado "En Autorización" (estatus 3) y permite autorizar o rechazar
 *
 * @returns {JSX.Element} El componente de gastos por autorizar
 */
export default function GastosPorAutorizar(): JSX.Element {
	const { obtenerIdEmpresa, permisosEspeciales } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);
	const { actualizarTitulo } = useTituloStore();
	const queryClient = useQueryClient();
	const idEmpresa = obtenerIdEmpresa();
	const idUsuario = permisosEspeciales?.idUsuario
		? parseInt(permisosEspeciales.idUsuario, 10)
		: null;

	const [gastoSeleccionado, setGastoSeleccionado] = useState<GastoDTO | null>(null);
	const [mostrarModalAutorizar, setMostrarModalAutorizar] = useState(false);
	const [mostrarModalRechazar, setMostrarModalRechazar] = useState(false);
	const [motivoRechazo, setMotivoRechazo] = useState("");
	const [isClosingAutorizar, setIsClosingAutorizar] = useState(false);
	const [isClosingRechazar, setIsClosingRechazar] = useState(false);

	// Actualizar título al montar
	useEffect(() => {
		actualizarTitulo("Gastos por Autorizar");
	}, [actualizarTitulo]);

	// Query para obtener gastos por autorizar (estatus 3)
	const {
		data: gastos,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["gastosPorAutorizar", idEmpresa, idUsuario],
		queryFn: async () => {
			if (!idEmpresa || !idUsuario) {
				throw new Error("Faltan datos de empresa o usuario");
			}
			// Obtener todos los gastos y filtrar por estatus 7 (En proceso de Autorización)
			const todosGastos = await gastoService.obtenerGastos(idUsuario, idEmpresa);
			return todosGastos.filter((g) => g.estatus === 7);
		},
		enabled: !!idEmpresa && !!idUsuario,
	});

	// Mutation para autorizar gasto
	const autorizarGasto = useMutation({
		mutationFn: async (gasto: GastoDTO) => {
			if (!idEmpresa || !idUsuario) {
				throw new Error("Faltan datos de empresa o usuario");
			}
			const gastoAutorizado: GastoAutorizadoDTO = {
				id: 0,
				idGasto: gasto.id,
				idAutorizador: idUsuario,
				esAutorizado: true,
				fechaAutorizacion: new Date().toISOString(),
				estatus: 3, // 3 = Autorizado
				numeroRechazos: 0,
				nivelAutorizacion: gasto.nivelAutorizador,
				VueltaAnticipo: null,
			};
			return await gastoService.autorizarGasto(gastoAutorizado, idEmpresa);
		},
		onSuccess: () => {
			// Invalidar todas las queries relacionadas con gastos
			void queryClient.invalidateQueries({ queryKey: ["gastosPorAutorizar"] });
			void queryClient.invalidateQueries({ queryKey: ["gastos"] });
			void queryClient.invalidateQueries({ queryKey: ["misGastos"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosAutorizados"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorPagar"] });
			mostrarNotificacion("Gasto autorizado exitosamente", "success");
			// Cerrar el modal con animación después de que la mutación sea exitosa
			setIsClosingAutorizar(true);
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al autorizar gasto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	// Mutation para rechazar gasto
	const rechazarGasto = useMutation({
		mutationFn: async (gasto: GastoDTO) => {
			if (!idEmpresa || !idUsuario) {
				throw new Error("Faltan datos de empresa o usuario");
			}
			if (!motivoRechazo.trim()) {
				throw new Error("El motivo de rechazo es obligatorio");
			}
			const gastoRechazado: GastoAutorizadoDTO = {
				id: 0,
				idGasto: gasto.id,
				idAutorizador: idUsuario,
				esAutorizado: false,
				fechaAutorizacion: new Date().toISOString(),
				estatus: 4, // 4 = No Autorizado
				numeroRechazos: 0,
				nivelAutorizacion: gasto.nivelAutorizador,
				VueltaAnticipo: null,
			};
			return await gastoService.rechazarGasto(gastoRechazado, idEmpresa);
		},
		onSuccess: () => {
			// Invalidar todas las queries relacionadas con gastos
			void queryClient.invalidateQueries({ queryKey: ["gastosPorAutorizar"] });
			void queryClient.invalidateQueries({ queryKey: ["gastos"] });
			void queryClient.invalidateQueries({ queryKey: ["misGastos"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosAutorizados"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorPagar"] });
			mostrarNotificacion("Gasto rechazado exitosamente", "success");
			// Cerrar el modal con animación después de que la mutación sea exitosa
			setIsClosingRechazar(true);
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al rechazar gasto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	// Definir columnas para MRT
	const columns = useMemo<MRT_ColumnDef<GastoDTO>[]>(
		() => [
			{
				accessorKey: "nombre",
				header: "Nombre",
				size: 200,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "nombreEmpleado",
				header: "Empleado",
				size: 150,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "presupuesto",
				header: "Presupuesto",
				size: 120,
				Cell: ({ cell }) => {
					const valor = cell.getValue<number>();
					return formatearMoneda(valor);
				},
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "fechaAlta",
				header: "Fecha Alta",
				size: 120,
				Cell: ({ cell }) => {
					const fecha = cell.getValue<string | Date>();
					return formatearFechaLocalizada(fecha);
				},
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "descripcion",
				header: "Descripción",
				size: 250,
				enableColumnFilter: true,
			},
			{
				accessorKey: "autorizador",
				header: "Autorizador",
				size: 150,
				enableColumnFilter: true,
			},
		],
		[]
	);

	// Datos memoizados
	const datosMemoizados = useMemo(() => gastos || [], [gastos]);

	// Configurar la tabla con MRT
	const table = useMaterialReactTable({
		columns,
		data: datosMemoizados,
		enableColumnFilters: true,
		enableGlobalFilter: true,
		enablePagination: true,
		enableSorting: true,
		enableRowSelection: false,
		enableDensityToggle: true,
		enableFullScreenToggle: true,
		enableColumnResizing: false,
		enableRowActions: true,
		positionActionsColumn: "last",
		initialState: {
			pagination: { pageSize: 10, pageIndex: 0 },
			showGlobalFilter: true,
			density: "comfortable",
		},
		autoResetPageIndex: false,
		localization: MRT_Localization_ES,
		muiTableContainerProps: { sx: { maxHeight: "600px" } },
		muiTableHeadCellProps: ({ column, table }) => {
			const allColumns = table.getAllColumns();
			const isFirstColumn = column.getIndex() === 0;
			const isLastColumn = column.getIndex() === allColumns.length - 1;
			return {
				sx: {
					backgroundColor: "#312E81",
					color: "#ffffff",
					...(isFirstColumn && { borderTopLeftRadius: "12px" }),
					...(isLastColumn && { borderTopRightRadius: "12px" }),
				},
			};
		},
		renderRowActions: ({ row }) => (
			<div className="flex gap-2">
				<TableActionButton
					icon={faCheck}
					onClick={() => {
						setGastoSeleccionado(row.original);
						setMostrarModalAutorizar(true);
					}}
					tooltip="Autorizar"
					variant="custom"
					customClassName="bg-green-500 text-white hover:bg-green-600"
				/>
				<TableActionButton
					icon={faTimes}
					onClick={() => {
						setGastoSeleccionado(row.original);
						setMostrarModalRechazar(true);
					}}
					tooltip="Rechazar"
					variant="delete"
				/>
			</div>
		),
	});

	if (isLoading) {
		return <Loader text="Cargando gastos por autorizar..." />;
	}

	if (isError) {
		mostrarNotificacion(
			`Error al cargar gastos: ${error instanceof Error ? error.message : "Error desconocido"}`,
			"error"
		);
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error al cargar los gastos por autorizar. Por favor, intente nuevamente.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-3 sm:p-4 lg:p-6">
			{/* Botones de navegación siempre visibles */}
			<BotonesNavegacionGastos />
			
			<div className="mb-4 sm:mb-6">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
					Gastos por Autorizar
				</h1>
				<p className="text-sm sm:text-base text-gray-600">
					Total de gastos: {gastos?.length || 0}
				</p>
			</div>

			{/* Tabla de MRT */}
			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>

			{/* Modal de Autorizar */}
			{(mostrarModalAutorizar || isClosingAutorizar) && gastoSeleccionado && (
				<div 
					className={`fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
						isClosingAutorizar ? "animate-modal-overlay-out" : "animate-modal-overlay-in"
					}`}
					onClick={() => {
						if (!isClosingAutorizar) {
							setIsClosingAutorizar(true);
						}
					}}
				>
					<div 
						className={`bg-white rounded-lg shadow-xl max-w-md w-full p-6 ${
							isClosingAutorizar ? "animate-modal-content-out" : "animate-modal-content-in"
						}`}
						onClick={(e) => e.stopPropagation()}
						onAnimationEnd={(e) => {
							// Solo procesar el evento del elemento principal, no de los hijos
							if (e.currentTarget === e.target && isClosingAutorizar) {
								// Pequeño delay para asegurar que la animación visual termine
								setTimeout(() => {
									setIsClosingAutorizar(false);
									setMostrarModalAutorizar(false);
									setGastoSeleccionado(null);
									// Resetear el estado de la mutación si es necesario
								}, 50);
							}
						}}
					>
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							¿Autorizar este gasto?
						</h2>
						<div className="mb-4">
							<p className="text-gray-700">
								<strong>Nombre:</strong> {gastoSeleccionado.nombre}
							</p>
							<p className="text-gray-700">
								<strong>Empleado:</strong> {gastoSeleccionado.nombreEmpleado}
							</p>
							<p className="text-gray-700">
								<strong>Presupuesto:</strong> {formatearMoneda(gastoSeleccionado.presupuesto)}
							</p>
						</div>
						<div className="flex gap-3 justify-end">
							<ActionButton
								variant="cancel"
								type="button"
								onClick={() => {
									if (!isClosingAutorizar) {
										setIsClosingAutorizar(true);
									}
								}}
								text="Cancelar"
							/>
							<ActionButton
								variant="custom"
								type="button"
								onClick={() => {
									if (!isClosingAutorizar && gastoSeleccionado && !autorizarGasto.isPending) {
										// Ejecutar la mutación inmediatamente, sin cerrar el modal
										autorizarGasto.mutate(gastoSeleccionado);
									}
								}}
								text="Autorizar"
								isLoading={autorizarGasto.isPending}
								loadingText="Autorizando..."
								disabled={autorizarGasto.isPending || isClosingAutorizar}
								customClassName="bg-green-500 text-white hover:bg-green-600"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Modal de Rechazar */}
			{(mostrarModalRechazar || isClosingRechazar) && gastoSeleccionado && (
				<div 
					className={`fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
						isClosingRechazar ? "animate-modal-overlay-out" : "animate-modal-overlay-in"
					}`}
					onClick={() => {
						setIsClosingRechazar(true);
						setTimeout(() => {
							setMostrarModalRechazar(false);
							setGastoSeleccionado(null);
							setMotivoRechazo("");
							setIsClosingRechazar(false);
						}, 300);
					}}
				>
					<div 
						className={`bg-white rounded-lg shadow-xl max-w-md w-full p-6 ${
							isClosingRechazar ? "animate-modal-content-out" : "animate-modal-content-in"
						}`}
						onClick={(e) => e.stopPropagation()}
						onAnimationEnd={(e) => {
							// Solo procesar el evento del elemento principal, no de los hijos
							if (e.currentTarget === e.target && isClosingRechazar) {
								// Pequeño delay para asegurar que la animación visual termine
								setTimeout(() => {
									setIsClosingRechazar(false);
									setMostrarModalRechazar(false);
									setGastoSeleccionado(null);
									setMotivoRechazo("");
									// Resetear el estado de la mutación si es necesario
								}, 50);
							}
						}}
					>
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							¿Rechazar este gasto?
						</h2>
						<div className="mb-4">
							<p className="text-gray-700 mb-2">
								<strong>Nombre:</strong> {gastoSeleccionado.nombre}
							</p>
							<p className="text-gray-700 mb-2">
								<strong>Empleado:</strong> {gastoSeleccionado.nombreEmpleado}
							</p>
							<label className="block text-gray-700 font-medium mb-2">
								Motivo de rechazo:
							</label>
							<textarea
								value={motivoRechazo}
								onChange={(e) => setMotivoRechazo(e.target.value)}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows={4}
								placeholder="Ingrese el motivo del rechazo..."
							/>
						</div>
						<div className="flex gap-3 justify-end">
							<ActionButton
								variant="cancel"
								type="button"
								onClick={() => {
									if (!isClosingRechazar) {
										setIsClosingRechazar(true);
									}
								}}
								text="Cancelar"
							/>
							<ActionButton
								variant="custom"
								type="button"
								onClick={() => {
									if (motivoRechazo.trim() && !isClosingRechazar && gastoSeleccionado && !rechazarGasto.isPending) {
										// Ejecutar la mutación inmediatamente, sin cerrar el modal
										rechazarGasto.mutate(gastoSeleccionado);
									}
								}}
								text="Rechazar"
								isLoading={rechazarGasto.isPending}
								loadingText="Rechazando..."
								disabled={rechazarGasto.isPending || !motivoRechazo.trim() || isClosingRechazar}
								customClassName="bg-red-500 text-white hover:bg-red-600"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
