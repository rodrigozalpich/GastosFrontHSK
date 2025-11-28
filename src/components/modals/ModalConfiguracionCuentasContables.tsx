import { type JSX, useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { datosEmpleadoService } from "../../services/datosEmpleadoService";
import { cuentaContableService } from "../../services/cuentaContableService";
import { useAuthStore } from "../../store/authStore";
import { useNotificacionStore } from "../../store/notificacionStore";
import type { PlazaEmpleadoDTO, PlazaCuentaDTO, CuentaContableDTO } from "../../types/catalogos";
import ActionButton from "../ActionButton";
import TableActionButton from "../TableActionButton";
import AutocompleteSelectField from "../AutocompleteSelectField";
import CustomButton from "../CustomButton";
import CustomSwitch from "../CustomSwitch";
import ModalConfirmacion from "../ModalConfirmacion";
import { faTimes, faTrash, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "../Loader";
import { MRT_Localization_ES } from "../../config/mrtLocalization";

interface ModalConfiguracionCuentasContablesProps {
	abierto: boolean;
	plazaEmpleado: PlazaEmpleadoDTO;
	onClose: () => void;
	onSuccess: () => void;
}

/**
 * Modal para configurar cuentas contables de una plaza
 */
export default function ModalConfiguracionCuentasContables({
	abierto,
	plazaEmpleado,
	onClose,
}: ModalConfiguracionCuentasContablesProps): JSX.Element {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);
	const idEmpresa = obtenerIdEmpresa();

	const [cuentaContableSeleccionada, setCuentaContableSeleccionada] = useState<number | "">("");
	const [mostrarConfirmacionBorrar, setMostrarConfirmacionBorrar] = useState(false);
	const [cuentaParaBorrar, setCuentaParaBorrar] = useState<PlazaCuentaDTO | null>(null);

	const { data: cuentasContables = [] } = useQuery<CuentaContableDTO[]>({
		queryKey: ["cuentasContables", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await cuentaContableService.obtenerTodos(idEmpresa);
		},
		enabled: !!idEmpresa && abierto,
		select: (data) => data.filter((cc) => cc.estatus && !cc.borrado),
	});

	const {
		data: relaciones = [],
		isLoading: cargandoRelaciones,
		isFetching: refrescandoRelaciones,
	} = useQuery<PlazaCuentaDTO[]>({
		queryKey: ["plazaCuentas", plazaEmpleado.id, idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.obtenerPaginadoPlazaCuenta(plazaEmpleado.id, idEmpresa);
		},
		enabled: !!idEmpresa && abierto && !!plazaEmpleado.id,
	});

	const relacionesFiltradas = useMemo(
		() => relaciones.filter((r) => !r.borrado),
		[relaciones]
	);

	const crearRelacionMutation = useMutation({
		mutationFn: async (cuenta: PlazaCuentaDTO) => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.crearPlazaCuenta(cuenta, idEmpresa);
		},
		onSuccess: async (respuesta) => {
			if (respuesta.estatus) {
				mostrarNotificacion("Cuenta contable agregada exitosamente", "success");
				await queryClient.invalidateQueries({ queryKey: ["plazaCuentas", plazaEmpleado.id, idEmpresa] });
				setCuentaContableSeleccionada("");
			} else {
				mostrarNotificacion(respuesta.descripcion || "Error al agregar cuenta contable", "error");
			}
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al agregar cuenta contable: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const editarRelacionMutation = useMutation({
		mutationFn: async (cuenta: PlazaCuentaDTO) => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.EditarPlazaCuenta(cuenta, idEmpresa);
		},
		onSuccess: async (respuesta) => {
			if (respuesta.estatus) {
				mostrarNotificacion("Cuenta contable actualizada exitosamente", "success");
				await queryClient.invalidateQueries({ queryKey: ["plazaCuentas", plazaEmpleado.id, idEmpresa] });
			} else {
				mostrarNotificacion(respuesta.descripcion || "Error al actualizar cuenta contable", "error");
			}
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al actualizar cuenta contable: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const asignarDefaultMutation = useMutation({
		mutationFn: async (cuenta: PlazaCuentaDTO) => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.AsignarCuentaDefault(cuenta, idEmpresa);
		},
		onSuccess: async (respuesta) => {
			if (respuesta.estatus) {
				mostrarNotificacion("Cuenta por defecto asignada exitosamente", "success");
				await queryClient.invalidateQueries({ queryKey: ["plazaCuentas", plazaEmpleado.id, idEmpresa] });
			} else {
				mostrarNotificacion(respuesta.descripcion || "Error al asignar cuenta por defecto", "error");
			}
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al asignar cuenta por defecto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const handleAgregar = () => {
		if (!cuentaContableSeleccionada) {
			mostrarNotificacion("Debe seleccionar una cuenta contable", "warning");
			return;
		}

		const cuenta = cuentasContables.find((c) => c.id === Number(cuentaContableSeleccionada));
		if (!cuenta) {
			mostrarNotificacion("Cuenta contable no encontrada", "error");
			return;
		}

		const nuevaRelacion: PlazaCuentaDTO = {
			id: 0,
			idCuentaContable: Number(cuentaContableSeleccionada),
			idPlazaEmpleado: plazaEmpleado.id,
			estatus: 1,
			borrado: false,
			nombreCuenta: cuenta.descripcion || "",
			codigo: cuenta.codigo || "",
			esDefault: false,
		};

		crearRelacionMutation.mutate(nuevaRelacion);
	};

	const handleCambiarEstatus = useCallback(
		async (cuenta: PlazaCuentaDTO) => {
			const cuentaActualizada = {
				...cuenta,
				estatus: cuenta.estatus === 1 ? 0 : 1,
			};
			editarRelacionMutation.mutate(cuentaActualizada);
		},
		[editarRelacionMutation]
	);

	const handleAsignarDefault = async (cuenta: PlazaCuentaDTO) => {
		asignarDefaultMutation.mutate(cuenta);
	};

	const handleBorrar = (cuenta: PlazaCuentaDTO) => {
		setCuentaParaBorrar(cuenta);
		setMostrarConfirmacionBorrar(true);
	};

	const confirmarBorrar = async () => {
		if (!cuentaParaBorrar) return;

		const cuentaActualizada = {
			...cuentaParaBorrar,
			borrado: true,
			estatus: 0,
		};

		await editarRelacionMutation.mutateAsync(cuentaActualizada);
		setMostrarConfirmacionBorrar(false);
		setCuentaParaBorrar(null);
	};

	const cuentaOptions = useMemo(
		() =>
			cuentasContables
				.filter((c) => !relacionesFiltradas.some((r) => r.idCuentaContable === c.id))
				.map((c) => ({ id: c.id, nombre: `${c.codigo} - ${c.descripcion}` })),
		[cuentasContables, relacionesFiltradas]
	);

	const columns = useMemo<MRT_ColumnDef<PlazaCuentaDTO>[]>(
		() => [
			{
				accessorKey: "codigo",
				header: "Código",
				size: 120,
			},
			{
				accessorKey: "nombreCuenta",
				header: "Nombre",
				size: 200,
			},
			{
				accessorKey: "esDefault",
				header: "Por Defecto",
				size: 120,
				Cell: ({ row }) => (
					<div className="flex items-center gap-2">
						{row.original.esDefault && (
							<FontAwesomeIcon icon={faStar} className="text-yellow-500" />
						)}
						<span>{row.original.esDefault ? "Sí" : "No"}</span>
					</div>
				),
			},
			{
				accessorKey: "estatus",
				header: "Estatus",
				size: 120,
				Cell: ({ row }) => (
					<CustomSwitch
						checked={row.original.estatus === 1}
						onChange={() => handleCambiarEstatus(row.original)}
						checkedText="Activo"
						uncheckedText="Inactivo"
						disabled={editarRelacionMutation.isPending}
						className="justify-start! items-start!"
					/>
				),
			},
		],
		[editarRelacionMutation.isPending, handleCambiarEstatus]
	);

	const table = useMaterialReactTable({
		columns,
		data: relacionesFiltradas,
		localization: MRT_Localization_ES,
		enableRowActions: true,
		positionActionsColumn: "last",
		renderRowActions: ({ row }) => (
			<div className="flex gap-2">
				{!row.original.esDefault && (
					<TableActionButton
						icon={faStar}
						tooltip="Asignar como por defecto"
						variant="custom"
						customClassName="bg-yellow-500 text-white hover:bg-yellow-600"
						onClick={() => handleAsignarDefault(row.original)}
						disabled={asignarDefaultMutation.isPending}
					/>
				)}
				<TableActionButton
					icon={faTrash}
					tooltip="Eliminar"
					variant="delete"
					onClick={() => handleBorrar(row.original)}
					disabled={editarRelacionMutation.isPending}
				/>
			</div>
		),
	});

	useEffect(() => {
		if (!abierto) {
			setTimeout(() => {
				setCuentaContableSeleccionada("");
				setMostrarConfirmacionBorrar(false);
				setCuentaParaBorrar(null);
			}, 0);
		}
	}, [abierto]);

	return (
		<Dialog open={abierto} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle>
				<div className="flex items-center justify-between">
					<span>Configurar Cuentas Contables - {plazaEmpleado.nombrePlaza}</span>
					<ActionButton icon={faTimes} text="Cerrar" variant="cancel" onClick={onClose} showText={false} />
				</div>
			</DialogTitle>
			<DialogContent dividers>
				<div className="p-4 space-y-4">
					<div className="flex gap-2 items-end">
						<div className="flex-1">
							<AutocompleteSelectField
								label="Cuenta Contable"
								value={cuentaContableSeleccionada === "" ? 0 : Number(cuentaContableSeleccionada)}
								onChange={(value) => setCuentaContableSeleccionada(value || "")}
								options={cuentaOptions}
								placeholder="Seleccione una cuenta contable"
								displayField="nombre"
							/>
						</div>
						<CustomButton
							type="button"
							text="Agregar"
							onClick={handleAgregar}
							disabled={!cuentaContableSeleccionada || crearRelacionMutation.isPending}
						/>
					</div>

					{(cargandoRelaciones || refrescandoRelaciones) && relacionesFiltradas.length === 0 ? (
						<Loader text="Cargando cuentas contables..." />
					) : (
						<div className="bg-white rounded-lg shadow">
							<MaterialReactTable table={table} />
						</div>
					)}
				</div>
			</DialogContent>
			<DialogActions>
				<ActionButton icon={faTimes} text="Cerrar" variant="cancel" onClick={onClose} />
			</DialogActions>

			<ModalConfirmacion
				abierto={mostrarConfirmacionBorrar}
				titulo="Confirmar eliminación"
				mensaje={`¿Está seguro de que desea eliminar la cuenta contable "${cuentaParaBorrar?.nombreCuenta}"?`}
				textoConfirmar="Eliminar"
				textoCancelar="Cancelar"
				colorConfirmar="red"
				onConfirmar={confirmarBorrar}
				onCancelar={() => {
					setMostrarConfirmacionBorrar(false);
					setCuentaParaBorrar(null);
				}}
			/>
		</Dialog>
	);
}

