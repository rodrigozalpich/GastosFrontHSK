import { type JSX, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface ModalRechazarGastoProps {
	abierto: boolean;
	nombreGasto: string;
	onClose: () => void;
	onConfirmar: (motivo: string) => void;
}

/**
 * Modal para rechazar un gasto
 * Similar a modal-rechazar-gasto.component del proyecto Angular
 */
export default function ModalRechazarGasto({
	abierto,
	nombreGasto,
	onClose,
	onConfirmar,
}: ModalRechazarGastoProps): JSX.Element | null {
	const [motivoRechazo, setMotivoRechazo] = useState("");
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (abierto) {
			setVisible(true);
		} else {
			setVisible(false);
			setMotivoRechazo("");
		}
	}, [abierto]);

	if (!abierto) return null;

	const handleConfirmar = () => {
		if (motivoRechazo.trim()) {
			onConfirmar(motivoRechazo);
			setMotivoRechazo("");
		}
	};

	const handleCerrar = () => {
		setMotivoRechazo("");
		onClose();
	};

	return (
		<div
			className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity ${
				visible ? "opacity-100" : "opacity-0"
			}`}
			onClick={handleCerrar}
		>
			<div
				className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md relative"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Botón cerrar */}
				<button
					type="button"
					onClick={handleCerrar}
					className="absolute top-0 right-0 px-4 py-3 text-2xl text-gray-500 hover:text-gray-700"
				>
					<FontAwesomeIcon icon={faTimes} />
				</button>

				{/* Contenido */}
				<div className="mt-4">
					<h2 className="text-xl font-bold text-gray-900 mb-4">
						Rechazar gasto
					</h2>

					<p className="text-sm text-gray-600 mb-4">
						Gasto: <span className="font-semibold">{nombreGasto}</span>
					</p>

					<div className="mb-4">
						<label
							htmlFor="motivoRechazo"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Motivo de rechazo *
						</label>
						<textarea
							id="motivoRechazo"
							value={motivoRechazo}
							onChange={(e) => setMotivoRechazo(e.target.value)}
							placeholder="Ingrese el motivo del rechazo..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							rows={4}
							required
						/>
					</div>

					{/* Botones */}
					<div className="flex justify-end gap-3 mt-6">
						<button
							type="button"
							onClick={handleCerrar}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={handleConfirmar}
							disabled={!motivoRechazo.trim()}
							className="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Rechazar
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

