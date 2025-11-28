import { type JSX, useMemo, useEffect } from "react";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { useQuery } from "@tanstack/react-query";
import { gastoService } from "../../services/gastoService";
import { useAuthStore } from "../../store/authStore";
import Loader from "../../components/Loader";
import { useNotificacionStore } from "../../store/notificacionStore";
import type { GastoDTO } from "../../types/gastos";
import { MRT_Localization_ES } from "../../config/mrtLocalization";
import { useTituloStore } from "../../services/tituloService";
import { formatearMoneda } from "../../helpers/formatHelpers";
import { formatearFechaLocalizada } from "../../helpers/dateHelpers";

/**
 * Componente de gastos autorizados
 * Muestra gastos que han sido autorizados (estatus 4 o que tienen autorización)
 *
 * @returns {JSX.Element} El componente de gastos autorizados
 */
export default function GastosAutorizados(): JSX.Element {
	const { obtenerIdEmpresa, permisosEspeciales } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);
	const { actualizarTitulo } = useTituloStore();
	const idEmpresa = obtenerIdEmpresa();
	const idUsuario = permisosEspeciales?.idUsuario
		? parseInt(permisosEspeciales.idUsuario, 10)
		: null;

	// Actualizar título al montar
	useEffect(() => {
		actualizarTitulo("Gastos Autorizados");
	}, [actualizarTitulo]);

	// Query para obtener gastos autorizados
	const {
		data: gastos,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["gastosAutorizados", idEmpresa, idUsuario],
		queryFn: async () => {
			if (!idEmpresa || !idUsuario) {
				throw new Error("Faltan datos de empresa o usuario");
			}
			return await gastoService.obtenerTodosGastosAutorizados(idUsuario, idEmpresa);
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
				accessorKey: "estatus",
				header: "Estatus",
				size: 150,
				Cell: ({ cell }) => {
					const estatus = cell.getValue<number>();
				const estatusMap: Record<number, { label: string; className: string }> = {
					1: { label: "Abierto", className: "bg-green-100 text-green-800" },
					2: { label: "Finalizado", className: "bg-gray-100 text-gray-800" },
					3: { label: "Autorizado", className: "bg-blue-100 text-blue-800" },
					4: { label: "No Autorizado", className: "bg-red-100 text-red-800" },
					5: { label: "Pendiente de Pago", className: "bg-yellow-100 text-yellow-800" },
					6: { label: "Pagado", className: "bg-green-100 text-green-800" },
					7: { label: "En proceso de Autorización", className: "bg-purple-100 text-purple-800" },
					8: { label: "En devolución", className: "bg-orange-100 text-orange-800" },
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
		initialState: {
			pagination: { pageSize: 10, pageIndex: 0 },
			showGlobalFilter: true,
			density: "comfortable",
		},
		autoResetPageIndex: false,
		localization: MRT_Localization_ES,
		muiTableContainerProps: { sx: { maxHeight: "600px" } },
	});

	if (isLoading) {
		return <Loader text="Cargando gastos autorizados..." />;
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
						Error al cargar los gastos autorizados. Por favor, intente nuevamente.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-3 sm:p-4 lg:p-6">
			<div className="mb-4 sm:mb-6">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
					Gastos Autorizados
				</h1>
				<p className="text-sm sm:text-base text-gray-600">
					Total de gastos autorizados: {gastos?.length || 0}
				</p>
			</div>

			{/* Tabla de MRT */}
			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>
		</div>
	);
}
