import { type JSX, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "../ActionButton";
import type { RespuestaTimbradoDTO } from "../../types/gastos";

interface ModalResultadoTimbradoProps {
	abierto: boolean;
	resultados: RespuestaTimbradoDTO[];
	onCerrar: () => void;
}

/**
 * Modal para mostrar los resultados del timbrado de gastos
 * Muestra las validaciones y resultados de cada gasto timbrado
 *
 * @param {ModalResultadoTimbradoProps} props - Propiedades del modal
 * @returns {JSX.Element | null} El modal de resultados o null si no está abierto
 */
export default function ModalResultadoTimbrado({
	abierto,
	resultados,
	onCerrar,
}: ModalResultadoTimbradoProps): JSX.Element | null {
	const [isClosing, setIsClosing] = useState(false);

	// Resetear estado cuando el modal se cierra
	useEffect(() => {
		if (!abierto) {
			setTimeout(() => {
				setIsClosing(false);
			}, 0);
		}
	}, [abierto]);

	const handleClose = () => {
		if (isClosing) return;
		setIsClosing(true);
	};

	if (!abierto && !isClosing) {
		return null;
	}

	// Contar resultados exitosos y fallidos
	const exitosos = resultados.filter((r) => r.estatus).length;
	const fallidos = resultados.filter((r) => !r.estatus).length;
	const total = resultados.length;

	return (
		<div
			className={`fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
				isClosing ? "animate-modal-overlay-out" : "animate-modal-overlay-in"
			}`}
			onClick={handleClose}
		>
			<div
				className={`bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col ${
					isClosing ? "animate-modal-content-out" : "animate-modal-content-in"
				}`}
				onClick={(e) => e.stopPropagation()}
				onAnimationEnd={(e) => {
					if (e.currentTarget === e.target && isClosing) {
						setTimeout(() => {
							setIsClosing(false);
							onCerrar();
						}, 50);
					}
				}}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
							<FontAwesomeIcon icon={faCheckCircle} className="text-blue-600 text-xl" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900">Resultados del Timbrado</h3>
							<p className="text-sm text-gray-500">
								{exitosos} exitoso{exitosos !== 1 ? "s" : ""} / {fallidos} fallido{fallidos !== 1 ? "s" : ""} de {total}
							</p>
						</div>
					</div>
					<button
						onClick={handleClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Cerrar"
					>
						<FontAwesomeIcon icon={faTimes} className="text-xl" />
					</button>
				</div>

				{/* Body - Lista de resultados */}
				<div className="flex-1 overflow-y-auto p-6">
					<div className="space-y-4">
						{resultados.map((resultado, index) => (
							<div
								key={index}
								className={`border rounded-lg p-4 ${
									resultado.estatus
										? "bg-green-50 border-green-200"
										: "bg-red-50 border-red-200"
								}`}
							>
								<div className="flex items-start gap-3">
									<div
										className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
											resultado.estatus ? "bg-green-100" : "bg-red-100"
										}`}
									>
										<FontAwesomeIcon
											icon={resultado.estatus ? faCheckCircle : faTimesCircle}
											className={`text-lg ${resultado.estatus ? "text-green-600" : "text-red-600"}`}
										/>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between mb-2">
											<h4 className="text-sm font-semibold text-gray-900">
												{resultado.nombre || "Sin nombre"}
											</h4>
											<span
												className={`px-2 py-1 text-xs font-semibold rounded-full ${
													resultado.estatus
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{resultado.estatus ? "Exitoso" : "Fallido"}
											</span>
										</div>
										{resultado.nombreGasto && (
											<p className="text-sm text-gray-600 mb-1">
												<strong>Gasto:</strong> {resultado.nombreGasto}
											</p>
										)}
										<p
											className={`text-sm ${
												resultado.estatus ? "text-green-700" : "text-red-700"
											}`}
										>
											{resultado.descripcion}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 p-6 border-t border-gray-200">
					<ActionButton
						variant="primary"
						onClick={handleClose}
						text="Cerrar"
						icon={faTimes}
					/>
				</div>
			</div>
		</div>
	);
}

