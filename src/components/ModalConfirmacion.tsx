import { type JSX, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faTimes } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "./ActionButton";

interface ModalConfirmacionProps {
	abierto: boolean;
	titulo: string;
	mensaje: string;
	textoConfirmar?: string;
	textoCancelar?: string;
	colorConfirmar?: "red" | "blue" | "green" | "yellow";
	onConfirmar: () => void;
	onCancelar: () => void;
}

/**
 * Modal de confirmación reutilizable
 * Reemplaza window.confirm para mantener elementos del navegador fuera del flujo
 *
 * @param {ModalConfirmacionProps} props - Propiedades del modal
 * @returns {JSX.Element | null} El modal de confirmación o null si no está abierto
 */
export default function ModalConfirmacion({
	abierto,
	titulo,
	mensaje,
	textoConfirmar = "Confirmar",
	textoCancelar = "Cancelar",
	colorConfirmar = "red",
	onConfirmar,
	onCancelar,
}: ModalConfirmacionProps): JSX.Element | null {
	const [isClosing, setIsClosing] = useState(false);
	const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

	// Resetear estado cuando el modal se cierra
	useEffect(() => {
		if (!abierto) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIsClosing(false);
			 
			setPendingAction(null);
		}
	}, [abierto]);

	const handleClose = () => {
		if (isClosing) return; // Prevenir múltiples cierres
		setIsClosing(true);
		// No llamar onCancelar aquí, se llamará en onAnimationEnd
	};

	const handleConfirmar = () => {
		if (isClosing) return; // Prevenir múltiples cierres
		setPendingAction(() => onConfirmar);
		setIsClosing(true);
	};

	if (!abierto && !isClosing) {
		return null;
	}

	const colorClasses = {
		red: "bg-red-500 hover:bg-red-600",
		blue: "bg-blue-500 hover:bg-blue-600",
		green: "bg-green-500 hover:bg-green-600",
		yellow: "bg-yellow-500 hover:bg-yellow-600",
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
				data-modal-confirmacion
				onAnimationEnd={(e) => {
					// Solo procesar el evento del elemento principal, no de los hijos
					if (e.currentTarget === e.target && isClosing) {
						// Pequeño delay para asegurar que la animación visual termine
						setTimeout(() => {
							setIsClosing(false);
							if (pendingAction) {
								const action = pendingAction;
								setPendingAction(null);
								action();
							} else {
								onCancelar();
							}
						}, 50);
					}
				}}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
							<FontAwesomeIcon
								icon={faExclamationTriangle}
								className="w-5 h-5 text-red-600"
							/>
						</div>
						<h2 className="text-xl font-bold text-gray-900">{titulo}</h2>
					</div>
					<button
						onClick={handleClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Cerrar"
					>
						<FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
					</button>
				</div>

				{/* Contenido */}
				<div className="p-6">
					<p className="text-gray-700 mb-6">{mensaje}</p>

					{/* Botones */}
					<div className="flex gap-3 justify-end">
						<ActionButton
							variant="cancel"
							type="button"
							onClick={handleClose}
							text={textoCancelar}
						/>
						<ActionButton
							variant="custom"
							type="button"
							onClick={handleConfirmar}
							text={textoConfirmar}
							customClassName={`text-white ${colorClasses[colorConfirmar]}`}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

