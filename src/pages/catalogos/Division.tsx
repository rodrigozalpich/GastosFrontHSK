import { type JSX, useMemo, useEffect, useState, useCallback } from "react";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { useQueryClient } from "@tanstack/react-query";
import { useDivision } from "../../hooks/useDivision";
import Loader from "../../components/Loader";
import type { DivisionDTO } from "../../types/catalogos";
import { MRT_Localization_ES } from "../../config/mrtLocalization";
import { useTituloStore } from "../../services/tituloService";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import ModalDivision from "../../components/modals/ModalDivision";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import TableActionButton from "../../components/TableActionButton";
import ActionButton from "../../components/ActionButton";
import { esCrearDivision } from "../../helpers/permisosHelpers";
import { formatearFechaLocalizada } from "../../helpers/dateHelpers";

/**
 * Componente de gestión de Divisiones
 * Permite crear, editar, ver y eliminar divisiones
 */
export default function Division(): JSX.Element {
	const queryClient = useQueryClient();
	const {
		divisiones,
		isLoading,
		isError,
		error,
		eliminarDivision,
		actualizarDivision,
		isDeleting,
		isUpdating,
	} = useDivision();
	const { actualizarTitulo } = useTituloStore();

	const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
	const [divisionAEliminar, setDivisionAEliminar] = useState<DivisionDTO | null>(null);
	const [modoModal, setModoModal] = useState<"crear" | "editar" | null>(null);
	const [divisionSeleccionada, setDivisionSeleccionada] = useState<DivisionDTO | null>(null);

	useEffect(() => {
		actualizarTitulo("Divisiones");
	}, [actualizarTitulo]);

	const handleEliminarDivision = (division: DivisionDTO) => {
		setDivisionAEliminar(division);
		setMostrarConfirmacionEliminar(true);
	};

	const confirmarEliminar = async () => {
		if (divisionAEliminar) {
			// Cerrar el modal primero para evitar re-renders
			setMostrarConfirmacionEliminar(false);
			const divisionAEliminarCompleta = divisionAEliminar;
			setDivisionAEliminar(null);
			
			// Enviar el objeto completo con todos los campos requeridos
			eliminarDivision.mutate(divisionAEliminarCompleta, {
				onSuccess: async () => {
					// Invalidar queries después de cerrar el modal
					await queryClient.invalidateQueries({ queryKey: ["divisiones"] });
				},
			});
		}
	};

	const handleToggleEstatus = useCallback(
		(division: DivisionDTO) => {
			// Crear una copia de la división y cambiar el estatus
			const nuevoEstatus = division.estatus === 1 ? 0 : 1;
			const divisionActualizada: DivisionDTO = {
				...division,
				estatus: nuevoEstatus,
			};

			actualizarDivision.mutate(divisionActualizada);
		},
		[actualizarDivision]
	);

	const handleCrearDivision = () => {
		setDivisionSeleccionada(null);
		setModoModal("crear");
	};

	const handleEditarDivision = (division: DivisionDTO) => {
		setDivisionSeleccionada(division);
		setModoModal("editar");
	};

	const handleCerrarModal = () => {
		setModoModal(null);
		setDivisionSeleccionada(null);
	};

	const columns = useMemo<MRT_ColumnDef<DivisionDTO>[]>(
		() => [
			{
				accessorKey: "nombre",
				header: "Nombre",
				size: 200,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "codigoSAP",
				header: "Código SAP",
				size: 150,
				enableColumnFilter: true,
			},
			{
				accessorKey: "registroPatronal",
				header: "Registro Patronal",
				size: 180,
				enableColumnFilter: true,
			},
			{
				accessorKey: "estatus",
				header: "Estatus",
				size: 120,
				Cell: ({ cell, row }) => {
					const estatus = cell.getValue<number>();
					const division = row.original;
					return (
						<div className="flex items-center gap-2">
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={estatus === 1}
									onChange={() => handleToggleEstatus(division)}
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
				accessorKey: "asignaAC",
				header: "Asigna AC",
				size: 100,
				Cell: ({ cell }) => {
					const asignaAC = cell.getValue<boolean>();
					return (
						<span
							className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
								asignaAC
									? "bg-blue-100 text-blue-800"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							{asignaAC ? "Sí" : "No"}
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
		data: divisiones,
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
		renderRowActions: ({ row }) => (
			<div className="flex gap-2">
				<TableActionButton
					icon={faEdit}
					onClick={() => handleEditarDivision(row.original)}
					tooltip="Editar"
					variant="edit"
				/>
				<TableActionButton
					icon={faTrash}
					onClick={() => handleEliminarDivision(row.original)}
					tooltip="Eliminar"
					variant="delete"
					disabled={isDeleting}
				/>
			</div>
		),
	});

	if (isLoading) {
		return <Loader text="Cargando divisiones..." />;
	}

	if (isError) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error al cargar las divisiones. Por favor, intente nuevamente.
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
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Divisiones</h1>
					<p className="text-sm sm:text-base text-gray-600">
						Total de divisiones: {divisiones.length}
					</p>
				</div>
				{esCrearDivision() && (
					<ActionButton
						variant="create"
						onClick={handleCrearDivision}
						text="Nueva División"
					/>
				)}
			</div>

			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>

			<ModalConfirmacion
				abierto={mostrarConfirmacionEliminar}
				titulo="Confirmar Eliminación"
				mensaje={`¿Está seguro de que desea eliminar la división "${divisionAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
				onConfirmar={confirmarEliminar}
				onCancelar={() => {
					setMostrarConfirmacionEliminar(false);
					setDivisionAEliminar(null);
				}}
			/>

			<ModalDivision
				division={divisionSeleccionada}
				modo={modoModal}
				onClose={handleCerrarModal}
			/>
		</div>
	);
}

