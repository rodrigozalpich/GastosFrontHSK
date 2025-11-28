import { type JSX, useState } from "react";
import { useFiltrosGastos } from "../hooks/useFiltrosGastos";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

/**
 * Componente para filtros complejos de gastos
 * Estos filtros no los maneja Material React Table directamente
 * (rangos de fechas, rangos de montos, lógica de negocio)
 */
export default function FiltrosComplejosGastos(): JSX.Element {
	const { filtrosComplejos, aplicarFiltro, limpiarTodosLosFiltros } = useFiltrosGastos();
	const [estaExpandido, setEstaExpandido] = useState<boolean>(false);

	const toggleExpandir = () => {
		setEstaExpandido(!estaExpandido);
	};

	return (
		<div className="mb-4 bg-gray-50 rounded-lg border border-gray-200 shadow-lg overflow-hidden">
			<div 
				className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-100 transition-colors gap-2" 
				onClick={toggleExpandir}
			>
				<h3 className="text-base sm:text-lg font-semibold text-gray-900">Filtros avanzados</h3>
				<div className="flex items-center gap-2 sm:gap-3 shrink-0">
					<button
						onClick={(e) => {
							e.stopPropagation();
							limpiarTodosLosFiltros();
						}}
						className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 whitespace-nowrap"
					>
						Limpiar Filtros
					</button>
					<FontAwesomeIcon
						icon={faChevronDown}
						className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 transition-transform duration-300 ease-in-out shrink-0 ${
							estaExpandido ? "transform rotate-180" : ""
						}`}
					/>
				</div>
			</div>
			<div
				className={`overflow-hidden transition-all duration-300 ease-in-out ${
					estaExpandido ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
				}`}
			>
				<div className="px-3 sm:px-4 pb-3 sm:pb-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
						{/* Rango de fechas */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Fecha Inicio
							</label>
							<input
								type="date"
								value={
									filtrosComplejos.fechaInicio
										? new Date(filtrosComplejos.fechaInicio).toISOString().split("T")[0]
										: ""
								}
								onChange={(e) =>
									aplicarFiltro("fechaInicio", e.target.value ? new Date(e.target.value) : null)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Fecha Fin
							</label>
							<input
								type="date"
								value={
									filtrosComplejos.fechaFin
										? new Date(filtrosComplejos.fechaFin).toISOString().split("T")[0]
										: ""
								}
								onChange={(e) =>
									aplicarFiltro("fechaFin", e.target.value ? new Date(e.target.value) : null)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						{/* Rango de montos */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Monto Mínimo
							</label>
							<input
								type="number"
								step="0.01"
								min="0"
								value={filtrosComplejos.montoMinimo || ""}
								onChange={(e) =>
									aplicarFiltro(
										"montoMinimo",
										e.target.value ? parseFloat(e.target.value) : null
									)
								}
								placeholder="0.00"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Monto Máximo
							</label>
							<input
								type="number"
								step="0.01"
								min="0"
								value={filtrosComplejos.montoMaximo || ""}
								onChange={(e) =>
									aplicarFiltro(
										"montoMaximo",
										e.target.value ? parseFloat(e.target.value) : null
									)
								}
								placeholder="0.00"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
					</div>
					<div className="flex flex-wrap gap-3 sm:gap-4 mt-4">
						{/* Filtros de negocio */}
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="abierto"
								checked={filtrosComplejos.abierto || false}
								onChange={(e) => aplicarFiltro("abierto", e.target.checked || null)}
								className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0"
							/>
							<label htmlFor="abierto" className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
								Abierto
							</label>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="porComprobar"
								checked={filtrosComplejos.porComprobar || false}
								onChange={(e) => aplicarFiltro("porComprobar", e.target.checked || null)}
								className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0"
							/>
							<label htmlFor="porComprobar" className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
								Finalizado
							</label>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="porAutorizar"
								checked={filtrosComplejos.porAutorizar || false}
								onChange={(e) => aplicarFiltro("porAutorizar", e.target.checked || null)}
								className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0"
							/>
							<label htmlFor="porAutorizar" className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
								En proceso de Autorización
							</label>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="autorizado"
								checked={filtrosComplejos.autorizado || false}
								onChange={(e) => aplicarFiltro("autorizado", e.target.checked || null)}
								className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0"
							/>
							<label htmlFor="autorizado" className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
								Autorizado
							</label>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="rechazado"
								checked={filtrosComplejos.rechazado || false}
								onChange={(e) => aplicarFiltro("rechazado", e.target.checked || null)}
								className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0"
							/>
							<label htmlFor="rechazado" className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
								Rechazado
							</label>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="porPagar"
								checked={filtrosComplejos.porPagar || false}
								onChange={(e) => aplicarFiltro("porPagar", e.target.checked || null)}
								className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0"
							/>
							<label htmlFor="porPagar" className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
								Por Pagar
							</label>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="finalizado"
								checked={filtrosComplejos.finalizado || false}
								onChange={(e) => aplicarFiltro("finalizado", e.target.checked || null)}
								className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0"
							/>
							<label htmlFor="finalizado" className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
								Finalizado
							</label>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
