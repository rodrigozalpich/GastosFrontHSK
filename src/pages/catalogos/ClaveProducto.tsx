import { type JSX, useMemo, useEffect, useState } from "react";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { useQueryClient } from "@tanstack/react-query";
import { useClaveProducto } from "../../hooks/useClaveProducto";
import Loader from "../../components/Loader";
import type { ClaveProductoDTO } from "../../types/catalogos";
import { MRT_Localization_ES } from "../../config/mrtLocalization";
import { useTituloStore } from "../../services/tituloService";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import ModalClaveProductoForm from "../../components/modals/ModalClaveProductoForm";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import TableActionButton from "../../components/TableActionButton";
import ActionButton from "../../components/ActionButton";
import {
	esCrearClaveProducto,
	esBorrarClaveProducto,
} from "../../helpers/permisosHelpers";

/**
 * Componente de gestión de Claves de Producto
 * Permite crear, editar, ver y eliminar claves de producto
 */
export default function ClaveProducto(): JSX.Element {
	const queryClient = useQueryClient();
	const {
		clavesProducto,
		isLoading,
		isError,
		error,
		eliminarClaveProducto,
		isDeleting,
	} = useClaveProducto();
	const { actualizarTitulo } = useTituloStore();

	const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
	const [claveProductoAEliminar, setClaveProductoAEliminar] =
		useState<ClaveProductoDTO | null>(null);
	const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
	const [mostrarModalImpuesto, setMostrarModalImpuesto] = useState(false);

	useEffect(() => {
		actualizarTitulo("Claves de Producto");
	}, [actualizarTitulo]);

	const handleEliminarClaveProducto = (claveProducto: ClaveProductoDTO) => {
		setClaveProductoAEliminar(claveProducto);
		setMostrarConfirmacionEliminar(true);
	};

	const confirmarEliminar = async () => {
		if (claveProductoAEliminar) {
			// Cerrar el modal primero para evitar re-renders
			setMostrarConfirmacionEliminar(false);
			const claveAEliminar = claveProductoAEliminar;
			setClaveProductoAEliminar(null);
			
			// Enviar el objeto completo con todos los campos requeridos
			eliminarClaveProducto.mutate(claveAEliminar, {
				onSuccess: async () => {
					// Invalidar queries después de cerrar el modal
					await queryClient.invalidateQueries({ queryKey: ["clavesProducto"] });
				},
			});
		}
	};

	const handleCrearClaveProducto = () => {
		setMostrarModalProducto(true);
	};

	const handleCrearClaveImpuesto = () => {
		setMostrarModalImpuesto(true);
	};

	const handleCerrarModalProducto = () => {
		setMostrarModalProducto(false);
	};

	const handleCerrarModalImpuesto = () => {
		setMostrarModalImpuesto(false);
	};

	const columns = useMemo<MRT_ColumnDef<ClaveProductoDTO>[]>(
		() => [
			{
				accessorKey: "claveProd",
				header: "Clave",
				size: 120,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "nombreClave",
				header: "Nombre",
				size: 300,
				enableColumnFilter: true,
			},
			{
				accessorKey: "nombreDivision",
				header: "División",
				size: 150,
				enableColumnFilter: true,
			},
			{
				accessorKey: "nombreCuentaContable",
				header: "Cuenta Contable",
				size: 200,
				enableColumnFilter: true,
			},
		],
		[]
	);

	const table = useMaterialReactTable({
		columns,
		data: clavesProducto,
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
				{esBorrarClaveProducto() && (
					<TableActionButton
						icon={faTrash}
						onClick={() => handleEliminarClaveProducto(row.original)}
						tooltip="Eliminar"
						variant="delete"
						disabled={isDeleting}
					/>
				)}
			</div>
		),
	});

	if (isLoading) {
		return <Loader text="Cargando claves de producto..." />;
	}

	if (isError) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error al cargar las claves de producto. Por favor, intente nuevamente.
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
						Claves de Producto
					</h1>
					<p className="text-sm sm:text-base text-gray-600">
						Total de claves de producto: {clavesProducto.length}
					</p>
				</div>
				{esCrearClaveProducto() && (
					<div className="flex gap-2">
						<ActionButton
							variant="create"
							onClick={handleCrearClaveProducto}
							text="Nueva Clave de Producto"
							customClassName="bg-blue-500 text-white hover:bg-blue-600"
						/>
						<ActionButton
							variant="create"
							onClick={handleCrearClaveImpuesto}
							text="Nueva Clave de Impuesto"
						/>
					</div>
				)}
			</div>

			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>

			<ModalConfirmacion
				abierto={mostrarConfirmacionEliminar}
				titulo="Confirmar Eliminación"
				mensaje={`¿Está seguro de que desea eliminar la clave de producto "${claveProductoAEliminar?.claveProd}"? Esta acción no se puede deshacer.`}
				onConfirmar={confirmarEliminar}
				onCancelar={() => {
					setMostrarConfirmacionEliminar(false);
					setClaveProductoAEliminar(null);
				}}
			/>

			{mostrarModalProducto && (
				<ModalClaveProductoForm
					esImpuesto={false}
					onClose={handleCerrarModalProducto}
					abierto={mostrarModalProducto}
				/>
			)}

			{mostrarModalImpuesto && (
				<ModalClaveProductoForm
					esImpuesto={true}
					onClose={handleCerrarModalImpuesto}
					abierto={mostrarModalImpuesto}
				/>
			)}
		</div>
	);
}

