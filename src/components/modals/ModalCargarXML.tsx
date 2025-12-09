import { type JSX, useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import { gastoService } from "../../services/gastoService";
import { datosEmpleadoService } from "../../services/datosEmpleadoService";
import { useAuthStore } from "../../store/authStore";
import { useNotificacionStore } from "../../store/notificacionStore";
import AutocompleteSelectField from "../AutocompleteSelectField";
import ActionButton from "../ActionButton";
import type { RespuestaMultipleDTO } from "../../types/utilidades";
import type { PlazaEmpleadoDTO } from "../../types/catalogos";

interface ModalCargarXMLProps {
	abierto: boolean;
	idGasto: number;
	idDivision: number;
	idPlazaEmpleado: number;
	idCentroCosto: number;
	onClose: () => void;
	onSuccess?: () => void;
}

/**
 * Modal para cargar archivos XML y PDF de facturas y compartir el gasto con empleados
 */
export default function ModalCargarXML({
	abierto,
	idGasto,
	idDivision,
	idPlazaEmpleado,
	idCentroCosto,
	onClose,
	onSuccess,
}: ModalCargarXMLProps): JSX.Element | null {
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore(
		(state) => state.mostrarNotificacion
	);
	const idEmpresa = obtenerIdEmpresa();
	const [isClosing, setIsClosing] = useState(false);
	const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
	const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState<number[]>([]);
	const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number>(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [resultadoValidacion, setResultadoValidacion] = useState<RespuestaMultipleDTO | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Obtener empleados por división
	const { data: empleados, isLoading: isLoadingEmpleados } = useQuery({
		queryKey: ["empleadosPorDivision", idDivision, idPlazaEmpleado, idEmpresa],
		queryFn: async () => {
			if (!idDivision || !idEmpresa) {
				return [];
			}
			return await datosEmpleadoService.obtenerPaginadoPlazaEmpleadoxDivision(
				idDivision,
				idEmpresa,
				idPlazaEmpleado
			);
		},
		enabled: abierto && !!idDivision && !!idEmpresa,
	});

	// Resetear estado cuando se cierra el modal
	useEffect(() => {
		if (!abierto) {
			setArchivosSeleccionados([]);
			setEmpleadosSeleccionados([]);
			setEmpleadoSeleccionado(0);
			setResultadoValidacion(null);
			setIsClosing(false);
		}
	}, [abierto]);

	const handleClose = () => {
		if (isClosing) return;
		setIsClosing(true);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArray = Array.from(e.target.files);
			setArchivosSeleccionados(filesArray);
		}
	};

	const handleAgregarEmpleado = () => {
		if (empleadoSeleccionado && empleadoSeleccionado !== 0) {
			if (!empleadosSeleccionados.includes(empleadoSeleccionado)) {
				setEmpleadosSeleccionados([...empleadosSeleccionados, empleadoSeleccionado]);
				setEmpleadoSeleccionado(0);
			} else {
				mostrarNotificacion("El empleado ya está agregado", "warning");
			}
		}
	};

	const handleEliminarEmpleado = (idEmpleado: number) => {
		setEmpleadosSeleccionados(
			empleadosSeleccionados.filter((id) => id !== idEmpleado)
		);
	};

	const handleSubmit = async () => {
		if (archivosSeleccionados.length === 0) {
			mostrarNotificacion("Debe seleccionar al menos un archivo", "warning");
			return;
		}

		if (!idEmpresa) {
			mostrarNotificacion("Error: falta el ID de empresa", "error");
			return;
		}

		setIsSubmitting(true);
		try {
			const respuesta = await gastoService.cargaFactura(
				archivosSeleccionados,
				idEmpresa,
				idGasto,
				idCentroCosto,
				empleadosSeleccionados
			);

			setResultadoValidacion(respuesta);

			// Verificar si hay errores
			const tieneErrores = respuesta.estatus.some((estatus) => !estatus);
			
			if (tieneErrores) {
				mostrarNotificacion("Se encontraron errores al validar los archivos", "error");
			} else {
				mostrarNotificacion("Archivos cargados exitosamente", "success");
				if (onSuccess) {
					onSuccess();
				}
				// Cerrar el modal después de un breve delay
				setTimeout(() => {
					handleClose();
				}, 1500);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Error al cargar los archivos";
			mostrarNotificacion(errorMessage, "error");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!abierto && !isClosing) {
		return null;
	}

	const obtenerNombreEmpleado = (idEmpleado: number): string => {
		const empleado = empleados?.find((emp) => emp.id === idEmpleado);
		return empleado?.nombreEmpleado || `ID: ${idEmpleado}`;
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
					<h2 className="text-xl font-bold text-gray-900">Cargar XML</h2>
					<button
						onClick={handleClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Cerrar"
					>
						<FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
					</button>
				</div>

				{/* Contenido */}
				<div className="p-6 space-y-6">
					{/* Selección de archivos */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Elegir archivo
						</label>
						<div className="flex items-center gap-4">
							<input
								ref={fileInputRef}
								type="file"
								multiple
								accept=".xml,.pdf"
								onChange={handleFileChange}
								className="hidden"
							/>
							<ActionButton
								variant="primary"
								type="button"
								onClick={() => fileInputRef.current?.click()}
								text="Elegir archivos"
								className="bg-blue-500 hover:bg-blue-600 text-white"
							/>
							<span className="text-sm text-gray-600">
								{archivosSeleccionados.length > 0
									? `${archivosSeleccionados.length} archivo(s) seleccionado(s)`
									: "Sin archivos seleccionados"}
							</span>
						</div>
						{archivosSeleccionados.length > 0 && (
							<div className="mt-2 space-y-1">
								{archivosSeleccionados.map((archivo, index) => (
									<div key={index} className="text-sm text-gray-600">
										• {archivo.name}
									</div>
								))}
							</div>
						)}
					</div>

					{/* Selección de empleados */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Empleado con quién compartir el gasto:
						</label>
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<AutocompleteSelectField
									value={empleadoSeleccionado}
									onChange={setEmpleadoSeleccionado}
									options={empleados || []}
									label=""
									placeholder="--Selecciona un empleado--"
									displayField="nombreEmpleado"
									disabled={isLoadingEmpleados}
								/>
							</div>
							<ActionButton
								variant="primary"
								type="button"
								onClick={handleAgregarEmpleado}
								text="Agregar empleado"
								className="bg-green-500 hover:bg-green-600 text-white"
								disabled={empleadoSeleccionado === 0}
							/>
						</div>
						{empleadosSeleccionados.length > 0 && (
							<div className="mt-3 space-y-2">
								{empleadosSeleccionados.map((idEmpleado) => (
									<div
										key={idEmpleado}
										className="flex items-center justify-between bg-gray-50 p-2 rounded"
									>
										<span className="text-sm text-gray-700">
											{obtenerNombreEmpleado(idEmpleado)}
										</span>
										<button
											type="button"
											onClick={() => handleEliminarEmpleado(idEmpleado)}
											className="text-red-500 hover:text-red-700"
										>
											<FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Resultado de validación */}
					{resultadoValidacion && (
						<div className="border-t border-gray-200 pt-4">
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
								<div className="flex items-center gap-3 mb-3">
									<FontAwesomeIcon
										icon={faXmarkCircle}
										className="w-6 h-6 text-red-600"
									/>
									<h3 className="text-lg font-bold text-red-800">
										Errores al validar los archivos
									</h3>
									<button
										onClick={() => setResultadoValidacion(null)}
										className="ml-auto text-red-400 hover:text-red-600"
									>
										<FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
									</button>
								</div>
								<div className="bg-blue-600 text-white p-2 rounded mb-3">
									<h4 className="text-center font-semibold">Resultado validaciones</h4>
								</div>
								<div className="overflow-x-auto">
									<table className="w-full border-collapse">
										<thead>
											<tr className="bg-gray-100">
												<th className="border border-gray-300 px-4 py-2 text-left">
													Nombre Archivo
												</th>
												<th className="border border-gray-300 px-4 py-2 text-left">
													Estatus
												</th>
												<th className="border border-gray-300 px-4 py-2 text-left">
													Mensaje
												</th>
											</tr>
										</thead>
										<tbody>
											{resultadoValidacion.nombre.map((nombre, index) => (
												<tr key={index}>
													<td className="border border-gray-300 px-4 py-2">
														{nombre}
													</td>
													<td className="border border-gray-300 px-4 py-2">
														{resultadoValidacion.estatus[index] ? (
															<span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
																Válido
															</span>
														) : (
															<span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
																Inválido
															</span>
														)}
													</td>
													<td className="border border-gray-300 px-4 py-2">
														{resultadoValidacion.descripcion[index]}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}

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
							type="button"
							onClick={handleSubmit}
							text="Enviar"
							isLoading={isSubmitting}
							loadingText="Enviando..."
							disabled={isSubmitting || archivosSeleccionados.length === 0}
							className="bg-blue-500 hover:bg-blue-600 text-white"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

