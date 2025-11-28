import { type JSX, useState, useEffect, useMemo } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { datosEmpleadoService } from "../../services/datosEmpleadoService";
import { useAuthStore } from "../../store/authStore";
import { useNotificacionStore } from "../../store/notificacionStore";
import type { UsuarioGastosDTO, DatosEmpleadoDTO, ContratosDTO, RegimenesDTO, RiesgosDTO, JornadasDTO, EstadoDTO } from "../../types/catalogos";
import ActionButton from "../ActionButton";
import InputField from "../InputField";
import AutocompleteSelectField from "../AutocompleteSelectField";
import { faTimes, faSave } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";

interface ModalEditarEmpleadoProps {
	abierto: boolean;
	empleado: UsuarioGastosDTO;
	onClose: () => void;
	onSuccess: () => void;
}

/**
 * Modal para editar información de un empleado
 */
export default function ModalEditarEmpleado({
	abierto,
	empleado,
	onClose,
	onSuccess,
}: ModalEditarEmpleadoProps): JSX.Element {
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);
	const idEmpresa = obtenerIdEmpresa();

	const [formData, setFormData] = useState<DatosEmpleadoDTO>(() => ({
		...empleado,
	} as DatosEmpleadoDTO));

	// Cargar catálogos
	const { data: contratos = [], isLoading: cargandoContratos } = useQuery<ContratosDTO[]>({
		queryKey: ["contratos", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.obtenerContrato(idEmpresa);
		},
		enabled: !!idEmpresa && abierto,
	});

	const { data: regimenes = [], isLoading: cargandoRegimenes } = useQuery<RegimenesDTO[]>({
		queryKey: ["regimenes", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.obtenerRegimen(idEmpresa);
		},
		enabled: !!idEmpresa && abierto,
	});

	const { data: riesgos = [], isLoading: cargandoRiesgos } = useQuery<RiesgosDTO[]>({
		queryKey: ["riesgos", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.obtenerRiesgo(idEmpresa);
		},
		enabled: !!idEmpresa && abierto,
	});

	const { data: jornadas = [], isLoading: cargandoJornadas } = useQuery<JornadasDTO[]>({
		queryKey: ["jornadas", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.obtenerJornada(idEmpresa);
		},
		enabled: !!idEmpresa && abierto,
	});

	const { data: estados = [], isLoading: cargandoEstados } = useQuery<EstadoDTO[]>({
		queryKey: ["estados", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.obtenerEstado(idEmpresa);
		},
		enabled: !!idEmpresa && abierto,
	});

	const editarEmpleadoMutation = useMutation({
		mutationFn: async (datos: DatosEmpleadoDTO) => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.editarEmpleado(datos, idEmpresa);
		},
		onSuccess: (respuesta) => {
			if (respuesta.estatus) {
				mostrarNotificacion("Empleado editado correctamente", "success");
				onSuccess();
			} else {
				mostrarNotificacion(respuesta.descripcion || "Error al editar el empleado", "error");
			}
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al editar empleado: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	useEffect(() => {
		if (abierto && empleado) {
			setTimeout(() => {
				setFormData({ ...empleado } as DatosEmpleadoDTO);
			}, 0);
		}
	}, [abierto, empleado]);

	const handleInputChange = (name: keyof DatosEmpleadoDTO, value: string | number | null) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = () => {
		editarEmpleadoMutation.mutate(formData);
	};

	const contratoOptions = useMemo(
		() => contratos.map((c) => ({ id: c.id, nombre: c.descripcion || "" })),
		[contratos]
	);
	const regimenOptions = useMemo(
		() => regimenes.map((r) => ({ id: r.id, nombre: r.descripcion || "" })),
		[regimenes]
	);
	const riesgoOptions = useMemo(
		() => riesgos.map((r) => ({ id: r.id, nombre: r.descripcion || "" })),
		[riesgos]
	);
	const jornadaOptions = useMemo(
		() => jornadas.map((j) => ({ id: j.id, nombre: j.descripcion || "" })),
		[jornadas]
	);
	const estadoOptions = useMemo(
		() => estados.map((e) => ({ id: e.ID, nombre: e.nombre || "" })),
		[estados]
	);

	const isLoading = cargandoContratos || cargandoRegimenes || cargandoRiesgos || cargandoJornadas || cargandoEstados;

	return (
		<Dialog open={abierto} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle>
				<div className="flex items-center justify-between">
					<span>Editar empleado</span>
					<ActionButton icon={faTimes} text="Cerrar" variant="cancel" onClick={onClose} showText={false} />
				</div>
			</DialogTitle>
			<DialogContent dividers>
				{isLoading ? (
					<Loader text="Cargando catálogos..." />
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
						<InputField
							name="nombre"
							label="Nombre"
							value={formData.nombre || ""}
							onChange={(e) => handleInputChange("nombre", e.target.value)}
							maxLength={50}
						/>
						<InputField
							name="apellidoPaterno"
							label="Apellido Paterno"
							value={formData.apellidoPaterno || ""}
							onChange={(e) => handleInputChange("apellidoPaterno", e.target.value)}
							maxLength={50}
						/>
						<InputField
							name="apellidoMaterno"
							label="Apellido Materno"
							value={formData.apellidoMaterno || ""}
							onChange={(e) => handleInputChange("apellidoMaterno", e.target.value)}
							maxLength={50}
						/>
						<InputField
							name="numeroEmpleado"
							label="Número de empleado"
							value={formData.numeroEmpleado || ""}
							onChange={(e) => handleInputChange("numeroEmpleado", e.target.value.replace(/[^0-9]/g, ""))}
							maxLength={15}
						/>
						<InputField
							name="numeroEmpleadoSAP"
							label="Número de empleado SAP"
							value={formData.numeroEmpleadoSAP || ""}
							onChange={(e) => handleInputChange("numeroEmpleadoSAP", e.target.value.replace(/[^0-9]/g, ""))}
							maxLength={50}
						/>
						<InputField
							name="rfc"
							label="R.F.C."
							value={formData.rfc || ""}
							onChange={(e) => handleInputChange("rfc", e.target.value.toUpperCase())}
							maxLength={20}
						/>
						<InputField
							name="curp"
							label="C.U.R.P."
							value={formData.curp || ""}
							onChange={(e) => handleInputChange("curp", e.target.value.toUpperCase())}
							maxLength={20}
						/>
						<InputField
							name="seguroSocial"
							label="Seguro social"
							value={formData.seguroSocial || ""}
							onChange={(e) => handleInputChange("seguroSocial", e.target.value.replace(/[^0-9]/g, ""))}
							maxLength={20}
						/>
						<InputField
							name="codigoPostal"
							label="Código postal"
							value={formData.codigoPostal || ""}
							onChange={(e) => handleInputChange("codigoPostal", e.target.value.replace(/[^0-9]/g, ""))}
							maxLength={10}
						/>
						<InputField
							name="fechaRelacionLaboral"
							label="Fecha de relación laboral"
							type="date"
							value={formData.fechaRelacionLaboral ? new Date(formData.fechaRelacionLaboral).toISOString().split("T")[0] : ""}
							onChange={(e) => handleInputChange("fechaRelacionLaboral", e.target.value ? new Date(e.target.value).toISOString() : null)}
						/>
						<InputField
							name="salarioDiario"
							label="Salario diario"
							type="number"
							value={formData.salarioDiario?.toString() || ""}
							onChange={(e) => handleInputChange("salarioDiario", e.target.value ? parseFloat(e.target.value) : null)}
						/>
						<AutocompleteSelectField
							label="Contrato"
							value={formData.claveContrato || 0}
							onChange={(value) => {
								const contrato = contratos.find((c) => c.id === value);
								handleInputChange("claveContrato", value || null);
								handleInputChange("nombreContrato", contrato?.descripcion || null);
							}}
							options={contratoOptions}
							displayField="nombre"
						/>
						<AutocompleteSelectField
							label="Regimen"
							value={formData.claveRegimen || 0}
							onChange={(value) => {
								const regimen = regimenes.find((r) => r.id === value);
								handleInputChange("claveRegimen", value || null);
								handleInputChange("nombreRegimen", regimen?.descripcion || null);
							}}
							options={regimenOptions}
							displayField="nombre"
						/>
						<AutocompleteSelectField
							label="Jornada"
							value={formData.claveJornada || 0}
							onChange={(value) => {
								const jornada = jornadas.find((j) => j.id === value);
								handleInputChange("claveJornada", value || null);
								handleInputChange("nombrejornada", jornada?.descripcion || null);
							}}
							options={jornadaOptions}
							displayField="nombre"
						/>
						<AutocompleteSelectField
							label="Riesgo"
							value={formData.claveRiesgoPuesto || 0}
							onChange={(value) => {
								const riesgo = riesgos.find((r) => r.id === value);
								handleInputChange("claveRiesgoPuesto", value || null);
								handleInputChange("nombreRiesgo", riesgo?.descripcion || null);
							}}
							options={riesgoOptions}
							displayField="nombre"
						/>
						<AutocompleteSelectField
							label="Estado"
							value={formData.claveEstado || 0}
							onChange={(value) => {
								const estado = estados.find((e) => e.ID === value);
								handleInputChange("claveEstado", value || null);
								handleInputChange("nombreEstado", estado?.nombre || null);
							}}
							options={estadoOptions}
							displayField="nombre"
						/>
					</div>
				)}
			</DialogContent>
			<DialogActions>
				<ActionButton
					icon={faSave}
					text="Guardar"
					variant="primary"
					onClick={handleSubmit}
					disabled={editarEmpleadoMutation.isPending}
					isLoading={editarEmpleadoMutation.isPending}
				/>
				<ActionButton icon={faTimes} text="Cancelar" variant="cancel" onClick={onClose} />
			</DialogActions>
		</Dialog>
	);
}

