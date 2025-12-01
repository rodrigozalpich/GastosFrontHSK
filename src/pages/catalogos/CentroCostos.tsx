import { type JSX, useMemo, useEffect, useState } from "react";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { useCentroCostos } from "../../hooks/useCentroCostos";
import Loader from "../../components/Loader";
import type { CentroCostoDTO } from "../../types/catalogos";
import { MRT_Localization_ES } from "../../config/mrtLocalization";
import { useTituloStore } from "../../services/tituloService";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import ModalCentroCosto from "../../components/modals/ModalCentroCosto";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import TableActionButton from "../../components/TableActionButton";
import ActionButton from "../../components/ActionButton";
import { esCrearCentroCosto, esEditarCentroCosto, esBorrarCentroCosto } from "../../helpers/permisosHelpers";
import { formatearFechaLocalizada } from "../../helpers/dateHelpers";

/**
 * Componente de gestión de Centros de Costos
 * Permite crear, editar, ver y eliminar centros de costos
 *
 * @returns {JSX.Element} El componente de gestión de centros de costos
 */
export default function CentroCostos(): JSX.Element {
	const {
		centrosCostos,
		isLoading,
		isError,
		error,
		eliminarCentroCosto,
		isDeleting,
	} = useCentroCostos();
	const { actualizarTitulo } = useTituloStore();

	const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
	const [centroCostoAEliminar, setCentroCostoAEliminar] = useState<CentroCostoDTO | null>(null);
	const [modoModal, setModoModal] = useState<"crear" | "editar" | null>(null);
	const [centroCostoSeleccionado, setCentroCostoSeleccionado] = useState<CentroCostoDTO | null>(null);

	useEffect(() => {
		actualizarTitulo("Centros de Costos");
	}, [actualizarTitulo]);

	const handleEliminarCentroCosto = (centroCosto: CentroCostoDTO) => {
		setCentroCostoAEliminar(centroCosto);
		setMostrarConfirmacionEliminar(true);
	};

	const handleCrearCentroCosto = () => {
		setCentroCostoSeleccionado(null);
		setModoModal("crear");
	};

	const handleEditarCentroCosto = (centroCosto: CentroCostoDTO) => {
		setCentroCostoSeleccionado(centroCosto);
		setModoModal("editar");
	};

	const handleCerrarModal = () => {
		setModoModal(null);
		setCentroCostoSeleccionado(null);
	};

	const confirmarEliminar = () => {
		if (centroCostoAEliminar) {
			eliminarCentroCosto.mutate(centroCostoAEliminar.id, {
				onSuccess: () => {
					setMostrarConfirmacionEliminar(false);
					setCentroCostoAEliminar(null);
				},
			});
		}
	};

	const columns = useMemo<MRT_ColumnDef<CentroCostoDTO>[]>(
		() => [
			{
				accessorKey: "codigo",
				header: "Código",
				size: 120,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "nombre",
				header: "Nombre",
				size: 200,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "estatus",
				header: "Estatus",
				size: 100,
				Cell: ({ cell }) => {
					const estatus = cell.getValue<number>();
					return (
						<span
							className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
								estatus === 1
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{estatus === 1 ? "Activo" : "Inactivo"}
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
		[]
	);

	const table = useMaterialReactTable({
		columns,
		data: centrosCostos,
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
				{esEditarCentroCosto() && (
					<TableActionButton
						icon={faEdit}
						onClick={() => handleEditarCentroCosto(row.original)}
						tooltip="Editar"
						variant="edit"
					/>
				)}
				{esBorrarCentroCosto() && (
					<TableActionButton
						icon={faTrash}
						onClick={() => handleEliminarCentroCosto(row.original)}
						tooltip="Eliminar"
						variant="delete"
						disabled={isDeleting}
					/>
				)}
			</div>
		),
	});

	if (isLoading) {
		return <Loader text="Cargando centros de costos..." />;
	}

	if (isError) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error al cargar los centros de costos. Por favor, intente nuevamente.
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
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
						Centros de Costos
					</h1>
					<p className="text-sm sm:text-base text-gray-600">
						Total de centros de costos: {centrosCostos.length}
					</p>
				</div>
				{esCrearCentroCosto() && (
					<ActionButton
						variant="create"
						onClick={handleCrearCentroCosto}
						text="Nuevo Centro de Costo"
					/>
				)}
			</div>

			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>

			<ModalConfirmacion
				abierto={mostrarConfirmacionEliminar}
				titulo="Confirmar Eliminación"
				mensaje={`¿Está seguro de que desea eliminar el centro de costo "${centroCostoAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
				onConfirmar={confirmarEliminar}
				onCancelar={() => {
					setMostrarConfirmacionEliminar(false);
					setCentroCostoAEliminar(null);
				}}
			/>

			<ModalCentroCosto
				centroCosto={centroCostoSeleccionado}
				modo={modoModal}
				onClose={handleCerrarModal}
			/>
		</div>
	);
}

