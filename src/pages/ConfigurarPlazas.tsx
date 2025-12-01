import { type JSX, useMemo, useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
	MRT_GlobalFilterTextField,
} from "material-react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation, useNavigate } from "react-router";
import { datosEmpleadoService } from "../services/datosEmpleadoService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import { useTituloStore } from "../services/tituloService";
import type { PlazaEmpleadoDTO, UsuarioGastosDTO } from "../types/catalogos";
import Loader from "../components/Loader";
import TableActionButton from "../components/TableActionButton";
import CustomSwitch from "../components/CustomSwitch";
import ModalConfirmacion from "../components/ModalConfirmacion";
import {
	faSitemap,
	faTrash,
	faEllipsisV,
	faDollarSign,
	faGlobe,
	faBuilding,
	faFileInvoice,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MRT_Localization_ES } from "../config/mrtLocalization";
import { Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import CustomButton from "../components/CustomButton";
import ModalAgregarPlaza from "../components/modals/ModalAgregarPlaza";
import ModalConfiguracionCentroCostos from "../components/modals/ModalConfiguracionCentroCostos";
import ModalConfiguracionCuentasContables from "../components/modals/ModalConfiguracionCuentasContables";
import ModalLimitesPersonalizados from "../components/modals/ModalLimitesPersonalizados";
import ModalLimitesExtranjeros from "../components/modals/ModalLimitesExtranjeros";

/**
 * Página para configurar plazas de un empleado
 * Muestra tabla de plazas con acciones para configurar árboles, límites, etc.
 */
export default function ConfigurarPlazas(): JSX.Element {
	const { idEmpleado } = useParams<{ idEmpleado: string }>();
	const location = useLocation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);
	const { actualizarTitulo } = useTituloStore();

	const idEmpresa = obtenerIdEmpresa();
	const empleado = (location.state as { empleado?: UsuarioGastosDTO })?.empleado;

	const [filtroTipo, setFiltroTipo] = useState<"plaza" | "division" | "sinFiltro">("sinFiltro");
	const [filtroTexto, setFiltroTexto] = useState("");
	const [plazaSeleccionada, setPlazaSeleccionada] = useState<PlazaEmpleadoDTO | null>(null);
	const [mostrarMenuAcciones, setMostrarMenuAcciones] = useState<number | null>(null);
	const [mostrarConfirmacionDesvincular, setMostrarConfirmacionDesvincular] = useState(false);
	const [mostrarModalAgregarPlaza, setMostrarModalAgregarPlaza] = useState(false);
	const [mostrarModalCentroCostos, setMostrarModalCentroCostos] = useState(false);
	const [mostrarModalCuentasContables, setMostrarModalCuentasContables] = useState(false);
	const [mostrarModalLimitesPersonalizados, setMostrarModalLimitesPersonalizados] = useState(false);
	const [mostrarModalLimitesExtranjeros, setMostrarModalLimitesExtranjeros] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRefs = useRef<Map<number, HTMLDivElement>>(new Map());
	const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);

	useEffect(() => {
		actualizarTitulo(
			empleado
				? `Configurar Plazas - ${empleado.nombre} ${empleado.apellidoPaterno}`
				: "Configurar Plazas"
		);
	}, [actualizarTitulo, empleado]);

	// Cerrar menú al hacer clic fuera o presionar Escape
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				// Verificar si el clic fue en el botón que abrió el menú
				const clickedButton = (event.target as HTMLElement).closest('[data-menu-button]');
				if (!clickedButton) {
					setMostrarMenuAcciones(null);
					setMenuPosition(null);
				}
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && mostrarMenuAcciones !== null) {
				setMostrarMenuAcciones(null);
				setMenuPosition(null);
			}
		};

		if (mostrarMenuAcciones !== null) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [mostrarMenuAcciones]);

	// Recalcular posición del menú al hacer scroll o redimensionar
	useEffect(() => {
		if (mostrarMenuAcciones !== null) {
			const recalculatePosition = () => {
				const buttonElement = buttonRefs.current.get(mostrarMenuAcciones);
				if (buttonElement) {
					const rect = buttonElement.getBoundingClientRect();
					const viewportWidth = window.innerWidth;
					const viewportHeight = window.innerHeight;
					const scrollY = window.scrollY || window.pageYOffset;
					const scrollX = window.scrollX || window.pageXOffset;
					
					const menuWidth = Math.min(256, viewportWidth - 16);
					const menuHeight = 400;
					const spacing = 8;
					
					let left = rect.right - menuWidth;
					if (rect.right - menuWidth < 8) {
						left = rect.left;
					}
					if (left + menuWidth > viewportWidth - 8) {
						left = viewportWidth - menuWidth - 8;
					}
					if (left < 8) {
						left = 8;
					}
					
					let top = rect.bottom + spacing;
					const spaceBelow = viewportHeight - rect.bottom - spacing;
					const spaceAbove = rect.top - spacing;
					
					if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
						top = rect.top - menuHeight - spacing;
					}
					
					if (top + menuHeight > viewportHeight - 8) {
						top = viewportHeight - menuHeight - 8;
					}
					if (top < 8) {
						top = 8;
					}
					
					setMenuPosition({
						top: top + scrollY,
						left: left + scrollX,
						width: menuWidth,
					});
				}
			};

			window.addEventListener("scroll", recalculatePosition, true);
			window.addEventListener("resize", recalculatePosition);

			return () => {
				window.removeEventListener("scroll", recalculatePosition, true);
				window.removeEventListener("resize", recalculatePosition);
			};
		}
	}, [mostrarMenuAcciones]);

	const {
		data: plazas = [],
		isLoading,
		isFetching,
		error,
	} = useQuery<PlazaEmpleadoDTO[]>({
		queryKey: ["plazasEmpleado", idEmpleado, idEmpresa],
		queryFn: async () => {
			if (!idEmpleado || !idEmpresa) {
				throw new Error("Faltan datos de empleado o empresa");
			}
			return await datosEmpleadoService.obtenerPaginadoPlazaEmpleadoxidEmpleado(
				Number(idEmpleado),
				idEmpresa
			);
		},
		enabled: !!idEmpleado && !!idEmpresa,
		staleTime: 1000 * 60,
		gcTime: 1000 * 60 * 10,
	});

	const editarPlazaMutation = useMutation({
		mutationFn: async (plaza: PlazaEmpleadoDTO) => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.EditarPlazaEmpleado(plaza, idEmpresa);
		},
		onSuccess: async (respuesta) => {
			if (respuesta.estatus) {
				mostrarNotificacion("Plaza actualizada exitosamente", "success");
				await queryClient.invalidateQueries({ queryKey: ["plazasEmpleado", idEmpleado, idEmpresa] });
			} else {
				mostrarNotificacion(respuesta.descripcion || "Error al actualizar la plaza", "error");
			}
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al actualizar plaza: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const desvincularPlazaMutation = useMutation({
		mutationFn: async (plaza: PlazaEmpleadoDTO) => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			const plazaActualizada = {
        ...plaza,
        nombreEmpleado: plaza.nombreEmpleado,
				borrado: true,
				estatus: 0,
				fechaBaja: new Date().toISOString(),
			};
			return await datosEmpleadoService.EditarPlazaEmpleado(plazaActualizada, idEmpresa);
		},
		onSuccess: async (respuesta) => {
			if (respuesta.estatus) {
				mostrarNotificacion("Plaza desvinculada exitosamente", "success");
				setMostrarConfirmacionDesvincular(false);
				setPlazaSeleccionada(null);
				await queryClient.invalidateQueries({ queryKey: ["plazasEmpleado", idEmpleado, idEmpresa] });
			} else {
				mostrarNotificacion(respuesta.descripcion || "Error al desvincular la plaza", "error");
			}
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al desvincular plaza: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const handleCambiarEstatus = useCallback(
		async (plaza: PlazaEmpleadoDTO) => {
			const plazaActualizada = {
				...plaza,
				estatus: plaza.estatus === 1 ? 0 : 1,
			};
			await editarPlazaMutation.mutateAsync(plazaActualizada);
		},
		[editarPlazaMutation]
	);

	const handleToggleMenu = useCallback((plazaId: number) => {
		if (mostrarMenuAcciones === plazaId) {
			setMostrarMenuAcciones(null);
			setMenuPosition(null);
		} else {
			// Calcular posición del menú de forma inteligente para que siempre esté visible
			const buttonElement = buttonRefs.current.get(plazaId);
			if (buttonElement) {
				const rect = buttonElement.getBoundingClientRect();
				const viewportWidth = window.innerWidth;
				const viewportHeight = window.innerHeight;
				const scrollY = window.scrollY || window.pageYOffset;
				const scrollX = window.scrollX || window.pageXOffset;
				
				// Dimensiones del menú (ajustadas para responsividad)
				const menuWidth = Math.min(256, viewportWidth - 16); // w-64 o ancho disponible menos padding
				const menuHeight = 400; // Altura estimada del menú (se ajustará automáticamente)
				const spacing = 8; // Espacio entre botón y menú
				
				// Calcular posición horizontal
				let left = rect.right - menuWidth; // Por defecto, alineado a la derecha del botón
				
				// Si no cabe a la derecha, alinear a la izquierda
				if (rect.right - menuWidth < 8) {
					left = rect.left;
				}
				
				// Asegurar que no se salga del viewport
				if (left + menuWidth > viewportWidth - 8) {
					left = viewportWidth - menuWidth - 8;
				}
				if (left < 8) {
					left = 8;
				}
				
				// Calcular posición vertical
				let top = rect.bottom + spacing;
				const spaceBelow = viewportHeight - rect.bottom - spacing;
				const spaceAbove = rect.top - spacing;
				
				// Si no cabe abajo, mostrar arriba
				if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
					top = rect.top - menuHeight - spacing;
				}
				
				// Asegurar que no se salga del viewport verticalmente
				if (top + menuHeight > viewportHeight - 8) {
					top = viewportHeight - menuHeight - 8;
				}
				if (top < 8) {
					top = 8;
				}
				
				// Convertir a posición absoluta con scroll
				setMenuPosition({
					top: top + scrollY,
					left: left + scrollX,
					width: menuWidth,
				});
			}
			setMostrarMenuAcciones(plazaId);
		}
	}, [mostrarMenuAcciones]);

	const handleConfigurarArbol = (plaza: PlazaEmpleadoDTO, tipo: "ejercido" | "anticipo") => {
		setPlazaSeleccionada(plaza);
		setMostrarMenuAcciones(null);
		// Navegar a la página de configuración de árbol
		navigate(`/datos-empleado/configurar-arbol/${empleado?.id}/${plaza.id}/${tipo}`, {
			state: { empleado, plaza, tipoArbol: tipo },
		});
	};

	const handleDesvincularPlaza = (plaza: PlazaEmpleadoDTO) => {
		setPlazaSeleccionada(plaza);
		setMostrarConfirmacionDesvincular(true);
		setMostrarMenuAcciones(null);
	};

	const plazasFiltradas = useMemo(() => {
		let plazasFiltradas = plazas.filter((p) => !p.borrado);

		if (filtroTipo === "sinFiltro" || !filtroTexto) {
			return plazasFiltradas;
		}

		if (filtroTipo === "plaza") {
			plazasFiltradas = plazasFiltradas.filter((p) =>
				p.nombrePlaza.toLowerCase().includes(filtroTexto.toLowerCase())
			);
		} else if (filtroTipo === "division") {
			plazasFiltradas = plazasFiltradas.filter((p) =>
				p.nombreDivision.toLowerCase().includes(filtroTexto.toLowerCase())
			);
		}

		return plazasFiltradas;
	}, [plazas, filtroTipo, filtroTexto]);

	const columns = useMemo<MRT_ColumnDef<PlazaEmpleadoDTO>[]>(
		() => [
			{
				accessorKey: "nombrePlaza",
				header: "Plaza",
				size: 200,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "nombreDivision",
				header: "División",
				size: 200,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "estatus",
				header: "Estatus",
				size: 120,
				Cell: ({ row }) => (
					<CustomSwitch
						checked={row.original.estatus === 1}
						onChange={() => handleCambiarEstatus(row.original)}
						checkedText="Activa"
						uncheckedText="Inactiva"
						disabled={editarPlazaMutation.isPending}
						className="justify-start! items-start!"
					/>
				),
				enableColumnFilter: true,
				enableSorting: true,
			},
		],
		[editarPlazaMutation.isPending, handleCambiarEstatus]
	);

	const table = useMaterialReactTable({
		columns,
		data: plazasFiltradas,
		localization: MRT_Localization_ES,
		columnFilterDisplayMode: "popover",
		initialState: {
			showGlobalFilter: true,
		},
		enableRowActions: true,
		enableColumnActions: false,
		enableSorting: true,
		enableFacetedValues: true,
		positionActionsColumn: "last",
		paginationDisplayMode: "pages",
		state: {
			showProgressBars: isLoading || isFetching,
			showSkeletons: (isLoading || isFetching) && plazasFiltradas.length === 0,
		},
		muiSearchTextFieldProps: {
			size: "small",
			variant: "outlined",
		},
		muiPaginationProps: {
			color: "primary",
			rowsPerPageOptions: [5, 10, 20],
			shape: "circular",
			variant: "outlined",
		},
		displayColumnDefOptions: {
			"mrt-row-actions": {
				header: "Acciones",
				muiTableHeadCellProps: {
					align: "center",
					sx: {
						backgroundColor: "#312E81",
						color: "#ffffff",
					},
				},
				muiTableBodyCellProps: {
					align: "center",
				},
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
		renderRowActions: ({ row }) => {
			const plaza = row.original;

			return (
				<div
					ref={(el) => {
						if (el) {
							buttonRefs.current.set(plaza.id, el);
						} else {
							buttonRefs.current.delete(plaza.id);
						}
					}}
					className="relative"
					data-menu-button
				>
					<TableActionButton
						icon={faEllipsisV}
						tooltip="Acciones"
						variant="custom"
						customClassName="bg-gray-500 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						onClick={() => handleToggleMenu(plaza.id)}
					/>
				</div>
			);
		},
		renderTopToolbar: ({ table }) => (
			<Box
				sx={{
					display: "flex",
					gap: "0.5rem",
					p: "8px",
					justifyContent: "space-between",
					flexWrap: "wrap",
				}}
			>
				<Box
					sx={{
						display: "flex",
						gap: "0.5rem",
						alignItems: "center",
						flexWrap: "wrap",
					}}
				>
					<CustomButton
						type="button"
						text="Agregar plaza"
						onClick={() => setMostrarModalAgregarPlaza(true)}
					/>
					<FormControl
						size="small"
						sx={{ minWidth: 150 }}
					>
						<InputLabel>Filtro por</InputLabel>
						<Select
							value={filtroTipo}
							label="Filtro por"
							onChange={(e) => {
								setFiltroTipo(
									e.target.value as "plaza" | "division" | "sinFiltro"
								);
								setFiltroTexto("");
							}}
						>
							<MenuItem value="sinFiltro">Sin filtro</MenuItem>
							<MenuItem value="plaza">Plaza</MenuItem>
							<MenuItem value="division">División</MenuItem>
						</Select>
					</FormControl>
					{filtroTipo !== "sinFiltro" && (
						<input
							type="text"
							placeholder={`Filtrar por ${
								filtroTipo === "plaza" ? "plaza" : "división"
							}...`}
							value={filtroTexto}
							onChange={(e) => setFiltroTexto(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					)}
				</Box>
				<Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
					<MRT_GlobalFilterTextField table={table} />
				</Box>
			</Box>
		),
	});

	if (isLoading && plazasFiltradas.length === 0) {
		return <Loader text="Cargando plazas..." />;
	}

	if (error) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error al cargar las plazas: {error instanceof Error ? error.message : "Error desconocido"}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-3 sm:p-4 lg:p-6">
			<div className="mb-4 sm:mb-6">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
					Configurar Plazas {empleado && `- ${empleado.nombre} ${empleado.apellidoPaterno}`}
				</h1>
				<p className="text-sm sm:text-base text-gray-600">
					Gestiona las plazas asignadas al empleado y configura sus parámetros
				</p>
			</div>

			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>

			{/* Modales */}
			{mostrarModalAgregarPlaza && idEmpleado && (
				<ModalAgregarPlaza
					abierto={mostrarModalAgregarPlaza}
					idEmpleado={Number(idEmpleado)}
					onClose={() => setMostrarModalAgregarPlaza(false)}
					onSuccess={async () => {
						await queryClient.invalidateQueries({ queryKey: ["plazasEmpleado", idEmpleado, idEmpresa] });
						setMostrarModalAgregarPlaza(false);
					}}
				/>
			)}

			{plazaSeleccionada && (
				<>
					<ModalConfiguracionCentroCostos
						abierto={mostrarModalCentroCostos}
						plazaEmpleado={plazaSeleccionada}
						onClose={() => {
							setMostrarModalCentroCostos(false);
							setPlazaSeleccionada(null);
						}}
						onSuccess={async () => {
							await queryClient.invalidateQueries({ queryKey: ["plazasEmpleado", idEmpleado, idEmpresa] });
						}}
					/>

					<ModalConfiguracionCuentasContables
						abierto={mostrarModalCuentasContables}
						plazaEmpleado={plazaSeleccionada}
						onClose={() => {
							setMostrarModalCuentasContables(false);
							setPlazaSeleccionada(null);
						}}
						onSuccess={async () => {
							await queryClient.invalidateQueries({ queryKey: ["plazasEmpleado", idEmpleado, idEmpresa] });
						}}
					/>

					<ModalLimitesPersonalizados
						abierto={mostrarModalLimitesPersonalizados}
						plazaEmpleado={plazaSeleccionada}
						onClose={() => {
							setMostrarModalLimitesPersonalizados(false);
							setPlazaSeleccionada(null);
						}}
						onSuccess={async () => {
							await queryClient.invalidateQueries({ queryKey: ["plazasEmpleado", idEmpleado, idEmpresa] });
						}}
					/>

					<ModalLimitesExtranjeros
						abierto={mostrarModalLimitesExtranjeros}
						plazaEmpleado={plazaSeleccionada}
						onClose={() => {
							setMostrarModalLimitesExtranjeros(false);
							setPlazaSeleccionada(null);
						}}
						onSuccess={async () => {
							await queryClient.invalidateQueries({ queryKey: ["plazasEmpleado", idEmpleado, idEmpresa] });
						}}
					/>
				</>
			)}

			<ModalConfirmacion
				abierto={mostrarConfirmacionDesvincular}
				titulo="Confirmar desvinculación"
				mensaje={`¿Está seguro de que desea desvincular la plaza "${plazaSeleccionada?.nombrePlaza}"?`}
				textoConfirmar="Desvincular"
				textoCancelar="Cancelar"
				colorConfirmar="red"
				onConfirmar={() => {
					if (plazaSeleccionada) {
						desvincularPlazaMutation.mutate(plazaSeleccionada);
					}
				}}
				onCancelar={() => {
					setMostrarConfirmacionDesvincular(false);
					setPlazaSeleccionada(null);
				}}
			/>

			{/* Menú de acciones renderizado con portal para evitar problemas de z-index */}
			{mostrarMenuAcciones !== null && menuPosition && plazasFiltradas.find((p) => p.id === mostrarMenuAcciones) && (
				<>
					{createPortal(
						<div
							ref={menuRef}
							role="menu"
							aria-label="Menú de acciones"
							className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-9999 transition-all duration-200 ease-out opacity-100 max-h-[calc(100vh-16px)] overflow-y-auto"
							style={{
								top: `${menuPosition.top}px`,
								left: `${menuPosition.left}px`,
								width: `${menuPosition.width}px`,
								maxWidth: "calc(100vw - 16px)",
								animation: "fadeInSlideDown 0.2s ease-out",
							}}
							onKeyDown={(e) => {
								if (e.key === "Escape") {
									setMostrarMenuAcciones(null);
									setMenuPosition(null);
								}
							}}
						>
							<div className="py-2">
								{/* Grupo: Configuración de árboles */}
								<div className="px-2 py-1.5">
									<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1">
										Autorización
									</p>
									<button
										role="menuitem"
										className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 focus:outline-none rounded-md transition-colors flex items-center gap-2 sm:gap-3 group"
										onClick={() => {
											const plaza = plazasFiltradas.find((p) => p.id === mostrarMenuAcciones);
											if (plaza) handleConfigurarArbol(plaza, "ejercido");
										}}
									>
										<FontAwesomeIcon
											icon={faSitemap}
											className="text-blue-500 group-hover:text-blue-600 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
											aria-hidden="true"
										/>
										<span className="truncate">Árbol de autorización ejercido</span>
									</button>
									<button
										role="menuitem"
										className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 focus:outline-none rounded-md transition-colors flex items-center gap-2 sm:gap-3 group"
										onClick={() => {
											const plaza = plazasFiltradas.find((p) => p.id === mostrarMenuAcciones);
											if (plaza) handleConfigurarArbol(plaza, "anticipo");
										}}
									>
										<FontAwesomeIcon
											icon={faSitemap}
											className="text-green-500 group-hover:text-green-600 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
											aria-hidden="true"
										/>
										<span className="truncate">Árbol de autorización anticipo</span>
									</button>
								</div>

								<div className="border-t border-gray-100 my-1" />

								{/* Grupo: Configuración financiera */}
								<div className="px-2 py-1.5">
									<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1">
										Configuración
									</p>
									<button
										role="menuitem"
										className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 focus:bg-purple-50 focus:text-purple-700 focus:outline-none rounded-md transition-colors flex items-center gap-2 sm:gap-3 group"
										onClick={() => {
											const plaza = plazasFiltradas.find((p) => p.id === mostrarMenuAcciones);
											if (plaza) {
												setPlazaSeleccionada(plaza);
												setMostrarModalCentroCostos(true);
												setMostrarMenuAcciones(null);
												setMenuPosition(null);
											}
										}}
									>
										<FontAwesomeIcon
											icon={faBuilding}
											className="text-purple-500 group-hover:text-purple-600 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
											aria-hidden="true"
										/>
										<span className="truncate">Configurar centro de costos</span>
									</button>
									<button
										role="menuitem"
										className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 focus:outline-none rounded-md transition-colors flex items-center gap-2 sm:gap-3 group"
										onClick={() => {
											const plaza = plazasFiltradas.find((p) => p.id === mostrarMenuAcciones);
											if (plaza) {
												setPlazaSeleccionada(plaza);
												setMostrarModalCuentasContables(true);
												setMostrarMenuAcciones(null);
												setMenuPosition(null);
											}
										}}
									>
										<FontAwesomeIcon
											icon={faFileInvoice}
											className="text-indigo-500 group-hover:text-indigo-600 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
											aria-hidden="true"
										/>
										<span className="truncate">Configurar cuenta contable</span>
									</button>
								</div>

								<div className="border-t border-gray-100 my-1" />

								{/* Grupo: Límites */}
								<div className="px-2 py-1.5">
									<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1">
										Límites
									</p>
									<button
										role="menuitem"
										className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 focus:bg-yellow-50 focus:text-yellow-700 focus:outline-none rounded-md transition-colors flex items-center gap-2 sm:gap-3 group"
										onClick={() => {
											const plaza = plazasFiltradas.find((p) => p.id === mostrarMenuAcciones);
											if (plaza) {
												setPlazaSeleccionada(plaza);
												setMostrarModalLimitesPersonalizados(true);
												setMostrarMenuAcciones(null);
												setMenuPosition(null);
											}
										}}
									>
										<FontAwesomeIcon
											icon={faDollarSign}
											className="text-yellow-500 group-hover:text-yellow-600 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
											aria-hidden="true"
										/>
										<span className="truncate">Agregar límites personalizados</span>
									</button>
									<button
										role="menuitem"
										className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 focus:outline-none rounded-md transition-colors flex items-center gap-2 sm:gap-3 group"
										onClick={() => {
											const plaza = plazasFiltradas.find((p) => p.id === mostrarMenuAcciones);
											if (plaza) {
												setPlazaSeleccionada(plaza);
												setMostrarModalLimitesExtranjeros(true);
												setMostrarMenuAcciones(null);
												setMenuPosition(null);
											}
										}}
									>
										<FontAwesomeIcon
											icon={faGlobe}
											className="text-orange-500 group-hover:text-orange-600 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
											aria-hidden="true"
										/>
										<span className="truncate">Editar límites extranjeros</span>
									</button>
								</div>

								<div className="border-t border-gray-100 my-1" />

								{/* Acción destructiva */}
								<div className="px-2 py-1.5">
									<button
										role="menuitem"
										className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 focus:outline-none rounded-md transition-colors flex items-center gap-2 sm:gap-3 group"
										onClick={() => {
											const plaza = plazasFiltradas.find((p) => p.id === mostrarMenuAcciones);
											if (plaza) {
												handleDesvincularPlaza(plaza);
											}
										}}
									>
										<FontAwesomeIcon
											icon={faTrash}
											className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 group-hover:text-red-700"
											aria-hidden="true"
										/>
										<span className="truncate">Desvincular plaza</span>
									</button>
								</div>
							</div>
						</div>,
						document.body
					)}
				</>
			)}
		</div>
	);
}

