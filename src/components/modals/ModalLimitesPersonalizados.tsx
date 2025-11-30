import { type JSX, useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { datosEmpleadoService } from "../../services/datosEmpleadoService";
import { useAuthStore } from "../../store/authStore";
import { useNotificacionStore } from "../../store/notificacionStore";
import type { PlazaEmpleadoDTO } from "../../types/catalogos";
import ActionButton from "../ActionButton";
import InputField from "../InputField";
import { faTimes, faSave } from "@fortawesome/free-solid-svg-icons";
import { formatearMoneda } from "../../helpers/formatHelpers";

interface ModalLimitesPersonalizadosProps {
	abierto: boolean;
	plazaEmpleado: PlazaEmpleadoDTO;
	onClose: () => void;
	onSuccess: () => void;
}

/**
 * Modal para editar límites personalizados de una plaza
 */
export default function ModalLimitesPersonalizados({
	abierto,
	plazaEmpleado,
	onClose,
	onSuccess,
}: ModalLimitesPersonalizadosProps): JSX.Element {
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);
	const idEmpresa = obtenerIdEmpresa();

	const [formData, setFormData] = useState<PlazaEmpleadoDTO>(plazaEmpleado);

	useEffect(() => {
		if (abierto) {
			setTimeout(() => {
				setFormData(plazaEmpleado);
			}, 0);
		}
	}, [abierto, plazaEmpleado]);

	const editarLimitesMutation = useMutation({
		mutationFn: async (plaza: PlazaEmpleadoDTO) => {
			if (!idEmpresa) throw new Error("Falta el ID de empresa");
			// Limpiar campos que no deben enviarse
			const plazaActualizada = {
				...plaza,
				nombreDivision: "",
				nombrePlaza: "",
				nombreEmpleado: "",
				tieneLimitesPersonalizados: true,
			};
			return await datosEmpleadoService.editarLimites(plazaActualizada, idEmpresa);
		},
    onSuccess: () => {
      mostrarNotificacion("Límites personalizados actualizados exitosamente", "success");
      onSuccess();
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al actualizar límites: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const handleInputChange = (name: keyof PlazaEmpleadoDTO, value: number) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = () => {
		editarLimitesMutation.mutate(formData);
	};

	return (
		<Dialog open={abierto} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				<div className="flex items-center justify-between">
					<span>Editar Límites Personalizados</span>
					<ActionButton icon={faTimes} text="Cerrar" variant="cancel" onClick={onClose} showText={false} />
				</div>
			</DialogTitle>
			<DialogContent dividers>
				<div className="p-4 space-y-4">
					<div>
						<p className="text-sm text-gray-600 mb-2">
							Plaza: <strong>{plazaEmpleado.nombrePlaza}</strong>
						</p>
						<p className="text-sm text-gray-600 mb-4">
							División: <strong>{plazaEmpleado.nombreDivision}</strong>
						</p>
					</div>

					<InputField
						name="limitePersonalizadoAlimentos"
						label="Límite Personalizado - Alimentos"
						type="number"
						value={formData.limitePersonalizadoAlimentos?.toString() || "0"}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("limitePersonalizadoAlimentos", parseFloat(e.target.value) || 0)}
						helperText={`Valor actual: ${formatearMoneda(formData.limitePersonalizadoAlimentos || 0)}`}
					/>

					<InputField
						name="limitePersonalizadoHospedaje"
						label="Límite Personalizado - Hospedaje"
						type="number"
						value={formData.limitePersonalizadoHospedaje?.toString() || "0"}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("limitePersonalizadoHospedaje", parseFloat(e.target.value) || 0)}
						helperText={`Valor actual: ${formatearMoneda(formData.limitePersonalizadoHospedaje || 0)}`}
					/>

					<InputField
						name="limitePersonalizadoTransporte"
						label="Límite Personalizado - Transporte"
						type="number"
						value={formData.limitePersonalizadoTransporte?.toString() || "0"}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("limitePersonalizadoTransporte", parseFloat(e.target.value) || 0)}
						helperText={`Valor actual: ${formatearMoneda(formData.limitePersonalizadoTransporte || 0)}`}
					/>
				</div>
			</DialogContent>
			<DialogActions>
				<ActionButton
					icon={faSave}
					text="Guardar"
					variant="primary"
					onClick={handleSubmit}
					disabled={editarLimitesMutation.isPending}
					isLoading={editarLimitesMutation.isPending}
				/>
				<ActionButton icon={faTimes} text="Cancelar" variant="cancel" onClick={onClose} />
			</DialogActions>
		</Dialog>
	);
}

