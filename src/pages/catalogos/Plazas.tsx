import { type JSX, useMemo, useEffect, useState, useCallback } from "react";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { useQueryClient } from "@tanstack/react-query";
import { usePlazas } from "../../hooks/usePlazas";
import Loader from "../../components/Loader";
import type { PlazaDTO } from "../../types/catalogos";
import { MRT_Localization_ES } from "../../config/mrtLocalization";
import { useTituloStore } from "../../services/tituloService";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import ModalPlaza from "../../components/modals/ModalPlaza";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import TableActionButton from "../../components/TableActionButton";
import ActionButton from "../../components/ActionButton";
import { esCrearPlaza, esEditarPlaza, esBorrarPlaza } from "../../helpers/permisosHelpers";
import { formatearFechaLocalizada } from "../../helpers/dateHelpers";

/**
 * Componente de gestión de Plazas
 * Permite crear, editar, ver y eliminar plazas
 */
export default function Plazas(): JSX.Element {
	const queryClient = useQueryClient();
	const { plazas, isLoading, isError, error, eliminarPlaza, actualizarPlaza, isDeleting, isUpdating } = usePlazas();
	const { actualizarTitulo } = useTituloStore();

	const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
	const [plazaAEliminar, setPlazaAEliminar] = useState<PlazaDTO | null>(null);
	const [modoModal, setModoModal] = useState<"crear" | "editar" | null>(null);
	const [plazaSeleccionada, setPlazaSeleccionada] = useState<PlazaDTO | null>(null);

	useEffect(() => {
		actualizarTitulo("Plazas");
	}, [actualizarTitulo]);

	const handleEliminarPlaza = (plaza: PlazaDTO) => {
		setPlazaAEliminar(plaza);
		setMostrarConfirmacionEliminar(true);
	};

	const confirmarEliminar = async () => {
		if (plazaAEliminar) {
			// Cerrar el modal primero para evitar re-renders
			setMostrarConfirmacionEliminar(false);
			const plazaAEliminarCompleta = plazaAEliminar;
			setPlazaAEliminar(null);
			
			// Enviar el objeto completo con todos los campos requeridos
			eliminarPlaza.mutate(plazaAEliminarCompleta, {
				onSuccess: async () => {
					// Invalidar queries después de cerrar el modal
					await queryClient.invalidateQueries({ queryKey: ["plazas"] });
				},
			});
		}
	};

	const handleCrearPlaza = () => {
		setPlazaSeleccionada(null);
		setModoModal("crear");
	};

	const handleEditarPlaza = (plaza: PlazaDTO) => {
		setPlazaSeleccionada(plaza);
		setModoModal("editar");
	};

	const handleCerrarModal = () => {
		setModoModal(null);
		setPlazaSeleccionada(null);
	};

	const handleToggleEstatus = useCallback(
		(plaza: PlazaDTO) => {
			// Crear una copia de la plaza y cambiar el estatus
			const nuevoEstatus = plaza.estatus === 1 ? 0 : 1;
			const plazaActualizada: PlazaDTO = {
				...plaza,
				estatus: nuevoEstatus,
			};

			actualizarPlaza.mutate(plazaActualizada);
		},
		[actualizarPlaza]
	);

	const columns = useMemo<MRT_ColumnDef<PlazaDTO>[]>(
		() => [
			{
				accessorKey: "nombrePlaza",
				header: "Nombre",
				size: 200,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "nombreDivision",
				header: "División",
				size: 150,
				enableColumnFilter: true,
			},
			{
				accessorKey: "estatus",
				header: "Estatus",
				size: 120,
				Cell: ({ cell, row }) => {
					const estatus = cell.getValue<number>();
					const plaza = row.original;
					return (
						<div className="flex items-center gap-2">
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={estatus === 1}
									onChange={() => handleToggleEstatus(plaza)}
									disabled={isUpdating}
									className="sr-only peer"
								/>
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
								<span className="ml-3 text-sm font-medium text-gray-700">
									{estatus === 1 ? "Activo" : "Inactivo"}
								</span>
							</label>
						</div>
					);
				},
			},
			{
				accessorKey: "disponible",
				header: "Disponible",
				size: 100,
				Cell: ({ cell }) => {
					const disponible = cell.getValue<boolean>();
					return (
						<span
							className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
								disponible
									? "bg-blue-100 text-blue-800"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							{disponible ? "Sí" : "No"}
						</span>
					);
				},
			},
			{
				accessorKey: "esAutorizador",
				header: "Es Autorizador",
				size: 100,
				Cell: ({ cell }) => {
					const esAutorizador = cell.getValue<boolean>();
					return (
						<span
							className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
								esAutorizador
									? "bg-purple-100 text-purple-800"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							{esAutorizador ? "Sí" : "No"}
						</span>
					);
				},
			},
			{
				accessorKey: "fechaAlta",
				header: "Fecha Alta",
				size: 120,
				Cell: ({ cell }) => {
					const fecha = cell.getValue<string | Date>();
					return formatearFechaLocalizada(fecha);
				},
				enableColumnFilter: false,
				enableSorting: true,
			},
		],
		[handleToggleEstatus, isUpdating]
	);

	const table = useMaterialReactTable({
		columns,
		data: plazas,
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
			<div className="flex gap-2">
				{esEditarPlaza() && (
					<TableActionButton
						icon={faEdit}
						onClick={() => handleEditarPlaza(row.original)}
						tooltip="Editar"
						variant="edit"
					/>
				)}
				{esBorrarPlaza() && (
					<TableActionButton
						icon={faTrash}
						onClick={() => handleEliminarPlaza(row.original)}
						tooltip="Eliminar"
						variant="delete"
						disabled={isDeleting}
					/>
				)}
			</div>
		),
	});

	if (isLoading) {
		return <Loader text="Cargando plazas..." />;
	}

	if (isError) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error al cargar las plazas. Por favor, intente nuevamente.
						{error instanceof Error && ` ${error.message}`}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-3 sm:p-4 lg:p-6">
			<div className="mb-4 sm:mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Plazas</h1>
					<p className="text-sm sm:text-base text-gray-600">
						Total de plazas: {plazas.length}
					</p>
				</div>
				{esCrearPlaza() && (
					<ActionButton
						variant="create"
						onClick={handleCrearPlaza}
						text="Nueva Plaza"
					/>
				)}
			</div>

			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>

			<ModalConfirmacion
				abierto={mostrarConfirmacionEliminar}
				titulo="Confirmar Eliminación"
				mensaje={`¿Está seguro de que desea eliminar la plaza "${plazaAEliminar?.nombrePlaza}"? Esta acción no se puede deshacer.`}
				onConfirmar={confirmarEliminar}
				onCancelar={() => {
					setMostrarConfirmacionEliminar(false);
					setPlazaAEliminar(null);
				}}
			/>

			<ModalPlaza
				plaza={plazaSeleccionada}
				modo={modoModal}
				onClose={handleCerrarModal}
			/>
		</div>
	);
}

