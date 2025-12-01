import { type JSX, useMemo, useEffect, useState, useCallback } from "react";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { usePolizas } from "../hooks/usePolizas";
import Loader from "../components/Loader";
import type { GastoDTO, PolizaGastosDTO, PolizaDetalleGastosDTO } from "../types/gastos";
import { MRT_Localization_ES } from "../config/mrtLocalization";
import { useTituloStore } from "../services/tituloService";
import ModalDetallePoliza from "../components/modals/ModalDetallePoliza";
import TableActionButton from "../components/TableActionButton";
import { faPlus, faEye } from "@fortawesome/free-solid-svg-icons";
import { useNotificacionStore } from "../store/notificacionStore";
import { formatearFechaLocalizada } from "../helpers/dateHelpers";
import { formatearMoneda } from "../helpers/formatHelpers";

/**
 * Componente de gestión de Pólizas de Gastos
 * Permite crear, editar, ver y eliminar pólizas
 *
 * @returns {JSX.Element} El componente de gestión de pólizas
 */
export default function Polizas(): JSX.Element {
	const {
		gastos,
		isLoading,
		isError,
		error,
		crearPoliza,
		obtenerPolizaxidGastoYTipoPoliza,
		obtenerDetallePolizasxidPoliza,
	} = usePolizas();
	const { actualizarTitulo } = useTituloStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);

	const [polizaDetalleAbierta, setPolizaDetalleAbierta] = useState(false);
	const [polizaSeleccionada, setPolizaSeleccionada] = useState<PolizaGastosDTO | null>(null);
	const [detallesPoliza, setDetallesPoliza] = useState<PolizaDetalleGastosDTO[]>([]);
	const [cargandoDetalles, setCargandoDetalles] = useState(false);

	useEffect(() => {
		actualizarTitulo("Pólizas de Gastos");
	}, [actualizarTitulo]);

	// Función para manejar la creación de póliza
	const handleCrearPoliza = useCallback(
		async (idGasto: number, tipoPoliza: number) => {
			try {
				await crearPoliza.mutateAsync({
					idGasto,
					tipoPoliza,
				});
			} catch {
				// El error ya se maneja en onError del mutation
			}
		},
		[crearPoliza]
	);

	// Función para abrir el modal de detalles de póliza
	const handleAbrirDetallePoliza = useCallback(
		async (idGasto: number, tipoPoliza: number) => {
			setCargandoDetalles(true);
			setPolizaDetalleAbierta(true);

			try {
				const poliza = await obtenerPolizaxidGastoYTipoPoliza(idGasto, tipoPoliza);
				setPolizaSeleccionada(poliza);

				const detalles = await obtenerDetallePolizasxidPoliza(poliza.id);
				setDetallesPoliza(detalles);
			} catch (error) {
				console.error("Error al obtener los detalles de la póliza:", error);
				mostrarNotificacion("Error al obtener los detalles de la póliza", "error");
				setPolizaDetalleAbierta(false);
			} finally {
				setCargandoDetalles(false);
			}
		},
		[obtenerPolizaxidGastoYTipoPoliza, obtenerDetallePolizasxidPoliza, mostrarNotificacion]
	);

	// Función para cerrar el modal de detalles
	const handleCerrarDetallePoliza = useCallback(() => {
		setPolizaDetalleAbierta(false);
		setPolizaSeleccionada(null);
		setDetallesPoliza([]);
	}, []);

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
				accessorKey: "esAnticipo",
				header: "Tipo de gasto",
				size: 100,
				Cell: ({ cell }) => {
					const esAnticipo = cell.getValue<boolean | null>();
					return (
						<span
							className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
								esAnticipo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
							}`}
						>
							{esAnticipo ? "Anticipo" : "Ejercido"}
						</span>
					);
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

	const table = useMaterialReactTable({
		columns,
		data: gastos,
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
		state: {
			isLoading: isLoading,
			showProgressBars: isLoading || crearPoliza.isPending,
		},
		renderRowActions: ({ row }) => {
			const gasto = row.original;
			const estaCreando = crearPoliza.isPending;

			// Tipos de póliza: 1 = Ingreso, 2 = Egreso, 3 = Diario
			const tiposPoliza = [
				{
					id: 1,
					nombre: "Ingreso",
					tienePoliza: gasto.tienePolizaIngreso,
					colorCrear: "bg-green-500 hover:bg-green-600",
					colorVer: "bg-green-600 hover:bg-green-700",
				},
				{
					id: 2,
					nombre: "Egreso",
					tienePoliza: gasto.tienePolizaEgreso,
					colorCrear: "bg-red-500 hover:bg-red-600",
					colorVer: "bg-red-600 hover:bg-red-700",
				},
				{
					id: 3,
					nombre: "Diario",
					tienePoliza: gasto.tienePolizaDiario,
					colorCrear: "bg-blue-500 hover:bg-blue-600",
					colorVer: "bg-blue-600 hover:bg-blue-700",
				},
			];

			return (
				<div className="flex items-center justify-center gap-2">
					{tiposPoliza.map((tipo) => (
						<div key={tipo.id}>
							{/* Botón para crear póliza si no existe */}
							{!tipo.tienePoliza && (
								<TableActionButton
									icon={faPlus}
									onClick={() => handleCrearPoliza(gasto.id, tipo.id)}
									tooltip={`Crear póliza ${tipo.nombre}`}
									variant="custom"
									customClassName={`${tipo.colorCrear} text-white`}
									disabled={estaCreando}
								/>
							)}

							{/* Botón para ver póliza si existe */}
							{tipo.tienePoliza && (
								<TableActionButton
									icon={faEye}
									onClick={() => handleAbrirDetallePoliza(gasto.id, tipo.id)}
									tooltip={`Ver póliza ${tipo.nombre}`}
									variant="custom"
									customClassName={`${tipo.colorVer} text-white`}
									disabled={cargandoDetalles}
								/>
							)}
						</div>
					))}
				</div>
			);
		},
	});

	if (isLoading && gastos.length === 0) {
		return <Loader text="Cargando gastos para pólizas..." />;
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
			<div className="mb-4 sm:mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Gastos para crear pólizas</h1>
					<p className="text-sm sm:text-base text-gray-600">
						Total de gastos: {gastos.length}
					</p>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>

			{/* Modal de detalles de póliza */}
			<ModalDetallePoliza
				abierto={polizaDetalleAbierta}
				poliza={polizaSeleccionada}
				detalles={detallesPoliza}
				cargandoDetalles={cargandoDetalles}
				onClose={handleCerrarDetallePoliza}
			/>
		</div>
	);
}

