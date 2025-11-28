import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gastoService } from "../services/gastoService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import type { GastoAutorizadoDTO, GastoRechazadoDTO } from "../types/gastos";

/**
 * Hook personalizado para gestionar autorización de gastos
 * Maneja la lógica de autorización y rechazo de gastos
 * 
 * NOTA: Las queries para obtener autorizadores y gastos autorizados deben
 * llamarse directamente en los componentes usando useQuery con los métodos
 * del servicio, ya que los hooks no pueden devolverse como funciones.
 */
export function useAutorizacion() {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);

	const idEmpresa = obtenerIdEmpresa();

	/**
	 * Mutation para autorizar un gasto
	 */
	const autorizarGasto = useMutation({
		mutationFn: async (gastoAutorizado: GastoAutorizadoDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await gastoService.autorizarGasto(gastoAutorizado, idEmpresa);
		},
		onSuccess: () => {
			// Invalidar queries relacionadas
			void queryClient.invalidateQueries({ queryKey: ["gastos"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorAutorizar"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosAutorizados"] });
			void queryClient.invalidateQueries({ queryKey: ["gastoAutorizado"] });
			mostrarNotificacion("Gasto autorizado exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al autorizar gasto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	/**
	 * Mutation para rechazar un gasto
	 */
	const rechazarGasto = useMutation({
		mutationFn: async (gastoRechazado: GastoRechazadoDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await gastoService.crearGastoRechazado(gastoRechazado, idEmpresa);
		},
		onSuccess: () => {
			// Invalidar queries relacionadas
			void queryClient.invalidateQueries({ queryKey: ["gastos"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorAutorizar"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosAutorizados"] });
			void queryClient.invalidateQueries({ queryKey: ["gastoRechazado"] });
			mostrarNotificacion("Gasto rechazado exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al rechazar gasto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	return {
		// Mutations
		autorizarGasto: autorizarGasto.mutate,
		rechazarGasto: rechazarGasto.mutate,

		// Estados de mutaciones
		isAutorizando: autorizarGasto.isPending,
		isRechazando: rechazarGasto.isPending,
	};
}
