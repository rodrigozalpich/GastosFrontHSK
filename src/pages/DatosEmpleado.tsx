import { type JSX, useMemo, useEffect, useState } from "react";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
	MRT_GlobalFilterTextField,
} from "material-react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { datosEmpleadoService } from "../services/datosEmpleadoService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import { useTituloStore } from "../services/tituloService";
import type { UsuarioGastosDTO, DatosEmpleadoDTO } from "../types/catalogos";
import Loader from "../components/Loader";
import TableActionButton from "../components/TableActionButton";
import CustomSwitch from "../components/CustomSwitch";
import { faEdit, faUserPen } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";
import { MRT_Localization_ES } from "../config/mrtLocalization";
import { formatearFechaLocalizada } from "../helpers/dateHelpers";
import ModalEditarEmpleado from "../components/modals/ModalEditarEmpleado";
import { Box } from "@mui/material";

/**
 * Página principal para gestionar datos de empleados
 * Muestra una tabla con todos los empleados y permite editar y configurar plazas
 */
export default function DatosEmpleado(): JSX.Element {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);
	const { actualizarTitulo } = useTituloStore();

	const idEmpresa = obtenerIdEmpresa();
	const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioGastosDTO | null>(null);
	const [mostrarModalEditar, setMostrarModalEditar] = useState(false);

	useEffect(() => {
		actualizarTitulo("Datos para el Empleado");
	}, [actualizarTitulo]);

	const {
		data: empleados = [],
		isLoading,
		isFetching,
		error,
	} = useQuery<UsuarioGastosDTO[]>({
		queryKey: ["empleadosGastos", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await datosEmpleadoService.obtenerEmpleadosGastos(idEmpresa);
		},
		enabled: !!idEmpresa,
		staleTime: 1000 * 60,
		gcTime: 1000 * 60 * 10,
	});

	const editarEmpleadoMutation = useMutation({
		mutationFn: async (empleado: UsuarioGastosDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			// Convertir UsuarioGastosDTO a DatosEmpleadoDTO para la edición
			const datosEmpleado: DatosEmpleadoDTO = {
				...empleado,
			} as DatosEmpleadoDTO;
			return await datosEmpleadoService.editarEmpleado(datosEmpleado, idEmpresa);
		},
		onSuccess: async () => {
				mostrarNotificacion("Empleado actualizado exitosamente", "success");
				await queryClient.invalidateQueries({ queryKey: ["empleadosGastos", idEmpresa] });
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al actualizar empleado: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const handleCambiarEstatus = async (empleado: UsuarioGastosDTO) => {
		const empleadoActualizado = {
			...empleado,
			estatus: empleado.estatus === 1 ? 0 : 1,
		};

		try {
			await editarEmpleadoMutation.mutateAsync(empleadoActualizado);
		} catch (error) {
			console.error("Error al cambiar el estatus del empleado:", error);
		}
	};

	const handleAbrirEditar = (empleado: UsuarioGastosDTO) => {
		setUsuarioSeleccionado(empleado);
		setMostrarModalEditar(true);
	};

	const handleCerrarEditar = () => {
		setMostrarModalEditar(false);
		setUsuarioSeleccionado(null);
	};

	const columns = useMemo<MRT_ColumnDef<UsuarioGastosDTO>[]>(
		() => [
			{
				accessorKey: "nombre",
				header: "Nombre(s)",
				size: 150,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorFn: (row) => `${row.apellidoPaterno} ${row.apellidoMaterno}`,
				header: "Apellido(s)",
				size: 150,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "numeroEmpleado",
				header: "Número de empleado",
				size: 150,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "fechaAlta",
				header: "Fecha de alta",
				size: 150,
				Cell: ({ cell }) => {
					const fecha = cell.getValue<Date | string>();
					return formatearFechaLocalizada(fecha);
				},
				enableColumnFilter: true,
				enableSorting: true,
			},
		],
		[]
	);

	const table = useMaterialReactTable({
		columns,
		data: empleados,
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
			showSkeletons: (isLoading || isFetching) && empleados.length === 0,
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
				},
				muiTableBodyCellProps: {
					align: "center",
				},
			},
		},
		renderRowActions: ({ row }) => (
			<div className="flex items-center justify-center gap-3">
				<CustomSwitch
					checked={row.original.estatus === 1}
					onChange={() => handleCambiarEstatus(row.original)}
					checkedText="Activo"
					uncheckedText="Inactivo"
					disabled={editarEmpleadoMutation.isPending}
					className="justify-start! items-start!"
				/>
				<TableActionButton
					icon={faUserPen}
					tooltip="Editar información general"
					variant="custom"
					customClassName="bg-blue-500 text-white hover:bg-blue-600"
					onClick={() => handleAbrirEditar(row.original)}
				/>
				<Link
					to={`/datos-empleado/configurar-plazas/${row.original.id}`}
					state={{ empleado: row.original }}
					style={{ textDecoration: "none" }}
				>
					<TableActionButton
						icon={faEdit}
						tooltip="Configurar plazas"
						variant="custom"
						customClassName="bg-green-500 text-white hover:bg-green-600"
						onClick={() => {
							// La navegación se maneja por el Link
						}}
					/>
				</Link>
			</div>
		),
		renderTopToolbar: ({ table }) => (
			<Box
				sx={{
					display: "flex",
					gap: "0.5rem",
					p: "8px",
					justifyContent: "space-between",
				}}
			>
				<Box>
					{/* Botón para agregar empleado si es necesario */}
				</Box>
				<Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
					<MRT_GlobalFilterTextField table={table} />
				</Box>
			</Box>
		),
	});

	if (isLoading && empleados.length === 0) {
		return <Loader text="Cargando empleados..." />;
	}

	if (error) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error al cargar los empleados: {error instanceof Error ? error.message : "Error desconocido"}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-3 sm:p-4 lg:p-6">
			<div className="mb-4 sm:mb-6">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Datos para el Empleado</h1>
				<p className="text-sm sm:text-base text-gray-600">
					Gestiona la información de los empleados y sus plazas asignadas
				</p>
			</div>

			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>

			{usuarioSeleccionado && (
				<ModalEditarEmpleado
					abierto={mostrarModalEditar}
					empleado={usuarioSeleccionado}
					onClose={handleCerrarEditar}
					onSuccess={async () => {
						await queryClient.invalidateQueries({ queryKey: ["empleadosGastos", idEmpresa] });
						handleCerrarEditar();
					}}
				/>
			)}
		</div>
	);
}

