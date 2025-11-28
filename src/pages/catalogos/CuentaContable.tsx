import { type JSX, useMemo, useEffect, useState, useCallback } from "react";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { useQueryClient } from "@tanstack/react-query";
import { useCuentaContable } from "../../hooks/useCuentaContable";
import Loader from "../../components/Loader";
import type { CuentaContableGastosDTO } from "../../types/gastos";
import { MRT_Localization_ES } from "../../config/mrtLocalization";
import { useTituloStore } from "../../services/tituloService";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import ModalCuentaContable from "../../components/modals/ModalCuentaContable";
import { faEdit, faTrash, faStar } from "@fortawesome/free-solid-svg-icons";
import TableActionButton from "../../components/TableActionButton";
import ActionButton from "../../components/ActionButton";
import {
	esCrearCuentaContableGastos,
	esEditarCuentaContableGastos,
	esEliminarCuentaContableGastos,
} from "../../helpers/permisosHelpers";
import { formatearFechaLocalizada } from "../../helpers/dateHelpers";

/**
 * Componente de gestión de Cuentas Contables
 * Permite crear, editar, ver y eliminar cuentas contables
 */
export default function CuentaContable(): JSX.Element {
	const queryClient = useQueryClient();
	const {
		cuentasContables,
		isLoading,
		isError,
		error,
		eliminarCuentaContable,
		actualizarCuentaContable,
		isDeleting,
		isUpdating,
	} = useCuentaContable();
	const { actualizarTitulo } = useTituloStore();

	const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
	const [cuentaContableAEliminar, setCuentaContableAEliminar] =
		useState<CuentaContableGastosDTO | null>(null);
	const [modoModal, setModoModal] = useState<"crear" | "editar" | null>(null);
	const [cuentaContableSeleccionada, setCuentaContableSeleccionada] =
		useState<CuentaContableGastosDTO | null>(null);

	useEffect(() => {
		actualizarTitulo("Cuentas Contables");
	}, [actualizarTitulo]);

	const handleEliminarCuentaContable = (cuentaContable: CuentaContableGastosDTO) => {
		setCuentaContableAEliminar(cuentaContable);
		setMostrarConfirmacionEliminar(true);
	};

	const confirmarEliminar = async () => {
		if (cuentaContableAEliminar) {
			// Cerrar el modal primero para evitar re-renders
			setMostrarConfirmacionEliminar(false);
			const cuentaContableAEliminarCompleta = cuentaContableAEliminar;
			setCuentaContableAEliminar(null);
			
			// Enviar el objeto completo con todos los campos requeridos
			eliminarCuentaContable.mutate(cuentaContableAEliminarCompleta, {
				onSuccess: async () => {
					// Invalidar queries después de cerrar el modal
					await queryClient.invalidateQueries({ queryKey: ["cuentasContables"] });
				},
			});
		}
	};

	const handleCrearCuentaContable = () => {
		setCuentaContableSeleccionada(null);
		setModoModal("crear");
	};

	const handleEditarCuentaContable = (cuentaContable: CuentaContableGastosDTO) => {
		setCuentaContableSeleccionada(cuentaContable);
		setModoModal("editar");
	};

	const handleCerrarModal = () => {
		setModoModal(null);
		setCuentaContableSeleccionada(null);
	};

	const handleToggleEsDefault = useCallback(
		(cuentaContable: CuentaContableGastosDTO) => {
			// Crear una copia de la cuenta contable y cambiar esDefault
			const nuevoEsDefault = cuentaContable.esDefault === true ? false : true;
			const cuentaContableActualizada: CuentaContableGastosDTO = {
				...cuentaContable,
				esDefault: nuevoEsDefault,
			};

			actualizarCuentaContable.mutate(cuentaContableActualizada);
		},
		[actualizarCuentaContable]
	);

	const columns = useMemo<MRT_ColumnDef<CuentaContableGastosDTO>[]>(
		() => [
			{
				accessorKey: "codigo",
				header: "Código",
				size: 120,
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: "descripcion",
				header: "Descripción",
				size: 250,
				enableColumnFilter: true,
			},
      {
        accessorKey: "tipoDeCuentaN",
        header: "Tipo de cuenta",
        size: 100,
        enableColumnFilter: true,
      },
			{
				accessorKey: "esAcreedor",
				header: "Es Acreedor",
				size: 100,
				Cell: ({ cell }) => {
					const esAcreedor = cell.getValue<boolean>();
					return (
						<span
							className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
								esAcreedor ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
							}`}
						>
							{esAcreedor ? "Sí" : "No"}
						</span>
					);
				},
			},
			{
				accessorKey: "estatus",
				header: "Estatus",
				size: 100,
				Cell: ({ cell }) => {
					const estatus = cell.getValue<boolean>();
					return (
						<span
							className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
								estatus
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{estatus ? "Activo" : "Inactivo"}
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
		data: cuentasContables,
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
				{esEditarCuentaContableGastos() && (
					<TableActionButton
						icon={faStar}
						onClick={() => handleToggleEsDefault(row.original)}
						tooltip={row.original.esDefault === true ? "Quitar como predeterminada" : "Marcar como predeterminada"}
						variant="toggle"
						isActive={row.original.esDefault === true}
						customActiveClassName="bg-yellow-500 text-white hover:bg-yellow-600"
						customClassName="bg-gray-300 text-gray-700 hover:bg-gray-400"
						disabled={isUpdating}
					/>
				)}
				{esEditarCuentaContableGastos() && (
					<TableActionButton
						icon={faEdit}
						onClick={() => handleEditarCuentaContable(row.original)}
						tooltip="Editar"
						variant="edit"
					/>
				)}
				{esEliminarCuentaContableGastos() && (
					<TableActionButton
						icon={faTrash}
						onClick={() => handleEliminarCuentaContable(row.original)}
						tooltip="Eliminar"
						variant="delete"
						disabled={isDeleting}
					/>
				)}
			</div>
		),
	});

	if (isLoading) {
		return <Loader text="Cargando cuentas contables..." />;
	}

	if (isError) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">
						Error al cargar las cuentas contables. Por favor, intente nuevamente.
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
						Cuentas Contables
					</h1>
					<p className="text-sm sm:text-base text-gray-600">
						Total de cuentas contables: {cuentasContables.length}
					</p>
				</div>
				{esCrearCuentaContableGastos() && (
					<ActionButton
						variant="create"
						onClick={handleCrearCuentaContable}
						text="Nueva Cuenta Contable"
					/>
				)}
			</div>

			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<MaterialReactTable table={table} />
			</div>

			<ModalConfirmacion
				abierto={mostrarConfirmacionEliminar}
				titulo="Confirmar Eliminación"
				mensaje={`¿Está seguro de que desea eliminar la cuenta contable "${cuentaContableAEliminar?.descripcion}"? Esta acción no se puede deshacer.`}
				onConfirmar={confirmarEliminar}
				onCancelar={() => {
					setMostrarConfirmacionEliminar(false);
					setCuentaContableAEliminar(null);
				}}
			/>

			<ModalCuentaContable
				cuentaContable={cuentaContableSeleccionada}
				modo={modoModal}
				onClose={handleCerrarModal}
			/>
		</div>
	);
}

