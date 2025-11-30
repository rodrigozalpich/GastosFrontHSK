import { type JSX, useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { datosEmpleadoService } from "../../services/datosEmpleadoService";
import { centroCostoService } from "../../services/centroCostoService";
import { useAuthStore } from "../../store/authStore";
import { useNotificacionStore } from "../../store/notificacionStore";
import type { PlazaEmpleadoDTO, PlazaCentroDTO, CentroCostoDTO } from "../../types/catalogos";
import ActionButton from "../ActionButton";
import AutocompleteSelectField from "../AutocompleteSelectField";
import CustomButton from "../CustomButton";
import CustomSwitch from "../CustomSwitch";
import ModalConfirmacion from "../ModalConfirmacion";
import { faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import { MRT_Localization_ES } from "../../config/mrtLocalization";

interface ModalConfiguracionCentroCostosProps {
	abierto: boolean;
	plazaEmpleado: PlazaEmpleadoDTO;
	onClose: () => void;
	onSuccess: () => void;
}

/**
 * Modal para configurar centros de costos de una plaza
 */
export default function ModalConfiguracionCentroCostos({
	abierto,
	plazaEmpleado,
	onClose,
}: ModalConfiguracionCentroCostosProps): JSX.Element {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);
	const idEmpresa = obtenerIdEmpresa();

	const [centroCostoSeleccionado, setCentroCostoSeleccionado] = useState<number | "">("");
	const [mostrarConfirmacionBorrar, setMostrarConfirmacionBorrar] = useState(false);
	const [centroParaBorrar, setCentroParaBorrar] = useState<PlazaCentroDTO | null>(null);

	const { data: centrosCostos = [] } = useQuery<CentroCostoDTO[]>({
		queryKey: ["centrosCostos", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await centroCostoService.obtenerTodos(idEmpresa);
		},
		enabled: !!idEmpresa && abierto,
		select: (data) => data.filter((cc) => !cc.borrado),
	});

	const {
		data: relaciones = [],
		isLoading: cargandoRelaciones,
		isFetching: refrescandoRelaciones,
	} = useQuery<PlazaCentroDTO[]>({
		queryKey: ["plazaCentros", plazaEmpleado.id, idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.obtenerPaginadoPlazaCentro(plazaEmpleado.id, idEmpresa);
		},
		enabled: !!idEmpresa && abierto && !!plazaEmpleado.id,
	});

	const relacionesFiltradas = useMemo(
		() => relaciones.filter((r) => !r.borrado),
		[relaciones]
	);

	const crearRelacionMutation = useMutation({
		mutationFn: async (centro: PlazaCentroDTO) => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.crearPlazaCentro(centro, idEmpresa);
		},
		onSuccess: async (respuesta) => {
			if (respuesta) {
				mostrarNotificacion("Centro de costos agregado exitosamente", "success");
				await queryClient.invalidateQueries({ queryKey: ["plazaCentros", plazaEmpleado.id, idEmpresa] });
				setCentroCostoSeleccionado("");
			} else {
				mostrarNotificacion("Error al agregar centro de costos", "error");
			}
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al agregar centro de costos: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const editarRelacionMutation = useMutation({
		mutationFn: async (centro: PlazaCentroDTO) => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.EditarPlazaCentro(centro, idEmpresa);
		},
		onSuccess: async (respuesta) => {
			if (respuesta.estatus) {
				mostrarNotificacion("Centro de costos actualizado exitosamente", "success");
				await queryClient.invalidateQueries({ queryKey: ["plazaCentros", plazaEmpleado.id, idEmpresa] });
			} else {
				mostrarNotificacion(respuesta.descripcion || "Error al actualizar centro de costos", "error");
			}
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al actualizar centro de costos: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const handleAgregar = () => {
		if (!centroCostoSeleccionado) {
			mostrarNotificacion("Debe seleccionar un centro de costos", "warning");
			return;
		}

		const centro = centrosCostos.find((c) => c.id === Number(centroCostoSeleccionado));
		if (!centro) {
			mostrarNotificacion("Centro de costos no encontrado", "error");
			return;
		}

		const nuevaRelacion: PlazaCentroDTO = {
			id: 0,
			idCentroCosto: Number(centroCostoSeleccionado),
			idPlazaEmpleado: plazaEmpleado.id,
			estatus: 1,
			borrado: false,
			fechaAlta: new Date().toISOString(),
			fechaBaja: null,
			nombreCentro: centro.nombre || "",
			codigo: centro.codigo || "",
		};

		crearRelacionMutation.mutate(nuevaRelacion);
	};

	const handleCambiarEstatus = useCallback(
		async (centro: PlazaCentroDTO) => {
			const centroActualizado = {
				...centro,
				estatus: centro.estatus === 1 ? 0 : 1,
			};
			editarRelacionMutation.mutate(centroActualizado);
		},
		[editarRelacionMutation]
	);

	const handleBorrar = (centro: PlazaCentroDTO) => {
		setCentroParaBorrar(centro);
		setMostrarConfirmacionBorrar(true);
	};

	const confirmarBorrar = async () => {
		if (!centroParaBorrar) return;

		const centroActualizado = {
			...centroParaBorrar,
			borrado: true,
			estatus: 0,
			fechaBaja: new Date().toISOString(),
		};

		await editarRelacionMutation.mutateAsync(centroActualizado);
		setMostrarConfirmacionBorrar(false);
		setCentroParaBorrar(null);
	};

	const centroOptions = useMemo(
		() =>
			centrosCostos
				.filter((c) => !relacionesFiltradas.some((r) => r.idCentroCosto === c.id))
				.map((c) => ({ id: c.id, nombre: `${c.codigo} - ${c.nombre}` })),
		[centrosCostos, relacionesFiltradas]
	);

	const columns = useMemo<MRT_ColumnDef<PlazaCentroDTO>[]>(
		() => [
			{
				accessorKey: "codigo",
				header: "Código",
				size: 120,
			},
			{
				accessorKey: "nombreCentro",
				header: "Nombre",
				size: 200,
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
			<ActionButton
				icon={faTrash}
				tooltip="Eliminar"
				text="Eliminar"
				variant="custom"
				customClassName="bg-red-500 text-white hover:bg-red-600"
				onClick={() => handleBorrar(row.original)}
				disabled={editarRelacionMutation.isPending}
				showText={false}
			/>
		),
	});

	useEffect(() => {
		if (!abierto) {
			setTimeout(() => {
				setCentroCostoSeleccionado("");
				setMostrarConfirmacionBorrar(false);
				setCentroParaBorrar(null);
			}, 0);
		}
	}, [abierto]);

	return (
		<Dialog open={abierto} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle>
				<div className="flex items-center justify-between">
					<span>Configurar Centro de Costos - {plazaEmpleado.nombrePlaza}</span>
					<ActionButton icon={faTimes} text="Cerrar" variant="cancel" onClick={onClose} showText={false} />
				</div>
			</DialogTitle>
			<DialogContent dividers>
				<div className="p-4 space-y-4">
					<div className="flex gap-2 items-end">
						<div className="flex-1">
							<AutocompleteSelectField
								label="Centro de Costos"
								value={centroCostoSeleccionado === "" ? 0 : Number(centroCostoSeleccionado)}
								onChange={(value) => setCentroCostoSeleccionado(value || "")}
								options={centroOptions}
								placeholder="Seleccione un centro de costos"
								displayField="nombre"
							/>
						</div>
						<CustomButton
							type="button"
							text="Agregar"
							onClick={handleAgregar}
							disabled={!centroCostoSeleccionado || crearRelacionMutation.isPending}
						/>
					</div>

					{(cargandoRelaciones || refrescandoRelaciones) && relacionesFiltradas.length === 0 ? (
						<Loader text="Cargando centros de costos..." />
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
				mensaje={`¿Está seguro de que desea eliminar el centro de costos "${centroParaBorrar?.nombreCentro}"?`}
				textoConfirmar="Eliminar"
				textoCancelar="Cancelar"
				colorConfirmar="red"
				onConfirmar={confirmarBorrar}
				onCancelar={() => {
					setMostrarConfirmacionBorrar(false);
					setCentroParaBorrar(null);
				}}
			/>
		</Dialog>
	);
}

