import { type JSX, useState, useEffect } from "react";
import type { GastoDTO } from "../types/gastos";
import { useGastos } from "../hooks/useGastos";
import { useAuthStore } from "../store/authStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useDivision } from "../hooks/useDivision";
import { useCentroCostos } from "../hooks/useCentroCostos";
import SelectCatalog from "./SelectCatalog";
import ActionButton from "./ActionButton";

interface ModalGastoProps {
	gasto: GastoDTO | null;
	modo: "crear" | "editar" | "ver" | null;
	onClose: () => void;
}

/**
 * Modal para crear, editar o ver un gasto
 *
 * @param {ModalGastoProps} props - Propiedades del modal
 * @returns {JSX.Element | null} El modal de gasto o null si no está abierto
 */
export default function ModalGasto({
	gasto,
	modo,
	onClose,
}: ModalGastoProps): JSX.Element | null {
	const { crearGasto, actualizarGasto, isCreating, isUpdating } = useGastos();
	const { obtenerIdEmpresa, permisosEspeciales } = useAuthStore();
	const idEmpresa = obtenerIdEmpresa();
	const [isClosing, setIsClosing] = useState(false);

	// Cargar catálogos
	const { divisiones } = useDivision();
	const { centrosCostos } = useCentroCostos();

	// Obtener el id del empleado del JWT
	const usuarioGastosString = permisosEspeciales?.UsuarioGastos || "";
	let idPlazaEmpleado = 0;
	try {
		if (usuarioGastosString && typeof usuarioGastosString === "string") {
			const usuarioGastosJSON = JSON.parse(usuarioGastosString);
			idPlazaEmpleado = usuarioGastosJSON?.id || 0;
		}
	} catch {
		// Si no se puede parsear, usar 0
	}

	// Estado del formulario
	const [formData, setFormData] = useState<Partial<GastoDTO>>({
		nombre: "",
		descripcion: "",
		presupuesto: 0,
		fechaInicio: new Date().toISOString().split("T")[0],
		fechaFin: null,
		esAnticipo: false,
		idPlazaEmpleado: idPlazaEmpleado,
		idDivision: 0,
		idCentroCosto: 0,
	});

	// Cargar datos del gasto cuando se abre en modo editar/ver
	useEffect(() => {
		if (gasto && (modo === "editar" || modo === "ver")) {
			setFormData({
				...gasto,
				fechaInicio:
					gasto.fechaInicio instanceof Date
						? gasto.fechaInicio.toISOString().split("T")[0]
						: new Date(gasto.fechaInicio).toISOString().split("T")[0],
				fechaFin: gasto.fechaFin
					? gasto.fechaFin instanceof Date
						? gasto.fechaFin.toISOString().split("T")[0]
						: new Date(gasto.fechaFin).toISOString().split("T")[0]
					: null,
			});
		} else if (modo === "crear") {
			// Resetear formulario para crear
			setFormData({
				nombre: "",
				descripcion: "",
				presupuesto: 0,
				fechaInicio: new Date().toISOString().split("T")[0],
				fechaFin: null,
				esAnticipo: false,
				idPlazaEmpleado: idPlazaEmpleado,
				idDivision: 0,
				idCentroCosto: 0,
			});
		}
	}, [gasto, modo, idPlazaEmpleado]);

	const handleClose = () => {
		if (isClosing) return; // Prevenir múltiples cierres
		setIsClosing(true);
		// No llamar onClose aquí, se llamará en onAnimationEnd
	};

	// Mantener el modal montado durante la animación de salida
	if (!modo && !isClosing) {
		return null;
	}

	const esModoLectura = modo === "ver";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!idEmpresa) {
			alert("Falta el ID de empresa");
			return;
		}

		// Si es edición, preservar todos los valores originales y solo actualizar los modificados
		if (modo === "editar" && gasto) {
			// Convertir fechas a string si son Date
			const fechaInicioStr = typeof formData.fechaInicio === "string" 
				? formData.fechaInicio 
				: formData.fechaInicio instanceof Date
				? formData.fechaInicio.toISOString()
				: gasto.fechaInicio instanceof Date
				? gasto.fechaInicio.toISOString()
				: gasto.fechaInicio;

			const fechaFinStr = formData.fechaFin
				? typeof formData.fechaFin === "string"
					? formData.fechaFin
					: formData.fechaFin instanceof Date
					? formData.fechaFin.toISOString()
					: null
				: gasto.fechaFin
				? gasto.fechaFin instanceof Date
					? gasto.fechaFin.toISOString()
					: gasto.fechaFin
				: null;

			// Preservar todos los valores originales y actualizar solo los modificados
			const gastoCompleto: GastoDTO = {
				...gasto, // Preservar todos los valores originales
				// Actualizar solo los campos modificados
				nombre: formData.nombre || gasto.nombre,
				descripcion: formData.descripcion !== undefined ? formData.descripcion : gasto.descripcion,
				presupuesto: formData.presupuesto !== undefined ? formData.presupuesto : gasto.presupuesto,
				fechaInicio: fechaInicioStr,
				fechaFin: fechaFinStr,
				esAnticipo: formData.esAnticipo !== undefined ? formData.esAnticipo : gasto.esAnticipo,
				idDivision: formData.idDivision !== undefined ? formData.idDivision : gasto.idDivision,
				idCentroCosto: formData.idCentroCosto !== undefined ? formData.idCentroCosto : gasto.idCentroCosto,
				fechaModificacion: new Date().toISOString(),
			};

			actualizarGasto(gastoCompleto, {
				onSuccess: () => {
					// Cerrar el modal después de que la mutación sea exitosa
					if (!isClosing) {
						handleClose();
					}
				},
			});
		} else if (modo === "crear") {
			// Para crear, usar valores por defecto
			const fechaInicioStr = typeof formData.fechaInicio === "string"
				? formData.fechaInicio
				: formData.fechaInicio instanceof Date
				? formData.fechaInicio.toISOString()
				: new Date().toISOString();

			const fechaFinStr = formData.fechaFin
				? typeof formData.fechaFin === "string"
					? formData.fechaFin
					: formData.fechaFin instanceof Date
					? formData.fechaFin.toISOString()
					: null
				: null;

			const gastoCompleto: GastoDTO = {
				id: 0,
				idPlazaEmpleado: formData.idPlazaEmpleado || idPlazaEmpleado,
				idDivision: formData.idDivision || 0,
				idCentroCosto: formData.idCentroCosto || 0,
				presupuesto: formData.presupuesto || 0,
				estatus: 1, // 1 = Abierto
				estatusSolicitud: 1, // 1 = Solicitud Iniciada
				fechaAlta: new Date().toISOString(),
				fechaModificacion: null,
				nombre: formData.nombre || "",
				descripcion: formData.descripcion || "",
				esCerrado: false,
				esPagado: false,
				fechaInicio: fechaInicioStr,
				fechaFin: fechaFinStr,
				esAnticipo: formData.esAnticipo || false,
				idArchivoJustificante: null,
				descripArchivoJustificante: null,
				pendientePago: true, // En Angular se establece como true al crear
				fechaCierre: null,
				timbrado: false,
				borrado: false,
				nivelSiguiente: 1, // En Angular se inicializa en 1 para nuevo gasto
				autorizador: "",
				idAutorizador: 0,
				nivelAutorizador: 0,
				validacionAutorizacion: false, // No nullable en backend
				devolucionTotal: 0,
				esDevolucion: false, // No nullable en backend
				remanente: 0,
				nivelMaximo: false, // No nullable en backend (aunque el tipo permite null, el modelo C# es bool)
				nombreASiguiente: [],
				siguienteAutorizador: "",
				editarRechazado: null,
				devolucionPagada: false, // No nullable en backend
				tienePolizaDiario: false,
				tienePolizaIngreso: false,
				tienePolizaEgreso: false,
				seleccionado: false,
				nombreEmpleado: "",
				esPrimeraVuelta: false, // No nullable en backend
				notieneCFDI: false,
				aceptado: 0,
				tieneDevolucion: false,
				editable: false, // En Angular se inicializa como false
			};

			crearGasto(gastoCompleto, {
				onSuccess: () => {
					// Cerrar el modal después de que la mutación sea exitosa
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
					// Solo procesar el evento del elemento principal, no de los hijos
					if (e.currentTarget === e.target && isClosing) {
						// Pequeño delay para asegurar que la animación visual termine
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
						{modo === "crear" && "Crear Nuevo Gasto"}
						{modo === "editar" && "Editar Gasto"}
						{modo === "ver" && "Ver Detalles del Gasto"}
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
							disabled={esModoLectura}
							required
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</div>

					{/* Descripción */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Descripción
						</label>
						<textarea
							value={formData.descripcion || ""}
							onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
							disabled={esModoLectura}
							rows={3}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</div>

					{/* Presupuesto */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Presupuesto <span className="text-red-500">*</span>
						</label>
						<input
							type="number"
							step="0.01"
							min="0"
							value={formData.presupuesto || 0}
							onChange={(e) =>
								setFormData({ ...formData, presupuesto: parseFloat(e.target.value) || 0 })
							}
							disabled={esModoLectura}
							required
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</div>

					{/* Fecha Inicio */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Fecha Inicio <span className="text-red-500">*</span>
						</label>
						<input
							type="date"
							value={
								typeof formData.fechaInicio === "string"
									? formData.fechaInicio
									: formData.fechaInicio instanceof Date
									? formData.fechaInicio.toISOString().split("T")[0]
									: ""
							}
							onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
							disabled={esModoLectura}
							required
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</div>

					{/* Fecha Fin */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
						<input
							type="date"
							value={
								formData.fechaFin
									? typeof formData.fechaFin === "string"
										? formData.fechaFin
										: formData.fechaFin instanceof Date
										? formData.fechaFin.toISOString().split("T")[0]
										: ""
									: ""
							}
							onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value || null })}
							disabled={esModoLectura}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</div>

					{/* Es Anticipo */}
					<div className="flex items-center">
						<input
							type="checkbox"
							id="esAnticipo"
							checked={formData.esAnticipo || false}
							onChange={(e) => setFormData({ ...formData, esAnticipo: e.target.checked })}
							disabled={esModoLectura}
							className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
						/>
						<label htmlFor="esAnticipo" className="ml-2 text-sm text-gray-700">
							Es Anticipo
						</label>
					</div>

					{/* División y Centro de Costo */}
					<div className="grid grid-cols-2 gap-4">
						<SelectCatalog
							value={formData.idDivision || 0}
							onChange={(value) => setFormData({ ...formData, idDivision: value })}
							options={divisiones as unknown as Array<{ id: number; [key: string]: unknown }>}
							label="División"
							required
							disabled={esModoLectura}
							placeholder="Seleccione una división"
							displayField="nombre"
						/>
						<SelectCatalog
							value={formData.idCentroCosto || 0}
							onChange={(value) => setFormData({ ...formData, idCentroCosto: value })}
							options={centrosCostos as unknown as Array<{ id: number; [key: string]: unknown }>}
							label="Centro de Costo"
							required
							disabled={esModoLectura}
							placeholder="Seleccione un centro de costo"
							displayField="nombre"
						/>
					</div>

					{/* Botones */}
					{!esModoLectura && (
						<div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
							<ActionButton
								variant="secondary"
								type="button"
								onClick={handleClose}
								text="Cancelar"
							/>
							<ActionButton
								variant="primary"
								type="submit"
								text={modo === "crear" ? "Crear" : "Guardar"}
								isLoading={isCreating || isUpdating}
								loadingText="Guardando..."
								disabled={isCreating || isUpdating}
							/>
						</div>
					)}

					{esModoLectura && (
						<div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
							<ActionButton
								variant="primary"
								type="button"
								onClick={handleClose}
								text="Cerrar"
							/>
						</div>
					)}
				</form>
			</div>
		</div>
	);
}

