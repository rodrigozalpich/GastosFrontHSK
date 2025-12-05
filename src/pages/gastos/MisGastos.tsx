import { type JSX, useMemo, useEffect, useState } from "react";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { gastoService } from "../../services/gastoService";
import { useAuthStore } from "../../store/authStore";
import Loader from "../../components/Loader";
import { useNotificacionStore } from "../../store/notificacionStore";
import type { GastoDTO } from "../../types/gastos";
import { MRT_Localization_ES } from "../../config/mrtLocalization";
import { useTituloStore } from "../../services/tituloService";
import ModalGasto from "../../components/ModalGasto";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import { faDollar } from "@fortawesome/free-solid-svg-icons";
import { useGastos } from "../../hooks/useGastos";
import TableActionButton from "../../components/TableActionButton";
import ActionButton from "../../components/ActionButton";
import { formatearMoneda } from "../../helpers/formatHelpers";
import { formatearFechaLocalizada } from "../../helpers/dateHelpers";
import BotonesNavegacionGastos from "../../components/BotonesNavegacionGastos";
import { ICONOS_ACCIONES } from "../../config/iconosAcciones";
import { ROUTES } from "../../config/routes.config";

/**
 * Componente de mis gastos usando Material React Table
 * Muestra los gastos del usuario actual
 *
 * @returns {JSX.Element} El componente de mis gastos
 */
export default function MisGastos(): JSX.Element {
	const navigate = useNavigate();
	const { obtenerIdEmpresa, permisosEspeciales } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore(
		(state) => state.mostrarNotificacion
	);
	const { actualizarTitulo } = useTituloStore();
	const idEmpresa = obtenerIdEmpresa();
	const idUsuario = permisosEspeciales?.idUsuario
		? parseInt(permisosEspeciales.idUsuario, 10)
		: null;
	const [gastoSeleccionado, setGastoSeleccionado] = useState<GastoDTO | null>(
		null
	);
	const [modoModal, setModoModal] = useState<"crear" | "editar" | null>(null);
	const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] =
		useState(false);
	const [gastoAEliminar, setGastoAEliminar] = useState<GastoDTO | null>(null);
	const { eliminarGasto } = useGastos();

	// Actualizar título al montar
	useEffect(() => {
		actualizarTitulo("Mis Gastos");
	}, [actualizarTitulo]);

	const {
		data: gastos,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["misGastos", idEmpresa, idUsuario],
		queryFn: async () => {
			if (!idEmpresa || !idUsuario) {
				throw new Error("Faltan datos de empresa o usuario");
			}
			return await gastoService.obtenerXIdEmpleado(idUsuario, idEmpresa);
		},
		enabled: !!idEmpresa && !!idUsuario,
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
				accessorKey: "estatus",
				header: "Estatus",
				size: 150,
				Cell: ({ cell }) => {
					const estatus = cell.getValue<number>();
					const estatusMap: Record<
						number,
						{ label: string; className: string }
					> = {
						1: { label: "Abierto", className: "bg-green-100 text-green-800" },
						2: { label: "Finalizado", className: "bg-gray-100 text-gray-800" },
						3: { label: "Autorizado", className: "bg-blue-100 text-blue-800" },
						4: { label: "No Autorizado", className: "bg-red-100 text-red-800" },
						5: {
							label: "Pendiente de Pago",
							className: "bg-yellow-100 text-yellow-800",
						},
						6: { label: "Pagado", className: "bg-green-100 text-green-800" },
						7: {
							label: "En proceso de Autorización",
							className: "bg-purple-100 text-purple-800",
						},
						8: {
							label: "En devolución",
							className: "bg-orange-100 text-orange-800",
						},
						9: { label: "Cancelado", className: "bg-red-100 text-red-800" },
					};
					const estado = estatusMap[estatus] || {
						label: "Desconocido",
						className: "bg-gray-100 text-gray-800",
					};
					return (
						<span
							className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estado.className}`}
						>
							{estado.label}
						</span>
					);
				},
				enableColumnFilter: true,
				enableSorting: true,
				filterFn: "equals",
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
				filterFn: "dateRange",
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

	// Memoizar los datos para evitar recálculos innecesarios
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
		// Deshabilitar el auto-reset de paginación cuando cambian los datos
		autoResetPageIndex: false,
		localization: MRT_Localization_ES,
		muiTableContainerProps: {
			sx: {
				maxHeight: "600px",
			},
		},
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
					iconSrc={ICONOS_ACCIONES.ver}
					onClick={() => {
						navigate(
							ROUTES.GASTOS_DETALLE.replace(
								":gastoId",
								row.original.id.toString()
							)
						);
					}}
					tooltip="Ver"
					variant="ver"
				/>
				<TableActionButton
					iconSrc={ICONOS_ACCIONES.editar}
					onClick={() => {
						setGastoSeleccionado(row.original);
						setModoModal("editar");
					}}
					tooltip="Editar"
					variant="edit"
				/>
				<TableActionButton
					iconSrc={ICONOS_ACCIONES.eliminar}
					onClick={() => {
						setGastoAEliminar(row.original);
						setMostrarConfirmacionEliminar(true);
					}}
					tooltip="Eliminar"
					variant="delete"
				/>
			</div>
		),
	});

	if (isLoading) {
		return <Loader text="Cargando mis gastos..." />;
	}

	if (isError) {
		mostrarNotificacion(
			`Error al cargar gastos: ${
				error instanceof Error ? error.message : "Error desconocido"
			}`,
			"error"
		);
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error al cargar tus gastos. Por favor, intente nuevamente.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-3 sm:p-4 lg:p-6">
			{/* Botones de navegación siempre visibles */}
			<BotonesNavegacionGastos />

			<div className="mb-4 sm:mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
						Mis Gastos
					</h1>
					<p className="text-sm sm:text-base text-gray-600">
						Total de gastos: {gastos?.length || 0}
					</p>
				</div>
				<ActionButton
					onClick={() => {
						setGastoSeleccionado(null);
						setModoModal("crear");
					}}
					icon={faDollar}
					text="Nuevo Gasto"
					variant="primary"
				/>
			</div>

			{/* Tabla de MRT - Maneja filtros, búsqueda, paginación, ordenamiento */}
			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>

			{/* Modal de Gasto */}
			{modoModal && (
				<ModalGasto
					gasto={gastoSeleccionado}
					modo={modoModal}
					onClose={() => {
						setModoModal(null);
						setGastoSeleccionado(null);
					}}
				/>
			)}

			{/* Modal de Confirmación para Eliminar */}
			<ModalConfirmacion
				abierto={mostrarConfirmacionEliminar}
				titulo="Eliminar Gasto"
				mensaje={`¿Está seguro de que desea eliminar el gasto "${
					gastoAEliminar?.nombre || ""
				}"? Esta acción no se puede deshacer.`}
				textoConfirmar="Eliminar"
				textoCancelar="Cancelar"
				colorConfirmar="red"
				onConfirmar={() => {
					if (gastoAEliminar) {
						eliminarGasto(gastoAEliminar, {
							onSuccess: () => {
								setMostrarConfirmacionEliminar(false);
								setGastoAEliminar(null);
							},
						});
					}
				}}
				onCancelar={() => {
					setMostrarConfirmacionEliminar(false);
					setGastoAEliminar(null);
				}}
			/>
		</div>
	);
}
