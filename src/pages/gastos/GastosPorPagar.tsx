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
import type { GastoDTO, MovimientosCuentaContableDTO } from "../../types/gastos";
import { MRT_Localization_ES } from "../../config/mrtLocalization";
import { useTituloStore } from "../../services/tituloService";
import { faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import TableActionButton from "../../components/TableActionButton";
import ActionButton from "../../components/ActionButton";
import { formatearMoneda } from "../../helpers/formatHelpers";
import { formatearFechaLocalizada } from "../../helpers/dateHelpers";

/**
 * Componente de gastos por pagar
 * Muestra gastos que están listos para ser pagados y permite realizar el pago
 *
 * @returns {JSX.Element} El componente de gastos por pagar
 */
export default function GastosPorPagar(): JSX.Element {
	const { obtenerIdEmpresa, permisosEspeciales } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);
	const { actualizarTitulo } = useTituloStore();
	const queryClient = useQueryClient();
	const idEmpresa = obtenerIdEmpresa();
	const idUsuario = permisosEspeciales?.idUsuario
		? parseInt(permisosEspeciales.idUsuario, 10)
		: null;

	const [gastoSeleccionado, setGastoSeleccionado] = useState<GastoDTO | null>(null);
	const [mostrarModalPago, setMostrarModalPago] = useState(false);
	const [archivoPago, setArchivoPago] = useState<File | null>(null);
	const [idCuentaContable, setIdCuentaContable] = useState<number>(0);
	const [isClosingPago, setIsClosingPago] = useState(false);

	// Actualizar título al montar
	useEffect(() => {
		actualizarTitulo("Gastos por Pagar");
	}, [actualizarTitulo]);

	// Query para obtener gastos por pagar
	const {
		data: gastos,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["gastosPorPagar", idEmpresa, idUsuario],
		queryFn: async () => {
			if (!idEmpresa || !idUsuario) {
				throw new Error("Faltan datos de empresa o usuario");
			}
			// Obtener todos los gastos por pagar (sin filtrar por empleado específico)
			return await gastoService.obtenerTodosGastosxPagar(idEmpresa);
		},
		enabled: !!idEmpresa && !!idUsuario,
	});

	// Mutation para pagar gasto
	const pagarGasto = useMutation({
		mutationFn: async (gasto: GastoDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			if (!idCuentaContable || idCuentaContable === 0) {
				throw new Error("Debe seleccionar una cuenta contable");
			}

			const movimiento: MovimientosCuentaContableDTO = {
				id: 0,
				idGasto: gasto.id,
				idCuentaContable: idCuentaContable,
				SaldoAnterior: 0,
				monto: gasto.presupuesto,
				saldoActual: 0,
				fechaAlta: new Date().toISOString(),
				estatus: 1,
			};

			return await gastoService.pagarElGasto(archivoPago, idEmpresa, movimiento);
		},
		onSuccess: () => {
			// Invalidar todas las queries relacionadas con gastos
			void queryClient.invalidateQueries({ queryKey: ["gastosPorPagar"] });
			void queryClient.invalidateQueries({ queryKey: ["gastos"] });
			void queryClient.invalidateQueries({ queryKey: ["misGastos"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosAutorizados"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorAutorizar"] });
			mostrarNotificacion("Gasto pagado exitosamente", "success");
			// Cerrar el modal con animación después de que la mutación sea exitosa
			setIsClosingPago(true);
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al pagar gasto: ${error instanceof Error ? error.message : "Error desconocido"}`,
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
				filterFn: "between",
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
		renderRowActions: ({ row }) => (
			<TableActionButton
				icon={faMoneyBillWave}
				onClick={() => {
					setGastoSeleccionado(row.original);
					setMostrarModalPago(true);
				}}
				tooltip="Pagar"
				variant="custom"
				customClassName="bg-green-500 text-white hover:bg-green-600"
			/>
		),
	});

	if (isLoading) {
		return <Loader text="Cargando gastos por pagar..." />;
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
						Error al cargar los gastos por pagar. Por favor, intente nuevamente.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-3 sm:p-4 lg:p-6">
			<div className="mb-4 sm:mb-6">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
					Gastos por Pagar
				</h1>
				<p className="text-sm sm:text-base text-gray-600">
					Total de gastos por pagar: {gastos?.length || 0}
				</p>
			</div>

			{/* Tabla de MRT */}
			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>

			{/* Modal de Pago */}
			{(mostrarModalPago || isClosingPago) && gastoSeleccionado && (
				<div 
					className={`fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
						isClosingPago ? "animate-modal-overlay-out" : "animate-modal-overlay-in"
					}`}
					onClick={() => {
						if (!isClosingPago) {
							setIsClosingPago(true);
						}
					}}
				>
					<div 
						className={`bg-white rounded-lg shadow-xl max-w-md w-full p-6 ${
							isClosingPago ? "animate-modal-content-out" : "animate-modal-content-in"
						}`}
						onClick={(e) => e.stopPropagation()}
						onAnimationEnd={(e) => {
							// Solo procesar el evento del elemento principal, no de los hijos
							if (e.currentTarget === e.target && isClosingPago) {
								// Pequeño delay para asegurar que la animación visual termine
								setTimeout(() => {
									setIsClosingPago(false);
									setMostrarModalPago(false);
									setGastoSeleccionado(null);
									setArchivoPago(null);
									setIdCuentaContable(0);
								}, 50);
							}
						}}
					>
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							¿Pagar este gasto?
						</h2>
						<div className="mb-4 space-y-2">
							<p className="text-gray-700">
								<strong>Nombre:</strong> {gastoSeleccionado.nombre}
							</p>
							<p className="text-gray-700">
								<strong>Empleado:</strong> {gastoSeleccionado.nombreEmpleado}
							</p>
							<p className="text-gray-700">
								<strong>Presupuesto:</strong> $
								{formatearMoneda(gastoSeleccionado.presupuesto, false)}
							</p>
							<div>
								<label className="block text-gray-700 font-medium mb-2">
									ID Cuenta Contable:
								</label>
								<input
									type="number"
									value={idCuentaContable || ""}
									onChange={(e) => setIdCuentaContable(parseInt(e.target.value, 10) || 0)}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Ingrese el ID de cuenta contable"
								/>
							</div>
							<div>
								<label className="block text-gray-700 font-medium mb-2">
									Archivo de comprobante (opcional):
								</label>
								<input
									type="file"
									onChange={(e) => setArchivoPago(e.target.files?.[0] || null)}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									accept=".pdf,.jpg,.jpeg,.png"
								/>
							</div>
						</div>
						<div className="flex gap-3 justify-end">
							<ActionButton
								variant="cancel"
								type="button"
								onClick={() => {
									if (!isClosingPago) {
										setIsClosingPago(true);
									}
								}}
								text="Cancelar"
							/>
							<ActionButton
								variant="custom"
								type="button"
								onClick={() => {
									if (!isClosingPago && gastoSeleccionado && !pagarGasto.isPending) {
										// Ejecutar la mutación inmediatamente, sin cerrar el modal
										pagarGasto.mutate(gastoSeleccionado);
									}
								}}
								text="Pagar"
								isLoading={pagarGasto.isPending}
								loadingText="Pagando..."
								disabled={pagarGasto.isPending || !idCuentaContable || idCuentaContable === 0 || isClosingPago}
								customClassName="bg-green-500 text-white hover:bg-green-600"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
