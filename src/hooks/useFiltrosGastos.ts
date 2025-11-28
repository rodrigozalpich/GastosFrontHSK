import { useGastoStore } from "../store/gastoStore";
import type { FiltrosComplejosGastos } from "../store/gastoStore";

/**
 * Hook personalizado para gestionar filtros complejos de gastos
 * 
 * NOTA: Los filtros simples (por columna, búsqueda) los maneja Material React Table.
 * Este hook solo maneja filtros complejos que MRT no puede manejar bien.
 */
export function useFiltrosGastos() {
	const {
		filtrosComplejos,
		aplicarFiltrosComplejos,
		limpiarFiltrosComplejos,
	} = useGastoStore();

	/**
	 * Aplica un filtro complejo específico
	 */
	const aplicarFiltro = (
		nombre: keyof FiltrosComplejosGastos,
		valor: FiltrosComplejosGastos[keyof FiltrosComplejosGastos]
	) => {
		aplicarFiltrosComplejos({ [nombre]: valor });
	};

	/**
	 * Aplica múltiples filtros complejos a la vez
	 */
	const aplicarMultiplesFiltros = (nuevosFiltros: Partial<FiltrosComplejosGastos>) => {
		aplicarFiltrosComplejos(nuevosFiltros);
	};

	/**
	 * Limpia todos los filtros complejos
	 */
	const limpiarTodosLosFiltros = () => {
		limpiarFiltrosComplejos();
	};

	return {
		filtrosComplejos,
		aplicarFiltro,
		aplicarMultiplesFiltros,
		limpiarTodosLosFiltros,
	};
}
