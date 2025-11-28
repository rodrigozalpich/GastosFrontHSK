import { type JSX, useState, useEffect, useMemo } from "react";
import type { PlazaDTO } from "../../types/catalogos";
import { usePlazas } from "../../hooks/usePlazas";
import { useDivision } from "../../hooks/useDivision";
import AutocompleteSelectField from "../AutocompleteSelectField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "../ActionButton";

interface ModalPlazaProps {
	plaza: PlazaDTO | null;
	modo: "crear" | "editar" | null;
	onClose: () => void;
}

/**
 * Modal para crear o editar una plaza
 */
export default function ModalPlaza({
	plaza,
	modo,
	onClose,
}: ModalPlazaProps): JSX.Element | null {
	const { crearPlaza, actualizarPlaza, isCreating, isUpdating } = usePlazas();
	const { divisiones } = useDivision();
	const [isClosing, setIsClosing] = useState(false);

	// Estado del formulario
	const [formData, setFormData] = useState<Partial<PlazaDTO>>({
		nombrePlaza: "",
		idDivisiones: 0,
		nombreDivision: null,
		estatus: 1, // 1 = Activo por defecto
		esAutorizador: false,
		disponible: true,
		borrado: false,
	});

	// Preparar opciones de divisiones para el AutocompleteSelectField
	const divisionesOptions = useMemo(() => {
		return divisiones.map((div) => ({
			id: div.id,
			nombre: div.nombre || "",
		}));
	}, [divisiones]);

	// Función para obtener el nombre de la división por ID
	const obtenerNombreDivision = useMemo(() => {
		return (idDivision: number): string | null => {
			const division = divisiones.find((d) => d.id === idDivision);
			return division?.nombre || null;
		};
	}, [divisiones]);

	// Cargar datos de la plaza cuando se abre en modo editar
	useEffect(() => {
		if (plaza && modo === "editar") {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setFormData({
				id: plaza.id,
				nombrePlaza: plaza.nombrePlaza || "",
				idDivisiones: plaza.idDivisiones,
				nombreDivision: plaza.nombreDivision || obtenerNombreDivision(plaza.idDivisiones),
				estatus: plaza.estatus,
				esAutorizador: plaza.esAutorizador,
				disponible: plaza.disponible,
				borrado: plaza.borrado,
			});
		} else if (modo === "crear") {
			// Resetear formulario para crear
			setFormData({
				nombrePlaza: "",
				idDivisiones: 0,
				nombreDivision: null,
				estatus: 1,
				esAutorizador: false,
				disponible: true,
				borrado: false,
			});
		}
	}, [plaza, modo, obtenerNombreDivision]);

	const handleClose = () => {
		if (isClosing) return;
		setIsClosing(true);
	};

	// Mantener el modal montado durante la animación de salida
	if (!modo && !isClosing) {
		return null;
	}

	const handleDivisionChange = (idDivision: number) => {
		const nombreDivision = obtenerNombreDivision(idDivision);
		setFormData({
			...formData,
			idDivisiones: idDivision,
			nombreDivision: nombreDivision,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Asegurar que nombreDivision esté presente
		const nombreDivisionFinal =
			formData.nombreDivision || obtenerNombreDivision(formData.idDivisiones || 0);

		if (modo === "editar" && plaza) {
			const plazaActualizada: PlazaDTO = {
				...plaza,
				nombrePlaza: formData.nombrePlaza || null,
				idDivisiones: formData.idDivisiones || 0,
				nombreDivision: nombreDivisionFinal,
				estatus: formData.estatus || 1,
				esAutorizador: formData.esAutorizador || false,
				disponible: formData.disponible !== undefined ? formData.disponible : true,
				borrado: formData.borrado || false,
			};

			actualizarPlaza.mutate(plazaActualizada, {
				onSuccess: () => {
					if (!isClosing) {
						handleClose();
					}
				},
			});
		} else if (modo === "crear") {
			const nuevaPlaza: PlazaDTO = {
				id: 0,
				nombrePlaza: formData.nombrePlaza || null,
				idDivisiones: formData.idDivisiones || 0,
				nombreDivision: nombreDivisionFinal,
				estatus: formData.estatus || 1,
				fechaAlta: new Date().toISOString(),
				fechaBaja: null,
				esAutorizador: formData.esAutorizador || false,
				disponible: formData.disponible !== undefined ? formData.disponible : true,
				empleadoAsociado: null,
				borrado: false,
			};

			crearPlaza.mutate(nuevaPlaza, {
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
						{modo === "crear" && "Crear Nueva Plaza"}
						{modo === "editar" && "Editar Plaza"}
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
					{/* Nombre Plaza */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Nombre Plaza <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={formData.nombrePlaza || ""}
							onChange={(e) => setFormData({ ...formData, nombrePlaza: e.target.value })}
							required
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* División */}
					<AutocompleteSelectField
						value={formData.idDivisiones || 0}
						onChange={handleDivisionChange}
						options={divisionesOptions}
						label="División"
						required
						placeholder="Seleccione una división"
						displayField="nombre"
					/>

					{/* Es Autorizador */}
					<div className="flex items-center">
						<input
							type="checkbox"
							id="esAutorizador"
							checked={formData.esAutorizador || false}
							onChange={(e) => setFormData({ ...formData, esAutorizador: e.target.checked })}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label htmlFor="esAutorizador" className="ml-2 block text-sm text-gray-700">
							Es Autorizador
						</label>
					</div>

					{/* Disponible */}
					<div className="flex items-center">
						<input
							type="checkbox"
							id="disponible"
							checked={formData.disponible !== undefined ? formData.disponible : true}
							onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label htmlFor="disponible" className="ml-2 block text-sm text-gray-700">
							Disponible
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

