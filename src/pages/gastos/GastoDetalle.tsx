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
	GastoAutorizadoDTO,
	GastoRechazadoDTO,
} from "../../types/gastos";
import { formatearMoneda } from "../../helpers/formatHelpers";
import { formatearFechaLocalizada } from "../../helpers/dateHelpers";
import TableActionButton from "../../components/TableActionButton";
import { ICONOS_ACCIONES } from "../../config/iconosAcciones";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "../../components/ActionButton";
import TablaDetalleFactura from "../../components/modals/TablaDetalleFactura";
import BotonesNavegacionGastos from "../../components/BotonesNavegacionGastos";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import ModalCargarXML from "../../components/modals/ModalCargarXML";
import ModalNoDeducible from "../../components/modals/ModalNoDeducible";
import ModalRechazarGasto from "../../components/modals/ModalRechazarGasto";
import { useQueryClient } from "@tanstack/react-query";

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
	const { obtenerIdEmpresa, esAutorizador } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore(
		(state) => state.mostrarNotificacion
	);
	const { actualizarTitulo } = useTituloStore();
	const idEmpresa = obtenerIdEmpresa();

	const [archivoSeleccionado, setArchivoSeleccionado] =
		useState<ArchivoComprobacionDTO | null>(null);
	const [modalFacturaAbierto, setModalFacturaAbierto] = useState(false);
	const [modalConfirmacionPDF, setModalConfirmacionPDF] = useState(false);
	const [modalCargarXMLAbierto, setModalCargarXMLAbierto] = useState(false);
	const [modalNoDeducibleAbierto, setModalNoDeducibleAbierto] = useState(false);
	const [modalRechazarAbierto, setModalRechazarAbierto] = useState(false);
	const [btnGuardar, setBtnGuardar] = useState(true);
	const queryClient = useQueryClient();

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
		refetch: refetchArchivos,
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

	// Función para descargar PDF detalles
	const handleDescargarPDF = useCallback(async () => {
		if (!gasto || !idEmpresa) {
			mostrarNotificacion("Error: faltan datos del gasto", "error");
			return;
		}

		try {
			mostrarNotificacion("Descargando PDF, por favor espere...", "info");
			const blob = await gastoService.descargarPDFDetalle(gasto.id, idEmpresa);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `Detalle del Gasto ${gasto.nombre}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			mostrarNotificacion("PDF descargado exitosamente", "success");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Error al descargar el PDF";
			mostrarNotificacion(errorMessage, "error");
		}
	}, [gasto, idEmpresa, mostrarNotificacion]);

	// Función para descargar justificante
	const handleDescargarJustificante = useCallback(async () => {
		if (!gasto || !idEmpresa) {
			mostrarNotificacion("Error: faltan datos del gasto", "error");
			return;
		}

		try {
			mostrarNotificacion(
				"Descargando justificante, por favor espere...",
				"info"
			);
			const { blob, filename } = await gastoService.descargarJustificante(
				gasto.id,
				idEmpresa
			);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			mostrarNotificacion("Justificante descargado exitosamente", "success");
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Error al descargar el justificante";
			mostrarNotificacion(errorMessage, "error");
		}
	}, [gasto, idEmpresa, mostrarNotificacion]);

	// Función para descargar lote de archivos
	const handleDescargarLoteArchivos = useCallback(async () => {
		if (!gasto || !idEmpresa) {
			mostrarNotificacion("Error: faltan datos del gasto", "error");
			return;
		}

		try {
			mostrarNotificacion(
				"Descargando lote de archivos, por favor espere...",
				"info"
			);
			const blob = await gastoService.descargarLoteArchivos(
				gasto.id,
				idEmpresa
			);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `Lote de archivos de comprobación del gasto ${gasto.nombre}.zip`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			mostrarNotificacion(
				"Lote de archivos descargado exitosamente",
				"success"
			);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Error al descargar el lote de archivos";
			mostrarNotificacion(errorMessage, "error");
		}
	}, [gasto, idEmpresa, mostrarNotificacion]);

	// Función para descargar lote de pagos
	const handleDescargarLotePagos = useCallback(async () => {
		if (!gasto || !idEmpresa) {
			mostrarNotificacion("Error: faltan datos del gasto", "error");
			return;
		}

		try {
			mostrarNotificacion(
				"Descargando lote de pagos, por favor espere...",
				"info"
			);
			const blob = await gastoService.descargarLotePagos(gasto.id, idEmpresa);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "Lote de archivos de comprobación del pago.zip";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			mostrarNotificacion("Lote de pagos descargado exitosamente", "success");
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Error al descargar el lote de pagos";
			mostrarNotificacion(errorMessage, "error");
		}
	}, [gasto, idEmpresa, mostrarNotificacion]);

	// Verificar si el gasto está abierto (estatus === 1)
	const statusAbiertoGasto = useMemo(
		() => gasto?.estatus === 1,
		[gasto?.estatus]
	);

	// Función para refrescar datos después de operaciones exitosas
	const handleRefreshData = useCallback(() => {
		if (gasto) {
			refetchArchivos();
			queryClient.invalidateQueries({
				queryKey: ["gastoDetalle", gasto.id, idEmpresa],
			});
			queryClient.invalidateQueries({
				queryKey: ["movimientosGasto", gasto.id, idEmpresa],
			});
		}
	}, [gasto, idEmpresa, refetchArchivos, queryClient]);

	// Función para rechazar gasto
	const handleRechazarGasto = useCallback(
		async (motivoRechazo: string) => {
			if (!gasto || !idEmpresa || !motivoRechazo) {
				mostrarNotificacion("Error: faltan datos o motivo de rechazo", "error");
				return;
			}

			try {
				setBtnGuardar(false);
				mostrarNotificacion("Rechazando gasto, por favor espere...", "info");

				// Obtener gastos autorizados previos
				const gastosAutorizados = await gastoService.obtenerGastoAutorizado(
					gasto.id,
					idEmpresa
				);

				// Crear objeto de gasto autorizado para rechazo
				const gastoAutorizado: GastoAutorizadoDTO = {
					id: 0,
					estatus: 1,
					fechaAutorizacion: new Date(),
					idAutorizador: gasto.idAutorizador,
					idGasto: gasto.id,
					nivelAutorizacion: gasto.nivelAutorizador,
					esAutorizado: false,
					numeroRechazos: 0,
					VueltaAnticipo: null,
				};

				// Calcular número de rechazos
				if (gastosAutorizados.length > 0) {
					const maxRechazos = Math.max(
						...gastosAutorizados.map((g) => g.numeroRechazos)
					);
					gastoAutorizado.numeroRechazos = maxRechazos + 1;
				} else {
					gastoAutorizado.numeroRechazos = 1;
				}

				// Rechazar el gasto
				const gastoAutoCreado = await gastoService.rechazarGasto(
					gastoAutorizado,
					idEmpresa
				);

				if (gastoAutoCreado.id > 0) {
					// Crear registro de gasto rechazado
					const gastoRechazado: GastoRechazadoDTO = {
						id: 0,
						idGastoAutorizado: gastoAutoCreado.id,
						motivo: motivoRechazo,
						fechaRechazo: new Date(),
					};

					await gastoService.crearGastoRechazado(gastoRechazado, idEmpresa);
					mostrarNotificacion("Gasto rechazado correctamente", "success");
					handleRefreshData();
					setBtnGuardar(true);
				} else {
					mostrarNotificacion("No se pudo rechazar el gasto", "error");
					setBtnGuardar(true);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Error al rechazar el gasto";
				mostrarNotificacion(errorMessage, "error");
				setBtnGuardar(true);
			}
		},
		[gasto, idEmpresa, mostrarNotificacion, handleRefreshData]
	);

	// Función para autorizar gasto
	const handleAutorizarGasto = useCallback(async () => {
		if (!gasto || !idEmpresa) {
			mostrarNotificacion("Error: faltan datos del gasto", "error");
			return;
		}

		try {
			setBtnGuardar(false);
			mostrarNotificacion("Autorizando gasto, por favor espere...", "info");

			// Obtener gastos autorizados previos
			const gastosAutorizados = await gastoService.obtenerGastoAutorizado(
				gasto.id,
				idEmpresa
			);

			// Crear objeto de gasto autorizado
			const gastoAutorizado: GastoAutorizadoDTO = {
				id: 0,
				estatus: 1,
				fechaAutorizacion: new Date(),
				idAutorizador: gasto.idAutorizador,
				idGasto: gasto.id,
				nivelAutorizacion: gasto.nivelAutorizador,
				esAutorizado: true,
				numeroRechazos: 0,
				VueltaAnticipo: null,
			};

			// Calcular número de rechazos previos
			if (gastosAutorizados.length > 0) {
				const maxRechazos = Math.max(
					...gastosAutorizados.map((g) => g.numeroRechazos)
				);
				gastoAutorizado.numeroRechazos = maxRechazos;
			}

			// Obtener información de la división para validar asiento contable
			// Por ahora, simplificamos y autorizamos directamente
			// TODO: Agregar validación de asiento contable si es necesario

			// Autorizar el gasto
			const gastoAutoCreado = await gastoService.autorizarGasto(
				gastoAutorizado,
				idEmpresa
			);

			if (gastoAutoCreado.id > 0) {
				mostrarNotificacion("Gasto autorizado exitosamente", "success");
				handleRefreshData();
			} else {
				mostrarNotificacion("No se pudo autorizar el gasto", "error");
			}
			setBtnGuardar(true);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Error al autorizar el gasto";
			mostrarNotificacion(errorMessage, "error");
			setBtnGuardar(true);
		}
	}, [gasto, idEmpresa, mostrarNotificacion, handleRefreshData]);

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
	const datosTabla = useMemo(
		() => archivosComprobacion || [],
		[archivosComprobacion]
	);

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
			<div className="p-3 sm:p-4 lg:p-6">
				<BotonesNavegacionGastos />
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error al cargar el gasto. Por favor, intente nuevamente.
					</p>
					<button
						onClick={() => navigate(-1)}
						className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
					>
						Regresar
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-3 sm:p-4 lg:p-6">
			{/* Botones de navegación siempre visibles */}
			<BotonesNavegacionGastos />

			{/* Título */}
			<div className="mb-4 sm:mb-6">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
					Gasto: {gasto.nombre}
				</h1>
			</div>

			{/* Tarjetas de información */}
			<div className="mb-6">
				{/* Primera fila: 5 tarjetas */}
				<div className="grid grid-cols-1 md:grid-cols-5">
					{/* Tarjeta: Nombre del gasto */}
					<div className="bg-[#082F49] text-white p-4 md:rounded-tl-xl border border-[#B9B9B9C2]">
						<p className="text-center text-base font-bold mb-2">
							Nombre del gasto
						</p>
						<p className="text-center text-base">{gasto.nombre}</p>
					</div>

					{/* Tarjeta: Motivo del gasto */}
					<div className="bg-[#082F49] text-white p-4 rounded-lg md:rounded-none border border-[#B9B9B9C2]">
						<p className="text-center text-base font-bold mb-2">
							Motivo del gasto
						</p>
						<p className="text-center text-base">{gasto.descripcion || "-"}</p>
					</div>

					{/* Tarjeta: Presupuesto */}
					<div className="bg-[#082F49] text-white p-4 rounded-lg md:rounded-none border border-[#B9B9B9C2]">
						<p className="text-center text-base font-bold mb-2">
							Presupuesto: MXN
						</p>
						<p className="text-center text-base">
							{formatearMoneda(gasto.presupuesto)}
						</p>
					</div>

					{/* Tarjeta: Fecha de inicio */}
					<div className="bg-[#082F49] text-white p-4 rounded-lg md:rounded-none border border-[#B9B9B9C2]">
						<p className="text-center text-base font-bold mb-2">
							Fecha de inicio
						</p>
						<p className="text-center text-base">
							{formatearFechaLocalizada(gasto.fechaInicio)}
						</p>
					</div>

					{/* Tarjeta: Estado de la autorización */}
					{gasto.nivelMaximo && gasto.estatus !== 1 && gasto.estatus !== 5 ? (
						<div className="bg-[#082F49] text-white p-4 rounded-lg md:rounded-tr-xl border border-[#B9B9B9C2]">
							<p className="text-center text-base font-bold mb-2">
								Estado de la autorización
							</p>
							<p className="text-center text-base">
								Ciclo de autorización completado
							</p>
						</div>
					) : (
						<div className="bg-[#082F49] text-white p-4 md:rounded-tr-xl border border-[#B9B9B9C2]">
							<p className="text-center text-base font-bold mb-2">
								Estado de la autorización
							</p>
							<p className="text-center text-base">-</p>
						</div>
					)}
				</div>

				{/* Segunda fila: 4 tarjetas */}
				<div className="grid grid-cols-1 md:grid-cols-4">
					{/* Tarjeta: Fecha de término */}
					<div className="bg-[#082F49] text-white p-4 border border-[#B9B9B9C2]">
						<p className="text-center text-base font-bold mb-2">
							Fecha de término
						</p>
						<p className="text-center text-base">
							{gasto.fechaFin ? formatearFechaLocalizada(gasto.fechaFin) : "-"}
						</p>
					</div>

					{/* Tarjeta: Autorizado por */}
					{gasto.autorizador &&
					gasto.estatus !== 1 &&
					gasto.siguienteAutorizador &&
					gasto.estatus !== 5 ? (
						<div className="bg-[#082F49] text-white p-4 border border-[#B9B9B9C2]">
							<p className="text-center text-base font-bold mb-2">
								Autorizado por:
							</p>
							<p className="text-center text-base">{gasto.autorizador}</p>
						</div>
					) : (
						<div className="bg-[#082F49] text-white p-4 border border-[#B9B9B9C2]">
							<p className="text-center text-base font-bold mb-2">
								Autorizado por:
							</p>
							<p className="text-center text-base">-</p>
						</div>
					)}

					{/* Tarjeta: Tipo */}
					<div className="bg-[#082F49] text-white p-4 border border-[#B9B9B9C2]">
						<p className="text-center text-base font-bold mb-2">Tipo</p>
						<p className="text-center text-base">
							{obtenerTextoTipo(gasto.esAnticipo)}
						</p>
					</div>

					{/* Tarjeta: Estatus */}
					<div className="bg-[#082F49] text-white p-4 border border-[#B9B9B9C2]">
						<p className="text-center text-base font-bold mb-2">Estatus</p>
						<p className="text-center text-base">
							{obtenerTextoEstatus(gasto.estatus)}
						</p>
					</div>
				</div>
			</div>

			{/* Tabla de estado de comprobación */}
			<div className="mb-6">
				<div className="bg-[#bae6fd] p-4 rounded-t-lg">
					<h3 className="text-center text-base font-bold text-black">
						Estado de comprobación
					</h3>
				</div>
				<div className="grid grid-cols-4 gap-4 bg-[#082F49] text-white p-4 rounded-b-lg">
					<div>
						<p className="text-center text-base font-bold mb-1">Comprobado</p>
						<p className="text-center text-base">
							{formatearMoneda(totales.comprobado)}
						</p>
					</div>
					<div>
						<p className="text-center text-base font-bold mb-1">Aceptado</p>
						<p className="text-center text-base">
							{formatearMoneda(totales.aceptado)}
						</p>
					</div>
					<div>
						<p className="text-center text-base font-bold mb-1">Abonado</p>
						<p className="text-center text-base">
							{formatearMoneda(totales.abonado)}
						</p>
					</div>
					<div>
						<p className="text-center text-base font-bold mb-1">Presupuesto</p>
						<p className="text-center text-base">
							{formatearMoneda(totales.presupuesto)}
						</p>
					</div>
				</div>
			</div>

			{/* Botones de acción */}
			{gasto && (
				<div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{/* Descargar PDF detalles - siempre visible */}
					<ActionButton
						icon={faDollarSign}
						text="Descargar PDF detalles"
						variant="primary"
						onClick={() => setModalConfirmacionPDF(true)}
						className="bg-[#0284C7] hover:bg-[#075985] text-white"
					/>

					{/* Descargar justificante - condicionado */}
					{gasto.idArchivoJustificante !== null && (
						<ActionButton
							icon={faDollarSign}
							text="Descargar justificante"
							variant="primary"
							onClick={handleDescargarJustificante}
							className="bg-[#0284C7] hover:bg-[#075985] text-white"
						/>
					)}

					{/* Descargar lote de archivos - condicionado */}
					{archivosComprobacion && archivosComprobacion.length > 0 && (
						<ActionButton
							icon={faDollarSign}
							text="Descargar lote de Archivos"
							variant="primary"
							onClick={handleDescargarLoteArchivos}
							className="bg-[#0284C7] hover:bg-[#075985] text-white"
						/>
					)}

					{/* Descargar lote de comprobación - condicionado */}
					
					<ActionButton
						icon={faDollarSign}
						text="Descargar lote de comprobación"
						variant="primary"
						onClick={handleDescargarLotePagos}
						className="bg-[#0284C7] hover:bg-[#075985] text-white"
					/>

					{/* Cargar facturas - condicionado */}
					{statusAbiertoGasto && esAutorizador !== true && (
						<ActionButton
							icon={faDollarSign}
							text="Cargar facturas"
							variant="primary"
							onClick={() => setModalCargarXMLAbierto(true)}
							className="bg-[#0284C7] hover:bg-[#075985] text-white"
						/>
					)}

					{/* Comprobante sin factura - condicionado */}
					{statusAbiertoGasto && esAutorizador !== true && (
						<ActionButton
							icon={faDollarSign}
							text="Comprobante sin factura"
							variant="primary"
							onClick={() => setModalNoDeducibleAbierto(true)}
							className="bg-[#0284C7] hover:bg-[#075985] text-white"
						/>
					)}

					{/* Rechazar gasto - condicionado */}
					{btnGuardar &&
						gasto.tieneDevolucion !== true &&
						esAutorizador === true && (
							<ActionButton
								icon={faDollarSign}
								text="Rechazar gasto"
								variant="primary"
								onClick={() => setModalRechazarAbierto(true)}
								className="bg-rose-400 hover:bg-rose-500 text-white"
							/>
						)}

					{/* Autorizar gasto - condicionado */}
					{btnGuardar && esAutorizador === true && (
						<ActionButton
							icon={faDollarSign}
							text="Autorizar gasto"
							variant="primary"
							onClick={handleAutorizarGasto}
							className="bg-green-500 hover:bg-green-600 text-white"
						/>
					)}
				</div>
			)}

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

			{/* Modal de confirmación para descargar PDF */}
			<ModalConfirmacion
				abierto={modalConfirmacionPDF}
				titulo="Confirmar descarga"
				mensaje="¿Desea descargar el PDF con los detalles del gasto?"
				textoConfirmar="Descargar"
				textoCancelar="Cancelar"
				colorConfirmar="blue"
				onConfirmar={() => {
					setModalConfirmacionPDF(false);
					handleDescargarPDF();
				}}
				onCancelar={() => setModalConfirmacionPDF(false)}
			/>

			{/* Modal para cargar XML */}
			{gasto && (
				<ModalCargarXML
					abierto={modalCargarXMLAbierto}
					idGasto={gasto.id}
					idDivision={gasto.idDivision}
					idPlazaEmpleado={gasto.idPlazaEmpleado}
					idCentroCosto={gasto.idCentroCosto}
					onClose={() => setModalCargarXMLAbierto(false)}
					onSuccess={handleRefreshData}
				/>
			)}

			{/* Modal para agregar no deducibles */}
			{gasto && (
				<ModalNoDeducible
					abierto={modalNoDeducibleAbierto}
					idGasto={gasto.id}
					idPlazaEmpleado={gasto.idPlazaEmpleado}
					idCentroCosto={gasto.idCentroCosto}
					onClose={() => setModalNoDeducibleAbierto(false)}
					onSuccess={handleRefreshData}
				/>
			)}

			{/* Modal para rechazar gasto */}
			{gasto && (
				<ModalRechazarGasto
					abierto={modalRechazarAbierto}
					nombreGasto={gasto.nombre}
					onClose={() => setModalRechazarAbierto(false)}
					onConfirmar={(motivo) => {
						setModalRechazarAbierto(false);
						handleRechazarGasto(motivo);
					}}
				/>
			)}
		</div>
	);
}

