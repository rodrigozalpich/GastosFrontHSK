import { type JSX, useState, useEffect } from "react";
import type { PolizaGastosDTO } from "../../types/gastos";
import { usePolizas } from "../../hooks/usePolizas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "../ActionButton";

interface ModalPolizaProps {
	poliza: PolizaGastosDTO | null;
	modo: "crear" | "editar" | null;
	onClose: () => void;
}

/**
 * Modal para crear o editar una póliza
 */
export default function ModalPoliza({
	poliza,
	modo,
	onClose,
}: ModalPolizaProps): JSX.Element | null {
	const { crearPoliza, actualizarPoliza, isCreating, isUpdating } = usePolizas();
	const [isClosing, setIsClosing] = useState(false);

	// Estado del formulario
	const [formData, setFormData] = useState<Partial<PolizaGastosDTO>>({
		idGasto: 0,
		descripcion: "",
		fechaPoliza: new Date().toISOString().split("T")[0],
		totalAbono: 0,
		totalCargo: 0,
		numeroPoliza: 0,
		tipoPoliza: 1, // 1 = Ingreso por defecto
		esSap: false,
		fechaEnvioSap: null,
	});

	// Cargar datos de la póliza cuando se abre en modo editar
	useEffect(() => {
		if (poliza && modo === "editar") {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setFormData({
				id: poliza.id,
				idGasto: poliza.idGasto,
				descripcion: poliza.descripcion,
				fechaPoliza: typeof poliza.fechaPoliza === "string" 
					? poliza.fechaPoliza.split("T")[0] 
					: new Date(poliza.fechaPoliza).toISOString().split("T")[0],
				totalAbono: poliza.totalAbono,
				totalCargo: poliza.totalCargo,
				numeroPoliza: poliza.numeroPoliza,
				tipoPoliza: poliza.tipoPoliza,
				esSap: poliza.esSap,
				fechaEnvioSap: poliza.fechaEnvioSap 
					? (typeof poliza.fechaEnvioSap === "string" 
						? poliza.fechaEnvioSap.split("T")[0] 
						: new Date(poliza.fechaEnvioSap).toISOString().split("T")[0])
					: null,
			});
		} else if (modo === "crear") {
			// Resetear formulario para crear
			 
			setFormData({
				idGasto: 0,
				descripcion: "",
				fechaPoliza: new Date().toISOString().split("T")[0],
				totalAbono: 0,
				totalCargo: 0,
				numeroPoliza: 0,
				tipoPoliza: 1,
				esSap: false,
				fechaEnvioSap: null,
			});
		}
	}, [poliza, modo]);

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

		if (modo === "editar" && poliza) {
			const polizaActualizada: PolizaGastosDTO = {
				...poliza,
				idGasto: formData.idGasto || 0,
				descripcion: formData.descripcion || "",
				fechaPoliza: formData.fechaPoliza 
					? new Date(formData.fechaPoliza).toISOString()
					: new Date().toISOString(),
				totalAbono: formData.totalAbono || 0,
				totalCargo: formData.totalCargo || 0,
				numeroPoliza: formData.numeroPoliza || 0,
				tipoPoliza: formData.tipoPoliza || 1,
				esSap: formData.esSap || false,
				fechaEnvioSap: formData.fechaEnvioSap 
					? new Date(formData.fechaEnvioSap).toISOString()
					: null,
			};

			actualizarPoliza.mutate(polizaActualizada, {
				onSuccess: () => {
					if (!isClosing) {
						handleClose();
					}
				},
			});
		} else if (modo === "crear") {
			const nuevaPoliza: PolizaGastosDTO = {
				id: 0,
				idGasto: formData.idGasto || 0,
				descripcion: formData.descripcion || "",
				fechaPoliza: formData.fechaPoliza 
					? new Date(formData.fechaPoliza).toISOString()
					: new Date().toISOString(),
				totalAbono: formData.totalAbono || 0,
				totalCargo: formData.totalCargo || 0,
				numeroPoliza: formData.numeroPoliza || 0,
				tipoPoliza: formData.tipoPoliza || 1,
				fechaAlta: new Date().toISOString(),
				esSap: formData.esSap || false,
				fechaEnvioSap: formData.fechaEnvioSap 
					? new Date(formData.fechaEnvioSap).toISOString()
					: null,
			};

			crearPoliza.mutate(nuevaPoliza, {
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
				className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
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
						{modo === "crear" && "Crear Nueva Póliza"}
						{modo === "editar" && "Editar Póliza"}
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
					<div className="grid grid-cols-2 gap-4">
						{/* ID Gasto */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								ID Gasto <span className="text-red-500">*</span>
							</label>
							<input
								type="number"
								value={formData.idGasto || ""}
								onChange={(e) => setFormData({ ...formData, idGasto: parseInt(e.target.value, 10) || 0 })}
								required
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						{/* Número de Póliza */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Número de Póliza <span className="text-red-500">*</span>
							</label>
							<input
								type="number"
								value={formData.numeroPoliza || ""}
								onChange={(e) => setFormData({ ...formData, numeroPoliza: parseInt(e.target.value, 10) || 0 })}
								required
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					{/* Descripción */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Descripción <span className="text-red-500">*</span>
						</label>
						<textarea
							value={formData.descripcion || ""}
							onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
							required
							rows={3}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						{/* Fecha de Póliza */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Fecha de Póliza <span className="text-red-500">*</span>
							</label>
							<input
								type="date"
								value={formData.fechaPoliza ? (typeof formData.fechaPoliza === "string" ? formData.fechaPoliza.split("T")[0] : new Date(formData.fechaPoliza).toISOString().split("T")[0]) : ""}
								onChange={(e) => setFormData({ ...formData, fechaPoliza: e.target.value })}
								required
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						{/* Tipo de Póliza */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Tipo de Póliza <span className="text-red-500">*</span>
							</label>
							<select
								value={formData.tipoPoliza || 1}
								onChange={(e) => setFormData({ ...formData, tipoPoliza: parseInt(e.target.value, 10) })}
								required
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value={1}>Ingreso</option>
								<option value={2}>Egreso</option>
								<option value={3}>Diario</option>
							</select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						{/* Total Abono */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Total Abono <span className="text-red-500">*</span>
							</label>
							<input
								type="number"
								step="0.01"
								value={formData.totalAbono || ""}
								onChange={(e) => setFormData({ ...formData, totalAbono: parseFloat(e.target.value) || 0 })}
								required
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						{/* Total Cargo */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Total Cargo <span className="text-red-500">*</span>
							</label>
							<input
								type="number"
								step="0.01"
								value={formData.totalCargo || ""}
								onChange={(e) => setFormData({ ...formData, totalCargo: parseFloat(e.target.value) || 0 })}
								required
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					{/* Es SAP */}
					<div className="flex items-center">
						<input
							type="checkbox"
							id="esSap"
							checked={formData.esSap || false}
							onChange={(e) => setFormData({ ...formData, esSap: e.target.checked })}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label htmlFor="esSap" className="ml-2 block text-sm text-gray-700">
							Enviado a SAP
						</label>
					</div>

					{/* Fecha Envío SAP */}
					{formData.esSap && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Fecha Envío SAP
							</label>
							<input
								type="date"
								value={formData.fechaEnvioSap ? (typeof formData.fechaEnvioSap === "string" ? formData.fechaEnvioSap.split("T")[0] : new Date(formData.fechaEnvioSap).toISOString().split("T")[0]) : ""}
								onChange={(e) => setFormData({ ...formData, fechaEnvioSap: e.target.value || null })}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					)}

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

