import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GastoDTO } from "../types/gastos";

/**
 * Interfaz para filtros complejos de gastos
 * Estos son filtros que MRT no maneja bien o que necesitan lógica de negocio especial
 */
export interface FiltrosComplejosGastos {
	// Filtros de rango de fechas (complejos, fuera de MRT)
	fechaInicio?: Date | null;
	fechaFin?: Date | null;
	
	// Filtros de monto (rangos complejos)
	montoMinimo?: number | null;
	montoMaximo?: number | null;
	
	// Filtros de negocio específicos
	abierto?: boolean | null;
	porComprobar?: boolean | null;
	porAutorizar?: boolean | null;
	autorizado?: boolean | null;
	rechazado?: boolean | null;
	porPagar?: boolean | null;
	pagado?: boolean | null;
	finalizado?: boolean | null;
}

/**
 * Estado del store de gastos
 * Optimizado para trabajar con Material React Table
 */
interface GastoState {
	// Estado de gastos (datos completos, MRT maneja el filtrado/paginación)
	gastos: GastoDTO[];
	gastoSeleccionado: GastoDTO | null;
	
	// Filtros complejos (solo los que MRT no maneja bien)
	filtrosComplejos: FiltrosComplejosGastos;
	
	// Estado de UI (modales, modo edición, etc.)
	modoEdicion: boolean;
	mostrarModal: boolean;
	modalTipo: "crear" | "editar" | "ver" | "eliminar" | null;
	
	// Acciones - Filtros complejos
	aplicarFiltrosComplejos: (filtros: Partial<FiltrosComplejosGastos>) => void;
	limpiarFiltrosComplejos: () => void;
	
	// Acciones - Gastos
	setGastos: (gastos: GastoDTO[]) => void;
	agregarGasto: (gasto: GastoDTO) => void;
	actualizarGasto: (gasto: GastoDTO) => void;
	eliminarGasto: (idGasto: number) => void;
	
	// Acciones - Selección
	seleccionarGasto: (gasto: GastoDTO | null) => void;
	
	// Acciones - UI
	setModoEdicion: (modo: boolean) => void;
	abrirModal: (tipo: "crear" | "editar" | "ver" | "eliminar") => void;
	cerrarModal: () => void;
	
	// Acciones - Utilidades
	resetearEstado: () => void;
}

/**
 * Estado inicial de filtros complejos
 */
const filtrosComplejosIniciales: FiltrosComplejosGastos = {
	fechaInicio: null,
	fechaFin: null,
	montoMinimo: null,
	montoMaximo: null,
	abierto: null,
	porComprobar: null,
	porAutorizar: null,
	autorizado: null,
	rechazado: null,
	porPagar: null,
	pagado: null,
	finalizado: null,
};

/**
 * Store de Zustand para manejar el estado de gastos
 * Optimizado para trabajar con Material React Table
 * 
 * NOTA: MRT maneja:
 * - Filtros por columna (texto, números, fechas simples)
 * - Búsqueda global
 * - Paginación
 * - Ordenamiento
 * 
 * Este store maneja:
 * - Filtros complejos (rangos, lógica de negocio)
 * - Estado de UI (modales, selección)
 * - Persistencia de preferencias
 */
export const useGastoStore = create<GastoState>()(
	persist(
		(set, get) => ({
			// Estado inicial
			gastos: [],
			gastoSeleccionado: null,
			filtrosComplejos: filtrosComplejosIniciales,
			modoEdicion: false,
			mostrarModal: false,
			modalTipo: null,

			// Aplicar filtros complejos
			aplicarFiltrosComplejos: (nuevosFiltros: Partial<FiltrosComplejosGastos>) => {
				set((state) => ({
					filtrosComplejos: { ...state.filtrosComplejos, ...nuevosFiltros },
				}));
			},

			// Limpiar filtros complejos
			limpiarFiltrosComplejos: () => {
				set({ filtrosComplejos: filtrosComplejosIniciales });
			},

			// Establecer gastos (MRT manejará el filtrado/paginación)
			setGastos: (gastos: GastoDTO[]) => {
				set({ gastos });
			},

			// Agregar gasto
			agregarGasto: (gasto: GastoDTO) => {
				set((state) => ({
					gastos: [gasto, ...state.gastos],
				}));
			},

			// Actualizar gasto
			actualizarGasto: (gastoActualizado: GastoDTO) => {
				set((state) => ({
					gastos: state.gastos.map((g) =>
						g.id === gastoActualizado.id ? gastoActualizado : g
					),
					gastoSeleccionado:
						state.gastoSeleccionado?.id === gastoActualizado.id
							? gastoActualizado
							: state.gastoSeleccionado,
				}));
			},

			// Eliminar gasto
			eliminarGasto: (idGasto: number) => {
				set((state) => ({
					gastos: state.gastos.filter((g) => g.id !== idGasto),
					gastoSeleccionado:
						state.gastoSeleccionado?.id === idGasto ? null : state.gastoSeleccionado,
				}));
			},

			// Seleccionar gasto
			seleccionarGasto: (gasto: GastoDTO | null) => {
				set({ gastoSeleccionado: gasto });
			},

			// UI
			setModoEdicion: (modo: boolean) => {
				set({ modoEdicion: modo });
			},

			abrirModal: (tipo: "crear" | "editar" | "ver" | "eliminar") => {
				set({ mostrarModal: true, modalTipo: tipo });
			},

			cerrarModal: () => {
				set({ mostrarModal: false, modalTipo: null });
				if (get().modalTipo === "crear" || get().modalTipo === "editar") {
					set({ gastoSeleccionado: null, modoEdicion: false });
				}
			},

			// Resetear todo el estado
			resetearEstado: () => {
				set({
					gastos: [],
					gastoSeleccionado: null,
					filtrosComplejos: filtrosComplejosIniciales,
					modoEdicion: false,
					mostrarModal: false,
					modalTipo: null,
				});
			},
		}),
		{
			name: "gasto-storage",
			// Solo persistir filtros complejos y preferencias, no los gastos
			partialize: (state) => ({
				filtrosComplejos: state.filtrosComplejos,
			}),
		}
	)
);

