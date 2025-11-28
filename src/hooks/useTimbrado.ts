import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timbradoService } from "../services/timbradoService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import type { RespuestaTimbradoDTO } from "../types/gastos";

/**
 * Hook personalizado para gestionar timbrado de gastos
 */
export function useTimbrado() {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);

	const idEmpresa = obtenerIdEmpresa();

	const {
		data: gastosPorTimbrar,
		isLoading: isLoadingPorTimbrar,
		isError: isErrorPorTimbrar,
		error: errorPorTimbrar,
		refetch: refetchPorTimbrar,
	} = useQuery({
		queryKey: ["gastosPorTimbrar", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await timbradoService.obtenerGastosPorTimbrar(idEmpresa);
		},
		enabled: !!idEmpresa,
	});

	const {
		data: gastosTimbrados,
		isLoading: isLoadingTimbrados,
		isError: isErrorTimbrados,
		error: errorTimbrados,
		refetch: refetchTimbrados,
	} = useQuery({
		queryKey: ["gastosTimbrados", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await timbradoService.obtenerGastosTimbrados(idEmpresa);
		},
		enabled: !!idEmpresa,
	});

	const timbrarGasto = useMutation<RespuestaTimbradoDTO[], Error, number[]>({
		mutationFn: async (idGastos: number[]) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await timbradoService.timbrarGasto(idGastos, idEmpresa);
		},
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: ["gastosPorTimbrar", idEmpresa] });
			await queryClient.invalidateQueries({ queryKey: ["gastosTimbrados", idEmpresa] });
			
			// Contar resultados exitosos y fallidos
			const exitosos = data.filter((r) => r.estatus).length;
			const fallidos = data.filter((r) => !r.estatus).length;
			
			if (exitosos > 0 && fallidos === 0) {
				mostrarNotificacion(`Todos los gastos fueron timbrados exitosamente (${exitosos})`, "success");
			} else if (exitosos > 0 && fallidos > 0) {
				mostrarNotificacion(
					`Timbrado parcial: ${exitosos} exitoso${exitosos !== 1 ? "s" : ""}, ${fallidos} fallido${fallidos !== 1 ? "s" : ""}`,
					"warning"
				);
			} else {
				mostrarNotificacion(
					`No se pudo timbrar ningún gasto. Revisa los detalles en el modal.`,
					"error"
				);
			}
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al timbrar gasto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	return {
		gastosPorTimbrar: gastosPorTimbrar || [],
		gastosTimbrados: gastosTimbrados || [],
		isLoadingPorTimbrar,
		isLoadingTimbrados,
		isErrorPorTimbrar,
		isErrorTimbrados,
		errorPorTimbrar,
		errorTimbrados,
		refetchPorTimbrar,
		refetchTimbrados,
		timbrarGasto,
		isTimbrando: timbrarGasto.isPending,
	};
}

