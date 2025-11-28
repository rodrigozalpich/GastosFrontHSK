import { type JSX, useState, useEffect, useMemo } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { datosEmpleadoService } from "../../services/datosEmpleadoService";
import { divisionService } from "../../services/divisionService";
import { plazaService } from "../../services/plazaService";
import { useAuthStore } from "../../store/authStore";
import { useNotificacionStore } from "../../store/notificacionStore";
import type { PlazaEmpleadoDTO, DivisionDTO, PlazaDTO } from "../../types/catalogos";
import ActionButton from "../ActionButton";
import InputField from "../InputField";
import AutocompleteSelectField from "../AutocompleteSelectField";
import { faTimes, faSave } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import CustomSwitch from "../CustomSwitch";

interface ModalAgregarPlazaProps {
	abierto: boolean;
	idEmpleado: number;
	onClose: () => void;
	onSuccess: () => void;
}

/**
 * Modal para agregar una nueva plaza a un empleado
 */
export default function ModalAgregarPlaza({
	abierto,
	idEmpleado,
	onClose,
	onSuccess,
}: ModalAgregarPlazaProps): JSX.Element {
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);
	const idEmpresa = obtenerIdEmpresa();

	const [formData, setFormData] = useState<Partial<PlazaEmpleadoDTO>>({
		idDivision: 0,
		idPlaza: 0,
		metodosPagosMultiples: false,
		tieneLimitesPersonalizados: false,
		conLimitesExtranjeros: false,
		limitePersonalizadoAlimentos: 0,
		limitePersonalizadoHospedaje: 0,
		limitePersonalizadoTransporte: 0,
		limiteExtranjeroAlimentos: 0,
		limiteExtranjeroHospedaje: 0,
		limiteExtranjeroTransporte: 0,
	});

	const { data: divisiones = [], isLoading: cargandoDivisiones } = useQuery<DivisionDTO[]>({
		queryKey: ["divisionesActivas", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await divisionService.obtenerActivos(idEmpresa);
		},
		enabled: !!idEmpresa && abierto,
	});

	const { data: plazas = [], isLoading: cargandoPlazas } = useQuery<PlazaDTO[]>({
		queryKey: ["plazasDisponibles", idEmpresa, formData.idDivision],
		queryFn: async () => {
			if (!idEmpresa || !formData.idDivision) return [];
			return await plazaService.obtenerPorDivisionDisponible(formData.idDivision, idEmpresa);
		},
		enabled: !!idEmpresa && !!formData.idDivision && abierto,
	});

	const crearPlazaMutation = useMutation({
		mutationFn: async (plaza: PlazaEmpleadoDTO) => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			return await datosEmpleadoService.crearPlazaEmpleado(plaza, idEmpresa);
		},
		onSuccess: (resultado) => {
			if (resultado) {
				mostrarNotificacion("Plaza agregada exitosamente", "success");
				onSuccess();
			} else {
				mostrarNotificacion("Ya existe esta plaza para el empleado", "warning");
			}
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al agregar plaza: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	useEffect(() => {
		if (abierto) {
			setTimeout(() => {
				setFormData({
					idDivision: 0,
					idPlaza: 0,
					metodosPagosMultiples: false,
					tieneLimitesPersonalizados: false,
					conLimitesExtranjeros: false,
					limitePersonalizadoAlimentos: 0,
					limitePersonalizadoHospedaje: 0,
					limitePersonalizadoTransporte: 0,
					limiteExtranjeroAlimentos: 0,
					limiteExtranjeroHospedaje: 0,
					limiteExtranjeroTransporte: 0,
				});
			}, 0);
		}
	}, [abierto]);

	const divisionOptions = useMemo(
		() => divisiones.map((d) => ({ id: d.id, nombre: d.nombre || "" })),
		[divisiones]
	);

	const plazaOptions = useMemo(
		() => plazas.map((p) => ({ id: p.id, nombre: p.nombrePlaza || "" })),
		[plazas]
	);

	const handleInputChange = (name: keyof PlazaEmpleadoDTO, value: string | number | boolean | null) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = () => {
		if (!formData.idDivision || !formData.idPlaza) {
			mostrarNotificacion("Debe seleccionar una división y una plaza", "warning");
			return;
		}

		const division = divisiones.find((d) => d.id === formData.idDivision);
		const plaza = plazas.find((p) => p.id === formData.idPlaza);

		const nuevaPlaza: PlazaEmpleadoDTO = {
			id: 0,
			idPlaza: formData.idPlaza!,
			idEmpleado: idEmpleado,
			idDivision: formData.idDivision!,
			estatus: 1,
			fechaAlta: new Date().toISOString(),
			fechaBaja: null,
			metodosPagosMultiples: formData.metodosPagosMultiples || false,
			limitePersonalizadoAlimentos: formData.limitePersonalizadoAlimentos || 0,
			limitePersonalizadoHospedaje: formData.limitePersonalizadoHospedaje || 0,
			limitePersonalizadoTransporte: formData.limitePersonalizadoTransporte || 0,
			conLimitesExtranjeros: formData.conLimitesExtranjeros || false,
			limiteExtranjeroAlimentos: formData.limiteExtranjeroAlimentos || 0,
			limiteExtranjeroHospedaje: formData.limiteExtranjeroHospedaje || 0,
			limiteExtranjeroTransporte: formData.limiteExtranjeroTransporte || 0,
			nombrePlaza: plaza?.nombrePlaza || "",
			nombreDivision: division?.nombre || "",
			nombreEmpleado: "",
			borrado: false,
			tieneLimitesPersonalizados: formData.tieneLimitesPersonalizados || false,
		};

		crearPlazaMutation.mutate(nuevaPlaza);
	};

	const isLoading = cargandoDivisiones || cargandoPlazas;

	return (
		<Dialog open={abierto} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>
				<div className="flex items-center justify-between">
					<span>Agregar Plaza</span>
					<ActionButton icon={faTimes} text="Cerrar" variant="cancel" onClick={onClose} showText={false} />
				</div>
			</DialogTitle>
			<DialogContent dividers>
				{isLoading ? (
					<Loader text="Cargando datos..." />
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
						<AutocompleteSelectField
							label="División"
							value={formData.idDivision || 0}
							onChange={(value) => {
								handleInputChange("idDivision", value || 0);
								handleInputChange("idPlaza", 0); // Reset plaza cuando cambia división
							}}
							options={divisionOptions}
							placeholder="Seleccione una división"
							displayField="nombre"
						/>

						<AutocompleteSelectField
							label="Plaza"
							value={formData.idPlaza || 0}
							onChange={(value) => handleInputChange("idPlaza", value || 0)}
							options={plazaOptions}
							placeholder="Seleccione una plaza"
							disabled={!formData.idDivision}
							displayField="nombre"
						/>

						<div className="md:col-span-2">
							<CustomSwitch
								checked={formData.metodosPagosMultiples || false}
								onChange={(e) => handleInputChange("metodosPagosMultiples", e.target.checked)}
								checkedText="Métodos de pago múltiples"
								uncheckedText="Método de pago único"
							/>
						</div>

						<div className="md:col-span-2">
							<CustomSwitch
								checked={formData.tieneLimitesPersonalizados || false}
								onChange={(e) => handleInputChange("tieneLimitesPersonalizados", e.target.checked)}
								checkedText="Tiene límites personalizados"
								uncheckedText="Sin límites personalizados"
							/>
						</div>

						{formData.tieneLimitesPersonalizados && (
							<>
								<InputField
									name="limitePersonalizadoAlimentos"
									label="Límite personalizado - Alimentos"
									type="number"
									value={formData.limitePersonalizadoAlimentos?.toString() || "0"}
									onChange={(e) =>
										handleInputChange("limitePersonalizadoAlimentos", parseFloat(e.target.value) || 0)
									}
								/>
								<InputField
									name="limitePersonalizadoHospedaje"
									label="Límite personalizado - Hospedaje"
									type="number"
									value={formData.limitePersonalizadoHospedaje?.toString() || "0"}
									onChange={(e) =>
										handleInputChange("limitePersonalizadoHospedaje", parseFloat(e.target.value) || 0)
									}
								/>
								<InputField
									name="limitePersonalizadoTransporte"
									label="Límite personalizado - Transporte"
									type="number"
									value={formData.limitePersonalizadoTransporte?.toString() || "0"}
									onChange={(e) =>
										handleInputChange("limitePersonalizadoTransporte", parseFloat(e.target.value) || 0)
									}
								/>
							</>
						)}

						<div className="md:col-span-2">
							<CustomSwitch
								checked={formData.conLimitesExtranjeros || false}
								onChange={(e) => handleInputChange("conLimitesExtranjeros", e.target.checked)}
								checkedText="Tiene límites extranjeros"
								uncheckedText="Sin límites extranjeros"
							/>
						</div>

						{formData.conLimitesExtranjeros && (
							<>
								<InputField
									name="limiteExtranjeroAlimentos"
									label="Límite extranjero - Alimentos"
									type="number"
									value={formData.limiteExtranjeroAlimentos?.toString() || "0"}
									onChange={(e) =>
										handleInputChange("limiteExtranjeroAlimentos", parseFloat(e.target.value) || 0)
									}
								/>
								<InputField
									name="limiteExtranjeroHospedaje"
									label="Límite extranjero - Hospedaje"
									type="number"
									value={formData.limiteExtranjeroHospedaje?.toString() || "0"}
									onChange={(e) =>
										handleInputChange("limiteExtranjeroHospedaje", parseFloat(e.target.value) || 0)
									}
								/>
								<InputField
									name="limiteExtranjeroTransporte"
									label="Límite extranjero - Transporte"
									type="number"
									value={formData.limiteExtranjeroTransporte?.toString() || "0"}
									onChange={(e) =>
										handleInputChange("limiteExtranjeroTransporte", parseFloat(e.target.value) || 0)
									}
								/>
							</>
						)}
					</div>
				)}
			</DialogContent>
			<DialogActions>
				<ActionButton
					icon={faSave}
					text="Guardar"
					variant="primary"
					onClick={handleSubmit}
					disabled={crearPlazaMutation.isPending || !formData.idDivision || !formData.idPlaza}
					isLoading={crearPlazaMutation.isPending}
				/>
				<ActionButton icon={faTimes} text="Cancelar" variant="cancel" onClick={onClose} />
			</DialogActions>
		</Dialog>
	);
}

