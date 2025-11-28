import { type JSX, useState, useEffect } from "react";
import type { CentroCostoDTO } from "../../types/catalogos";
import { useCentroCostos } from "../../hooks/useCentroCostos";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "../ActionButton";

interface ModalCentroCostoProps {
	centroCosto: CentroCostoDTO | null;
	modo: "crear" | "editar" | null;
	onClose: () => void;
}

/**
 * Modal para crear o editar un centro de costo
 */
export default function ModalCentroCosto({
	centroCosto,
	modo,
	onClose,
}: ModalCentroCostoProps): JSX.Element | null {
	const { crearCentroCosto, actualizarCentroCosto, isCreating, isUpdating } = useCentroCostos();
	const [isClosing, setIsClosing] = useState(false);

	// Estado del formulario
	const [formData, setFormData] = useState<Partial<CentroCostoDTO>>({
		nombre: "",
		codigo: "",
		estatus: 1, // 1 = Activo por defecto
		borrado: false,
	});

	// Cargar datos del centro de costo cuando se abre en modo editar
	useEffect(() => {
		if (centroCosto && modo === "editar") {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setFormData({
				id: centroCosto.id,
				nombre: centroCosto.nombre || "",
				codigo: centroCosto.codigo || "",
				estatus: centroCosto.estatus,
				borrado: centroCosto.borrado,
			});
		} else if (modo === "crear") {
			// Resetear formulario para crear
			 
			setFormData({
				nombre: "",
				codigo: "",
				estatus: 1,
				borrado: false,
			});
		}
	}, [centroCosto, modo]);

	const handleClose = () => {
		if (isClosing) return;
		setIsClosing(true);
	};

	// Mantener el modal montado durante la animación de salida
	if (!modo && !isClosing) {
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (modo === "editar" && centroCosto) {
			const centroCostoActualizado: CentroCostoDTO = {
				...centroCosto,
				nombre: formData.nombre || null,
				codigo: formData.codigo || null,
				estatus: formData.estatus || 1,
				borrado: formData.borrado || false,
			};

			actualizarCentroCosto.mutate(centroCostoActualizado, {
				onSuccess: () => {
					if (!isClosing) {
						handleClose();
					}
				},
			});
		} else if (modo === "crear") {
			const nuevoCentroCosto: CentroCostoDTO = {
				id: 0,
				nombre: formData.nombre || null,
				codigo: formData.codigo || null,
				estatus: formData.estatus || 1,
				fechaAlta: new Date().toISOString(),
				fechaBaja: null,
				borrado: false,
			};

			crearCentroCosto.mutate(nuevoCentroCosto, {
				onSuccess: () => {
					if (!isClosing) {
						handleClose();
					}
				},
			});
		}
	};

	return (
		<div
			className={`fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
				isClosing ? "animate-modal-overlay-out" : "animate-modal-overlay-in"
			}`}
			onClick={handleClose}
		>
			<div
				className={`bg-white rounded-lg shadow-xl max-w-md w-full ${
					isClosing ? "animate-modal-content-out" : "animate-modal-content-in"
				}`}
				onClick={(e) => e.stopPropagation()}
				onAnimationEnd={(e) => {
					if (e.currentTarget === e.target && isClosing) {
						setTimeout(() => {
							setIsClosing(false);
							onClose();
						}, 50);
					}
				}}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-bold text-gray-900">
						{modo === "crear" && "Crear Nuevo Centro de Costo"}
						{modo === "editar" && "Editar Centro de Costo"}
					</h2>
					<button
						onClick={handleClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Cerrar"
					>
						<FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
					</button>
				</div>

				{/* Formulario */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					{/* Nombre */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Nombre <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={formData.nombre || ""}
							onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
							required
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Código */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
						<input
							type="text"
							value={formData.codigo || ""}
							onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Estatus */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Estatus <span className="text-red-500">*</span>
						</label>
						<select
							value={formData.estatus || 1}
							onChange={(e) => setFormData({ ...formData, estatus: parseInt(e.target.value, 10) })}
							required
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value={1}>Activo</option>
							<option value={0}>Inactivo</option>
						</select>
					</div>

					{/* Botones */}
					<div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
						<ActionButton
							variant="cancel"
							type="button"
							onClick={handleClose}
							text="Cancelar"
						/>
						<ActionButton
							variant="submit"
							type="submit"
							text={modo === "crear" ? "Crear" : "Guardar"}
							isLoading={isCreating || isUpdating}
							loadingText="Guardando..."
							disabled={isCreating || isUpdating}
						/>
					</div>
				</form>
			</div>
		</div>
	);
}

