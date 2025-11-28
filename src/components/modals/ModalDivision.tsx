import { type JSX, useState, useEffect } from "react";
import type { DivisionDTO } from "../../types/catalogos";
import { useDivision } from "../../hooks/useDivision";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "../ActionButton";

interface ModalDivisionProps {
	division: DivisionDTO | null;
	modo: "crear" | "editar" | null;
	onClose: () => void;
}

/**
 * Modal para crear o editar una división
 */
export default function ModalDivision({
	division,
	modo,
	onClose,
}: ModalDivisionProps): JSX.Element | null {
	const { crearDivision, actualizarDivision, isCreating, isUpdating } = useDivision();
	const [isClosing, setIsClosing] = useState(false);

	// Estado del formulario
	const [formData, setFormData] = useState<Partial<DivisionDTO>>({
		nombre: "",
		codigoSAP: "",
		registroPatronal: "",
		estatus: 1, // 1 = Activo por defecto
		asignaAC: false,
		borrado: false,
	});

	// Cargar datos de la división cuando se abre en modo editar
	useEffect(() => {
		if (division && modo === "editar") {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setFormData({
				id: division.id,
				nombre: division.nombre || "",
				codigoSAP: division.codigoSAP || "",
				registroPatronal: division.registroPatronal || "",
				estatus: division.estatus,
				asignaAC: division.asignaAC,
				borrado: division.borrado,
			});
		} else if (modo === "crear") {
			// Resetear formulario para crear
			 
			setFormData({
				nombre: "",
				codigoSAP: "",
				registroPatronal: "",
				estatus: 1,
				asignaAC: false,
				borrado: false,
			});
		}
	}, [division, modo]);

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

		if (modo === "editar" && division) {
			const divisionActualizada: DivisionDTO = {
				...division,
				nombre: formData.nombre || null,
				codigoSAP: formData.codigoSAP || null,
				registroPatronal: formData.registroPatronal || null,
				estatus: formData.estatus || 1,
				asignaAC: formData.asignaAC || false,
				borrado: formData.borrado || false,
			};

			actualizarDivision.mutate(divisionActualizada, {
				onSuccess: () => {
					if (!isClosing) {
						handleClose();
					}
				},
			});
		} else if (modo === "crear") {
			const nuevaDivision: DivisionDTO = {
				id: 0,
				nombre: formData.nombre || null,
				codigoSAP: formData.codigoSAP || null,
				registroPatronal: formData.registroPatronal || null,
				estatus: formData.estatus || 1,
				asignaAC: formData.asignaAC || false,
				fechaAlta: new Date().toISOString(),
				fechaBaja: null,
				borrado: false,
			};

			crearDivision.mutate(nuevaDivision, {
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
				className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
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
						{modo === "crear" && "Crear Nueva División"}
						{modo === "editar" && "Editar División"}
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

					{/* Código SAP */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Código SAP</label>
						<input
							type="text"
							value={formData.codigoSAP || ""}
							onChange={(e) => setFormData({ ...formData, codigoSAP: e.target.value })}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Registro Patronal */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Registro Patronal</label>
						<input
							type="text"
							value={formData.registroPatronal || ""}
							onChange={(e) => setFormData({ ...formData, registroPatronal: e.target.value })}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Asigna AC */}
					<div className="flex items-center">
						<input
							type="checkbox"
							id="asignaAC"
							checked={formData.asignaAC || false}
							onChange={(e) => setFormData({ ...formData, asignaAC: e.target.checked })}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label htmlFor="asignaAC" className="ml-2 block text-sm text-gray-700">
							Asigna AC
						</label>
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