/**
 * Función helper para aplicar filtros complejos a los datos antes de pasarlos a MRT
 * Úsala en el componente para pre-filtrar los datos si es necesario
 */
export function aplicarFiltrosComplejosAGastos(
	gastos: GastoDTO[],
	filtros: FiltrosComplejosGastos
): GastoDTO[] {
	let gastosFiltrados = [...gastos];

	// Filtro por rango de fechas
	if (filtros.fechaInicio) {
		gastosFiltrados = gastosFiltrados.filter(
			(g) => new Date(g.fechaAlta) >= filtros.fechaInicio!
		);
	}

	if (filtros.fechaFin) {
		gastosFiltrados = gastosFiltrados.filter(
			(g) => new Date(g.fechaAlta) <= filtros.fechaFin!
		);
	}

	// Filtro por rango de montos
	if (filtros.montoMinimo !== null && filtros.montoMinimo !== undefined) {
		gastosFiltrados = gastosFiltrados.filter(
			(g) => g.presupuesto >= filtros.montoMinimo!
		);
	}

	if (filtros.montoMaximo !== null && filtros.montoMaximo !== undefined) {
		gastosFiltrados = gastosFiltrados.filter(
			(g) => g.presupuesto <= filtros.montoMaximo!
		);
	}

	// Filtros de estatus (lógica de negocio específica)
	// Si hay múltiples filtros de estatus activos, usar OR (mostrar gastos que cumplan cualquiera)
	const tieneFiltrosEspecificos = 
		filtros.abierto || 
		filtros.porComprobar || 
		filtros.porAutorizar || 
		filtros.autorizado || 
		filtros.rechazado || 
		filtros.porPagar || 
		filtros.pagado;
	
	// Aplicar filtros de estatus específicos
	if (tieneFiltrosEspecificos) {
		gastosFiltrados = gastosFiltrados.filter((g) => {
			// Abierto: Estatus 1
			if (filtros.abierto && g.estatus === 1) {
				return true;
			}
			
			// Finalizado: Estatus 2
			if (filtros.porComprobar && g.estatus === 2) {
				return true;
			}
			
			// Por Autorizar: Estatus 7 (En proceso de Autorización)
			if (filtros.porAutorizar && g.estatus === 7) {
				return true;
			}
			
			// Autorizado: Estatus 3
			if (filtros.autorizado && g.estatus === 3) {
				return true;
			}
			
			// Por Pagar: Estatus 5 (Pendiente de Pago)
			if (filtros.porPagar && g.estatus === 5) {
				return true;
			}
			
			// Rechazado: Estatus 4 (No Autorizado)
			if (filtros.rechazado && g.estatus === 4) {
				return true;
			}
			
			// Pagado: Estatus 6
			if (filtros.pagado && g.estatus === 6) {
				return true;
			}
			
			// Si no cumple ningún filtro específico, excluir el gasto
			return false;
		});
	}
	
	// Filtro de finalizado: Estatus 2 (Finalizado)
	// Este filtro es mutuamente excluyente con los otros filtros de estatus
	// Si hay otros filtros activos, NO aplicar finalizado
	if (filtros.finalizado && !tieneFiltrosEspecificos) {
		// Solo mostrar finalizados si no hay otros filtros de estatus activos
		gastosFiltrados = gastosFiltrados.filter(
			(g) => g.estatus === 2
		);
	}

	return gastosFiltrados;
}
