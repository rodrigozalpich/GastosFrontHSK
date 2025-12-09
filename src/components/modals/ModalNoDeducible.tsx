import { type JSX, useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import { gastoService } from "../../services/gastoService";
import { useAuthStore } from "../../store/authStore";
import { useNotificacionStore } from "../../store/notificacionStore";
import SelectCatalog from "../SelectCatalog";
import ActionButton from "../ActionButton";

interface ModalNoDeducibleProps {
	abierto: boolean;
	idGasto: number;
	idPlazaEmpleado: number;
	idCentroCosto: number;
	onClose: () => void;
	onSuccess?: () => void;
}

/**
 * Modal para agregar comprobantes sin factura (no deducibles)
 */
export default function ModalNoDeducible({
	abierto,
	idGasto,
	idPlazaEmpleado,
	idCentroCosto,
	onClose,
	onSuccess,
}: ModalNoDeducibleProps): JSX.Element | null {
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore(
		(state) => state.mostrarNotificacion
	);
	const idEmpresa = obtenerIdEmpresa();
	const [isClosing, setIsClosing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Estado del formulario
	const [formData, setFormData] = useState({
		esExtranjero: false,
		concepto: "",
		total: 0,
		observaciones: "",
		idCuentaContable: 0,
		archivo: null as File | null,
	});

	// Obtener cuentas contables no deducibles
	const { data: cuentasContables, isLoading: isLoadingCuentas } = useQuery({
		queryKey: ["cuentasContablesNoDeducible", idPlazaEmpleado, idEmpresa],
		queryFn: async () => {
			if (!idPlazaEmpleado || !idEmpresa) {
				return [];
			}
			return await gastoService.obtenerCuentaContableNoDeducible(
				idPlazaEmpleado,
				idEmpresa
			);
		},
		enabled: abierto && !!idPlazaEmpleado && !!idEmpresa,
	});

	// Resetear estado cuando se cierra el modal
	useEffect(() => {
		if (!abierto) {
			setFormData({
				esExtranjero: false,
				concepto: "",
				total: 0,
				observaciones: "",
				idCuentaContable: 0,
				archivo: null,
			});
			setIsClosing(false);
		}
	}, [abierto]);

	const handleClose = () => {
		if (isClosing) return;
		setIsClosing(true);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setFormData({ ...formData, archivo: e.target.files[0] });
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.concepto.trim()) {
			mostrarNotificacion("El concepto es requerido", "warning");
			return;
		}

		if (formData.total <= 0) {
			mostrarNotificacion("El total debe ser mayor a cero", "warning");
			return;
		}

		if (formData.idCuentaContable === 0) {
			mostrarNotificacion("Debe seleccionar una cuenta contable", "warning");
			return;
		}

		if (!formData.archivo) {
			mostrarNotificacion("Debe seleccionar un archivo", "warning");
			return;
		}

		if (!idEmpresa) {
			mostrarNotificacion("Error: falta el ID de empresa", "error");
			return;
		}

		setIsSubmitting(true);
		try {
			await gastoService.registrarNoDeducible(
				{
					esExtranjero: formData.esExtranjero,
					concepto: formData.concepto,
					total: formData.total,
					observaciones: formData.observaciones,
					idCuentaContable: formData.idCuentaContable,
					idGasto,
					idCentroCosto,
					archivo: formData.archivo,
				},
				idEmpresa
			);

			mostrarNotificacion("Comprobante registrado exitosamente", "success");
			if (onSuccess) {
				onSuccess();
			}
			setTimeout(() => {
				handleClose();
			}, 1000);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Error al registrar el comprobante";
			mostrarNotificacion(errorMessage, "error");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!abierto && !isClosing) {
		return null;
	}

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
					<h2 className="text-xl font-bold text-gray-900">Agregar no deducibles</h2>
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
					{/* Es extranjero */}
					<div className="flex items-center">
						<input
							type="checkbox"
							id="esExtranjero"
							checked={formData.esExtranjero}
							onChange={(e) =>
								setFormData({ ...formData, esExtranjero: e.target.checked })
							}
							className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
						/>
						<label htmlFor="esExtranjero" className="ml-2 text-sm text-gray-700">
							¿Es extranjero?
						</label>
					</div>

					{/* Concepto */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Concepto
						</label>
						<input
							type="text"
							value={formData.concepto}
							onChange={(e) =>
								setFormData({ ...formData, concepto: e.target.value })
							}
							required
							className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Total */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Total $ MXN
						</label>
						<input
							type="number"
							step="0.01"
							min="0"
							value={formData.total || ""}
							onChange={(e) =>
								setFormData({
									...formData,
									total: parseFloat(e.target.value) || 0,
								})
							}
							required
							className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Observaciones */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Observaciones
						</label>
						<textarea
							value={formData.observaciones}
							onChange={(e) =>
								setFormData({ ...formData, observaciones: e.target.value })
							}
							rows={3}
							className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Selección de archivo */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Elegir archivo
						</label>
						<div className="flex items-center gap-4">
							<input
								ref={fileInputRef}
								type="file"
								accept=".pdf,.jpg,.jpeg,.png"
								onChange={handleFileChange}
								className="hidden"
							/>
							<ActionButton
								variant="primary"
								type="button"
								onClick={() => fileInputRef.current?.click()}
								text="Seleccionar archivo"
								className="bg-blue-500 hover:bg-blue-600 text-white"
							/>
							<span className="text-sm text-gray-600">
								{formData.archivo
									? formData.archivo.name
									: "Sin archivos seleccionados"}
							</span>
						</div>
					</div>

					{/* Cuenta contable */}
					<div>
						<SelectCatalog
							value={formData.idCuentaContable}
							onChange={(value) =>
								setFormData({ ...formData, idCuentaContable: value })
							}
							options={
								(cuentasContables as unknown as Array<{
									id: number;
									[key: string]: unknown;
								}>) || []
							}
							label="Cuenta contable"
							required
							disabled={isLoadingCuentas}
							placeholder="--Selecciona una cuenta--"
							displayField="nombre"
						/>
					</div>

					{/* Botones */}
					<div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
						<ActionButton
							variant="secondary"
							type="button"
							onClick={handleClose}
							text="Cancelar"
							disabled={isSubmitting}
						/>
						<ActionButton
							variant="primary"
							type="submit"
							text="Aceptar"
							isLoading={isSubmitting}
							loadingText="Guardando..."
							disabled={isSubmitting}
							className="bg-teal-500 hover:bg-teal-600 text-white"
						/>
					</div>
				</form>
			</div>
		</div>
	);
}

