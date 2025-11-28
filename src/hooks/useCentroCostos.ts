import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { centroCostoService } from "../services/centroCostoService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import type { CentroCostoDTO } from "../types/catalogos";

/**
 * Hook personalizado para gestionar centros de costos
 */
export function useCentroCostos() {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);

	const idEmpresa = obtenerIdEmpresa();

	const {
		data: centrosCostos,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["centroCostos", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await centroCostoService.obtenerTodos(idEmpresa);
		},
		enabled: !!idEmpresa,
	});

	const crearCentroCosto = useMutation({
		mutationFn: async (centroCosto: CentroCostoDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await centroCostoService.crear(centroCosto, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["centroCostos"] });
			mostrarNotificacion("Centro de costo creado exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al crear centro de costo: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const actualizarCentroCosto = useMutation({
		mutationFn: async (centroCosto: CentroCostoDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await centroCostoService.actualizar(centroCosto, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["centroCostos"] });
			mostrarNotificacion("Centro de costo actualizado exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al actualizar centro de costo: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const eliminarCentroCosto = useMutation({
		mutationFn: async (id: number) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await centroCostoService.eliminar(id, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["centroCostos"] });
			mostrarNotificacion("Centro de costo eliminado exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al eliminar centro de costo: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	return {
		centrosCostos: centrosCostos || [],
		isLoading,
		isError,
		error,
		refetch,
		crearCentroCosto,
		actualizarCentroCosto,
		eliminarCentroCosto,
		isCreating: crearCentroCosto.isPending,
		isUpdating: actualizarCentroCosto.isPending,
		isDeleting: eliminarCentroCosto.isPending,
	};
}

