import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parametrosService } from "../services/parametrosService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import type { ParametrosEmpresaGastosDTO } from "../types/gastos";

/**
 * Hook personalizado para gestionar parámetros de empresa de gastos
 */
export function useParametros() {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);

	const idEmpresa = obtenerIdEmpresa();

	const {
		data: parametros,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["parametros", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await parametrosService.obtenerTodos(idEmpresa);
		},
		enabled: !!idEmpresa,
	});

	const guardarParametro = useMutation({
		mutationFn: async (parametro: ParametrosEmpresaGastosDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await parametrosService.guardar(parametro, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["parametros"] });
			mostrarNotificacion("Parámetro guardado exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al guardar parámetro: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const editarParametro = useMutation({
		mutationFn: async (parametro: ParametrosEmpresaGastosDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await parametrosService.editar(parametro, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["parametros"] });
			mostrarNotificacion("Parámetro editado exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al editar parámetro: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const eliminarParametro = useMutation({
		mutationFn: async (id: number) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await parametrosService.eliminar(id, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["parametros"] });
			mostrarNotificacion("Parámetro eliminado exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al eliminar parámetro: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	return {
		parametros: parametros || [],
		isLoading,
		isError,
		error,
		refetch,
		guardarParametro,
		editarParametro,
		eliminarParametro,
		isSaving: guardarParametro.isPending,
		isUpdating: editarParametro.isPending,
		isDeleting: eliminarParametro.isPending,
	};
}

