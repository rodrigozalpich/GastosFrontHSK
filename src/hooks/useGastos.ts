import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gastoService } from "../services/gastoService";
import { useGastoStore, aplicarFiltrosComplejosAGastos } from "../store/gastoStore";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import type { GastoDTO } from "../types/gastos";

/**
 * Hook personalizado para gestionar gastos con Material React Table
 * 
 * Combina React Query para data fetching con Zustand para estado local.
 * Proporciona métodos para CRUD de gastos y manejo de filtros complejos.
 * 
 * **Nota**: Los filtros simples (por columna, búsqueda) los maneja MRT.
 * Este hook solo maneja filtros complejos y operaciones CRUD.
 * 
 * @returns Objeto con datos de gastos, estado de carga, y métodos CRUD
 * @example
 * ```typescript
 * const { gastos, isLoading, crearGasto, actualizarGasto } = useGastos();
 * 
 * // Crear un nuevo gasto
 * crearGasto(nuevoGasto);
 * 
 * // Actualizar un gasto existente
 * actualizarGasto(gastoActualizado);
 * ```
 */
export function useGastos() {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa, permisosEspeciales } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);
	const {
		setGastos,
		filtrosComplejos,
	} = useGastoStore();

	const idEmpresa = obtenerIdEmpresa();
	const idUsuario = permisosEspeciales?.idUsuario
		? parseInt(permisosEspeciales.idUsuario, 10)
		: null;

	// Query para obtener todos los gastos
	const {
		data: gastosData,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["gastos", idEmpresa, idUsuario],
		queryFn: async () => {
			if (!idEmpresa || !idUsuario) {
				throw new Error("Faltan datos de empresa o usuario");
			}
			const gastosObtenidos = await gastoService.obtenerGastos(idUsuario, idEmpresa);
			setGastos(gastosObtenidos);
			return gastosObtenidos;
		},
		enabled: !!idEmpresa && !!idUsuario,
	});

	// Aplicar filtros complejos a los datos (si hay filtros activos)
	const gastosConFiltrosComplejos = gastosData
		? aplicarFiltrosComplejosAGastos(gastosData, filtrosComplejos)
		: [];

	// Mutation para crear un gasto
	const crearGasto = useMutation({
		mutationFn: async (gasto: GastoDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await gastoService.crearGasto(gasto, idEmpresa);
		},
		onSuccess: () => {
			// Invalidar todas las queries relacionadas con gastos
			void queryClient.invalidateQueries({ queryKey: ["gastos"] });
			void queryClient.invalidateQueries({ queryKey: ["misGastos"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorAutorizar"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosAutorizados"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorPagar"] });
			mostrarNotificacion("Gasto creado exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al crear gasto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	// Mutation para actualizar un gasto
	const actualizarGasto = useMutation({
		mutationFn: async (gasto: GastoDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await gastoService.editarGasto(gasto, idEmpresa);
		},
		onSuccess: () => {
			// Invalidar todas las queries relacionadas con gastos
			void queryClient.invalidateQueries({ queryKey: ["gastos"] });
			void queryClient.invalidateQueries({ queryKey: ["misGastos"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorAutorizar"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosAutorizados"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorPagar"] });
			mostrarNotificacion("Gasto actualizado exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al actualizar gasto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	// Mutation para eliminar un gasto
	const eliminarGasto = useMutation({
		mutationFn: async (gasto: GastoDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await gastoService.borrarGasto(gasto, idEmpresa);
		},
		onSuccess: () => {
			// Invalidar todas las queries relacionadas con gastos
			void queryClient.invalidateQueries({ queryKey: ["gastos"] });
			void queryClient.invalidateQueries({ queryKey: ["misGastos"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorAutorizar"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosAutorizados"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorPagar"] });
			mostrarNotificacion("Gasto eliminado exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al eliminar gasto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	return {
		// Datos para MRT (ya con filtros complejos aplicados si hay)
		gastos: gastosConFiltrosComplejos,
		gastosCompletos: gastosData || [], // Todos los gastos sin filtros complejos
		
		// Filtros complejos (para usar en componentes de filtro personalizados)
		filtrosComplejos,

		// Estado
		isLoading,
		isError,
		error,

		// Acciones
		refetch,
		crearGasto: crearGasto.mutate,
		actualizarGasto: actualizarGasto.mutate,
		eliminarGasto: eliminarGasto.mutate,

		// Estados de mutaciones
		isCreating: crearGasto.isPending,
		isUpdating: actualizarGasto.isPending,
		isDeleting: eliminarGasto.isPending,
	};
}
