import { type JSX, useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { gastoService } from "../../services/gastoService";
import { useAuthStore } from "../../store/authStore";
import { useNotificacionStore } from "../../store/notificacionStore";
import { useTituloStore } from "../../services/tituloService";
import Loader from "../../components/Loader";
import { MRT_Localization_ES } from "../../config/mrtLocalization";
import type {
	ArchivoComprobacionDTO,
} from "../../types/gastos";
import { formatearMoneda } from "../../helpers/formatHelpers";
import { formatearFechaLocalizada } from "../../helpers/dateHelpers";
import TableActionButton from "../../components/TableActionButton";
import { ICONOS_ACCIONES } from "../../config/iconosAcciones";
import { ROUTES } from "../../config/routes.config";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "../../components/ActionButton";
import TablaDetalleFactura from "../../components/modals/TablaDetalleFactura";

// Mapa de estatus - constante fuera del componente para evitar recreación
const ESTATUS_MAP: Record<number, string> = {
	1: "Abierto",
	2: "Finalizado",
	3: "Autorizado",
	4: "No Autorizado",
	5: "Pendiente de Pago",
	6: "Pagado",
	7: "En proceso de Autorización",
	8: "En devolución",
	9: "Cancelado",
};

/**
 * Componente que muestra el detalle completo de un gasto
 * Similar a view-gastos.component.html del proyecto Angular
 */
export default function GastoDetalle(): JSX.Element {
	const { gastoId } = useParams<{ gastoId: string }>();
	const navigate = useNavigate();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore(
		(state) => state.mostrarNotificacion
	);
	const { actualizarTitulo } = useTituloStore();
	const idEmpresa = obtenerIdEmpresa();

	const [archivoSeleccionado, setArchivoSeleccionado] =
		useState<ArchivoComprobacionDTO | null>(null);
	const [modalFacturaAbierto, setModalFacturaAbierto] = useState(false);

	// Callbacks memoizados para manejar eventos
	const handleVerFactura = useCallback((archivo: ArchivoComprobacionDTO) => {
		setArchivoSeleccionado(archivo);
		setModalFacturaAbierto(true);
	}, []);

	const handleCerrarModal = useCallback(() => {
		setModalFacturaAbierto(false);
		setArchivoSeleccionado(null);
	}, []);

	// Actualizar título al montar
	useEffect(() => {
		actualizarTitulo("Ver gasto");
	}, [actualizarTitulo]);

	// Obtener el gasto
	const {
		data: gasto,
		isLoading: isLoadingGasto,
		isError: isErrorGasto,
		error: errorGasto,
	} = useQuery({
		queryKey: ["gastoDetalle", gastoId, idEmpresa],
		queryFn: async () => {
			if (!gastoId || !idEmpresa) {
				throw new Error("Faltan datos de gasto o empresa");
			}
			return await gastoService.obtenerGastoXId(
				parseInt(gastoId, 10),
				idEmpresa
			);
		},
		enabled: !!gastoId && !!idEmpresa,
		staleTime: 1000 * 60 * 5, // 5 minutos
		gcTime: 1000 * 60 * 10, // 10 minutos
	});

	// Obtener archivos de comprobación
	const {
		data: archivosComprobacion,
		isLoading: isLoadingArchivos,
		isError: isErrorArchivos,
		error: errorArchivos,
	} = useQuery({
		queryKey: [
			"archivosComprobacion",
			gasto?.id,
			gasto?.idPlazaEmpleado,
			idEmpresa,
		],
		queryFn: async () => {
			if (!gasto || !idEmpresa) {
				throw new Error("Faltan datos de gasto o empresa");
			}
			return await gastoService.obtenerArchivoComprobacion(
				gasto.id,
				gasto.idPlazaEmpleado,
				idEmpresa
			);
		},
		enabled: !!gasto && !!idEmpresa,
		staleTime: 1000 * 60 * 5, // 5 minutos
		gcTime: 1000 * 60 * 10, // 10 minutos
	});

	// Calcular totales
	const totales = useMemo(() => {
		if (!archivosComprobacion || archivosComprobacion.length === 0) {
			return {
				comprobado: 0,
				aceptado: 0,
				abonado: 0,
				presupuesto: gasto?.presupuesto || 0,
			};
		}

		const comprobado = archivosComprobacion.reduce(
			(acc, archivo) => acc + (archivo.total || 0),
			0
		);
		const aceptado = archivosComprobacion.reduce(
			(acc, archivo) => acc + (archivo.totalAceptado || 0),
			0
		);
		const abonado = gasto?.abono || 0;
		const presupuesto = gasto?.presupuesto || 0;

		return { comprobado, aceptado, abonado, presupuesto };
	}, [archivosComprobacion, gasto]);

	// Función para obtener el texto del estatus - función simple sin memoizar ya que ESTATUS_MAP es constante
	const obtenerTextoEstatus = (estatus: number): string => {
		return ESTATUS_MAP[estatus] || "Desconocido";
	};

	// Función para obtener el texto del tipo - función simple
	const obtenerTextoTipo = (esAnticipo: boolean): string => {
		return esAnticipo ? "Anticipo" : "Ejercido";
	};

	// Definir columnas para la tabla de archivos
	const columns = useMemo<MRT_ColumnDef<ArchivoComprobacionDTO>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Ver factura",
				size: 120,
				Cell: ({ row }) => (
					<div className="flex justify-center">
						<TableActionButton
							iconSrc={ICONOS_ACCIONES.ver}
							onClick={() => handleVerFactura(row.original)}
							tooltip="Ver elementos de la factura"
							variant="ver"
						/>
					</div>
				),
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
				accessorKey: "fechaValidacion",
				header: "Fecha",
				size: 120,
				Cell: ({ cell }) => {
					const fecha = cell.getValue<Date | string | null>();
					return formatearFechaLocalizada(fecha);
				},
			},
			{
				accessorKey: "folio",
				header: "Folio",
				size: 120,
			},
			{
				accessorKey: "subtotal",
				header: "Importe",
				size: 120,
				Cell: ({ cell }) => {
					const valor = cell.getValue<number>();
					return formatearMoneda(valor);
				},
			},
			{
				accessorKey: "total",
				header: "Total",
				size: 120,
				Cell: ({ cell }) => {
					const valor = cell.getValue<number>();
					return formatearMoneda(valor);
				},
			},
			{
				accessorKey: "totalAceptado",
				header: "Aceptado",
				size: 120,
				Cell: ({ cell }) => {
					const valor = cell.getValue<number>();
					return formatearMoneda(valor);
				},
			},
			{
				accessorKey: "rfcEmisor",
				header: "RFC Proveedor",
				size: 150,
			},
			{
				accessorKey: "nombreCentro",
				header: "C.C",
				size: 150,
			},
			{
				accessorKey: "fechaEmision",
				header: "Fecha consumo",
				size: 120,
				Cell: ({ cell }) => {
					const fecha = cell.getValue<Date | string | null>();
					return formatearFechaLocalizada(fecha);
				},
			},
		],
		[handleVerFactura]
	);

	// Datos memoizados para la tabla
	const datosTabla = useMemo(() => archivosComprobacion || [], [archivosComprobacion]);

	// Configurar la tabla
	const table = useMaterialReactTable({
		columns,
		data: datosTabla,
		enableColumnFilters: true,
		enableGlobalFilter: true,
		enablePagination: true,
		enableSorting: true,
		enableRowSelection: false,
		enableDensityToggle: false,
		enableFullScreenToggle: false,
		enableColumnResizing: false,
		initialState: {
			pagination: { pageSize: 10, pageIndex: 0 },
			showGlobalFilter: true,
			density: "comfortable",
		},
		autoResetPageIndex: false,
		localization: MRT_Localization_ES,
		muiTableContainerProps: {
			sx: {
				maxHeight: "600px",
			},
		},
		muiTableHeadCellProps: {
			sx: {
				backgroundColor: "#bae6fd",
				color: "#082F49",
				fontWeight: "bold",
			},
		},
		muiTableBodyCellProps: {
			sx: {
				backgroundColor: "#082F49",
				color: "#ffffff",
			},
		},
		muiTableBodyRowProps: {
			sx: {
				"&:hover": {
					backgroundColor: "#075985",
				},
			},
		},
		enableStickyHeader: false,
	});

	if (isLoadingGasto || isLoadingArchivos) {
		return <Loader text="Cargando detalles del gasto..." />;
	}

	if (isErrorGasto || isErrorArchivos || !gasto) {
		const errorMessage =
			errorGasto instanceof Error
				? errorGasto.message
				: errorArchivos instanceof Error
				? errorArchivos.message
				: "Error al cargar el gasto";
		mostrarNotificacion(errorMessage, "error");
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error al cargar el gasto. Por favor, intente nuevamente.
					</p>
					<button
						onClick={() => navigate(ROUTES.GASTOS_MIS_GASTOS)}
						className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
					>
						Regresar
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center overflow-auto p-4">
			<div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-[1400px] h-[90vh] overflow-auto relative">
				{/* Botón cerrar */}
				<button
					type="button"
					onClick={() => navigate(ROUTES.GASTOS_MIS_GASTOS)}
					className="absolute top-0 right-0 px-8 py-3 text-2xl text-gray-600 hover:text-gray-800"
				>
					<span className="text-5xl">&times;</span>
				</button>

				{/* Título */}
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-gray-800">Ver gasto</h2>
				</div>

				{/* Tarjetas de información */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
					{/* Tarjeta: Nombre del gasto */}
					<div className="bg-[#082F49] text-white p-4 rounded-lg">
						<p className="text-sm font-semibold mb-2">Nombre del gasto</p>
						<p className="text-lg">{gasto.nombre}</p>
					</div>

					{/* Tarjeta: Motivo del gasto */}
					<div className="bg-[#082F49] text-white p-4 rounded-lg">
						<p className="text-sm font-semibold mb-2">Motivo del gasto</p>
						<p className="text-lg">{gasto.descripcion || "-"}</p>
					</div>

					{/* Tarjeta: Presupuesto */}
					<div className="bg-[#082F49] text-white p-4 rounded-lg">
						<p className="text-sm font-semibold mb-2">Presupuesto: MXN</p>
						<p className="text-lg">{formatearMoneda(gasto.presupuesto)}</p>
					</div>

					{/* Tarjeta: Fecha de inicio */}
					<div className="bg-[#082F49] text-white p-4 rounded-lg">
						<p className="text-sm font-semibold mb-2">Fecha de inicio</p>
						<p className="text-lg">
							{formatearFechaLocalizada(gasto.fechaInicio)}
						</p>
					</div>

					{/* Tarjeta: Fecha de término */}
					<div className="bg-[#082F49] text-white p-4 rounded-lg">
						<p className="text-sm font-semibold mb-2">Fecha de término</p>
						<p className="text-lg">
							{gasto.fechaFin
								? formatearFechaLocalizada(gasto.fechaFin)
								: "-"}
						</p>
					</div>

					{/* Tarjeta: Estado de la autorización */}
					{gasto.nivelMaximo && gasto.estatus !== 1 && gasto.estatus !== 5 && (
						<div className="bg-[#082F49] text-white p-4 rounded-lg">
							<p className="text-sm font-semibold mb-2">
								Estado de la autorización
							</p>
							<p className="text-lg">Ciclo de autorización completado</p>
						</div>
					)}

					{/* Tarjeta: Autorizado por */}
					{gasto.autorizador &&
						gasto.estatus !== 1 &&
						gasto.siguienteAutorizador &&
						gasto.estatus !== 5 && (
							<div className="bg-[#082F49] text-white p-4 rounded-lg">
								<p className="text-sm font-semibold mb-2">Autorizado por:</p>
								<p className="text-lg">{gasto.autorizador}</p>
							</div>
						)}

					{/* Tarjeta: Tipo */}
					<div className="bg-[#082F49] text-white p-4 rounded-lg">
						<p className="text-sm font-semibold mb-2">Tipo</p>
						<p className="text-lg">{obtenerTextoTipo(gasto.esAnticipo)}</p>
					</div>

					{/* Tarjeta: Estatus */}
					<div className="bg-[#082F49] text-white p-4 rounded-lg">
						<p className="text-sm font-semibold mb-2">Estatus</p>
						<p className="text-lg">{obtenerTextoEstatus(gasto.estatus)}</p>
					</div>
				</div>

				{/* Tabla de estado de comprobación */}
				<div className="mb-6">
					<div className="bg-[#bae6fd] p-4 rounded-t-lg">
						<h3 className="text-lg font-semibold text-[#082F49]">
							Estado de comprobación
						</h3>
					</div>
					<div className="grid grid-cols-4 gap-4 bg-[#082F49] text-white p-4 rounded-b-lg">
						<div>
							<p className="text-sm font-semibold mb-1">Comprobado</p>
							<p className="text-lg">{formatearMoneda(totales.comprobado)}</p>
						</div>
						<div>
							<p className="text-sm font-semibold mb-1">Aceptado</p>
							<p className="text-lg">{formatearMoneda(totales.aceptado)}</p>
						</div>
						<div>
							<p className="text-sm font-semibold mb-1">Abonado</p>
							<p className="text-lg">{formatearMoneda(totales.abonado)}</p>
						</div>
						<div>
							<p className="text-sm font-semibold mb-1">Presupuesto</p>
							<p className="text-lg">{formatearMoneda(totales.presupuesto)}</p>
						</div>
					</div>
				</div>

				{/* Botones de acción */}
				<div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<ActionButton
						icon={faDollarSign}
						text="Descargar PDF detalles"
						variant="primary"
						onClick={() => {
							// TODO: Implementar descarga de PDF
							mostrarNotificacion("Funcionalidad en desarrollo", "info");
						}}
						className="bg-[#0284C7] hover:bg-[#075985] text-white"
					/>
					<ActionButton
						icon={faDollarSign}
						text="Descargar lote archivos"
						variant="primary"
						onClick={() => {
							// TODO: Implementar descarga de lote
							mostrarNotificacion("Funcionalidad en desarrollo", "info");
						}}
						className="bg-[#0284C7] hover:bg-[#075985] text-white"
					/>
					<ActionButton
						icon={faDollarSign}
						text="Cargar facturas"
						variant="primary"
						onClick={() => {
							// TODO: Implementar carga de facturas
							mostrarNotificacion("Funcionalidad en desarrollo", "info");
						}}
						className="bg-[#0284C7] hover:bg-[#075985] text-white"
					/>
					<ActionButton
						icon={faDollarSign}
						text="Comprobante sin factura"
						variant="primary"
						onClick={() => {
							// TODO: Implementar comprobante sin factura
							mostrarNotificacion("Funcionalidad en desarrollo", "info");
						}}
						className="bg-[#0284C7] hover:bg-[#075985] text-white"
					/>
				</div>

				{/* Tabla de archivos de comprobación */}
				<div className="bg-white rounded-lg shadow overflow-x-auto">
					<MaterialReactTable table={table} />
				</div>

				{/* Modal de detalle de factura - renderizado condicional optimizado */}
				{modalFacturaAbierto && archivoSeleccionado && (
					<TablaDetalleFactura
						archivo={archivoSeleccionado}
						onClose={handleCerrarModal}
					/>
				)}
			</div>
		</div>
	);
}

