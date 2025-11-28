import { type JSX, useMemo, useEffect, useState } from "react";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { useTimbrado } from "../hooks/useTimbrado";
import Loader from "../components/Loader";
import type { GastoDTO } from "../types/gastos";
import { MRT_Localization_ES } from "../config/mrtLocalization";
import { useTituloStore } from "../services/tituloService";
import TableActionButton from "../components/TableActionButton";
import { faStamp } from "@fortawesome/free-solid-svg-icons";
import { esVerGastosPorTimbrar } from "../helpers/permisosHelpers";
import ModalResultadoTimbrado from "../components/modals/ModalResultadoTimbrado";
import type { RespuestaTimbradoDTO } from "../types/gastos";
import { formatearFechaLocalizada } from "../helpers/dateHelpers";
import { formatearMoneda } from "../helpers/formatHelpers";

/**
 * Componente de gestión de Timbrado de Gastos
 * Permite ver gastos por timbrar y timbrados, y timbrar gastos
 *
 * @returns {JSX.Element} El componente de gestión de timbrado
 */
export default function Timbrado(): JSX.Element {
	const {
		gastosPorTimbrar,
		gastosTimbrados,
		isLoadingPorTimbrar,
		isLoadingTimbrados,
		isErrorPorTimbrar,
		isErrorTimbrados,
		errorPorTimbrar,
		errorTimbrados,
		timbrarGasto,
		isTimbrando,
	} = useTimbrado();
	const { actualizarTitulo } = useTituloStore();

	const [vistaActiva, setVistaActiva] = useState<"porTimbrar" | "timbrados">("porTimbrar");
	const [mostrarModalResultados, setMostrarModalResultados] = useState(false);
	const [resultadosTimbrado, setResultadosTimbrado] = useState<RespuestaTimbradoDTO[]>([]);

	useEffect(() => {
		actualizarTitulo("Timbrado de Gastos");
	}, [actualizarTitulo]);

	// Mostrar modal cuando la mutación sea exitosa
	useEffect(() => {
		if (timbrarGasto.isSuccess && timbrarGasto.data) {
			setTimeout(() => {
				setResultadosTimbrado(timbrarGasto.data || []);
				setMostrarModalResultados(true);
			}, 0);
		}
	}, [timbrarGasto.isSuccess, timbrarGasto.data]);

	const gastosActuales = vistaActiva === "porTimbrar" ? gastosPorTimbrar : gastosTimbrados;
	const isLoading = vistaActiva === "porTimbrar" ? isLoadingPorTimbrar : isLoadingTimbrados;
	const isError = vistaActiva === "porTimbrar" ? isErrorPorTimbrar : isErrorTimbrados;
	const error = vistaActiva === "porTimbrar" ? errorPorTimbrar : errorTimbrados;

	const handleTimbrarGasto = (gasto: GastoDTO) => {
		timbrarGasto.mutate([gasto.id]);
	};

	const columns = useMemo<MRT_ColumnDef<GastoDTO>[]>(
		() => [
			{
				accessorKey: "nombreEmpleado",
				header: "Empleado",
				size: 150,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "descripcion",
				header: "Descripción",
				size: 250,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "fechaAlta",
				header: "Fecha de gasto",
				size: 150,
				Cell: ({ cell }) => {
					const fecha = cell.getValue<string | Date>();
					return formatearFechaLocalizada(fecha);
				},
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "fechaTimbrado",
				header: "Fecha de Timbrado",
				size: 150,
				Cell: ({ cell }) => {
					const fecha = cell.getValue<string | Date | null>();
					return formatearFechaLocalizada(fecha);
				},
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "presupuesto",
				header: "Presupuesto",
				size: 130,
				Cell: ({ cell }) => {
					const valor = cell.getValue<number | null | undefined>();
					return formatearMoneda(valor);
				},
				enableColumnFilter: true,
				enableSorting: true,
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
		],
		[]
	);

	const datosMemoizados = useMemo(() => gastosActuales || [], [gastosActuales]);

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
		enableRowActions: vistaActiva === "porTimbrar" && esVerGastosPorTimbrar(),
		positionActionsColumn: "last",
		initialState: {
			pagination: { pageSize: 10, pageIndex: 0 },
			showGlobalFilter: true,
			density: "comfortable",
		},
		autoResetPageIndex: false,
		localization: MRT_Localization_ES,
		muiTableContainerProps: { sx: { maxHeight: "600px" } },
		renderRowActions: ({ row }) => {
			if (vistaActiva !== "porTimbrar") return null;
			return (
				<div className="flex gap-2">
					{esVerGastosPorTimbrar() && (
						<TableActionButton
							icon={faStamp}
							onClick={() => handleTimbrarGasto(row.original)}
							tooltip="Timbrar gasto"
							variant="custom"
							customClassName="bg-blue-500 text-white hover:bg-blue-600"
							disabled={isTimbrando}
						/>
					)}
				</div>
			);
		},
	});

	if (isLoading) {
		return <Loader text={`Cargando gastos ${vistaActiva === "porTimbrar" ? "por timbrar" : "timbrados"}...`} />;
	}

	if (isError) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error al cargar los gastos: {error instanceof Error ? error.message : "Error desconocido"}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-3 sm:p-4 lg:p-6">
			<div className="mb-4 sm:mb-6">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Timbrado de Gastos</h1>
				
				{/* Tabs para cambiar entre vistas */}
				<div className="flex gap-2 mb-4 border-b border-gray-200">
					<button
						onClick={() => setVistaActiva("porTimbrar")}
						className={`px-4 py-2 font-medium text-sm transition-colors ${
							vistaActiva === "porTimbrar"
								? "text-blue-600 border-b-2 border-blue-600"
								: "text-gray-500 hover:text-gray-700"
						}`}
					>
						Por Timbrar ({gastosPorTimbrar.length})
					</button>
					<button
						onClick={() => setVistaActiva("timbrados")}
						className={`px-4 py-2 font-medium text-sm transition-colors ${
							vistaActiva === "timbrados"
								? "text-blue-600 border-b-2 border-blue-600"
								: "text-gray-500 hover:text-gray-700"
						}`}
					>
						Timbrados ({gastosTimbrados.length})
					</button>
				</div>

				<p className="text-sm sm:text-base text-gray-600">
					Total de gastos {vistaActiva === "porTimbrar" ? "por timbrar" : "timbrados"}: {gastosActuales.length}
				</p>
			</div>

			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>

			{/* Modal de resultados del timbrado */}
			<ModalResultadoTimbrado
				abierto={mostrarModalResultados}
				resultados={resultadosTimbrado}
				onCerrar={() => {
					setMostrarModalResultados(false);
					setResultadosTimbrado([]);
				}}
			/>
		</div>
	);
}

