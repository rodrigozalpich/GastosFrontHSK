import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { polizaService } from "../services/polizaService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import type { PolizaGastosDTO, PolizaDetalleGastosDTO } from "../types/gastos";

/**
 * Hook personalizado para gestionar pólizas de gastos
 */
export function usePolizas() {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);

	const idEmpresa = obtenerIdEmpresa();

	const {
		data: gastos,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["gastosParaPolizas", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await polizaService.obtenerGastosParaPolizas(idEmpresa);
		},
		enabled: !!idEmpresa,
		staleTime: 0, // Los datos siempre se consideran stale para permitir refetch inmediato
		gcTime: 1000 * 60 * 10,
		refetchOnWindowFocus: false, // Evitar refetch automático al cambiar de ventana
	});

	const crearPoliza = useMutation({
		mutationFn: async ({ idGasto, tipoPoliza }: { idGasto: number; tipoPoliza: number }) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await polizaService.crearPoliza(idGasto, tipoPoliza, idEmpresa);
		},
		onSuccess: async (data) => {
			// El backend puede devolver 200 OK pero con un mensaje de error en la descripción
			// Verificamos si la póliza se creó correctamente
			const mensajeError = data.descripcion?.toLowerCase();
			const esError =
				!data.estatus ||
				mensajeError?.includes("no se pudo") ||
				mensajeError?.includes("error") ||
				mensajeError?.includes("falló");

			if (esError) {
				// Si hay un error, mostramos el mensaje de error
				mostrarNotificacion(
					data.descripcion || "Error al crear la póliza",
					"error"
				);
			} else {
				// Si se creó correctamente, mostramos éxito y actualizamos los datos
				mostrarNotificacion("Póliza creada exitosamente", "success");
				// Invalidar y refetch inmediatamente para actualizar la UI
				await queryClient.invalidateQueries({
					queryKey: ["gastosParaPolizas", idEmpresa],
				});
				// Forzar refetch para asegurar que los datos se actualicen
				await queryClient.refetchQueries({
					queryKey: ["gastosParaPolizas", idEmpresa],
				});
			}
		},
		onError: (error: Error) => {
			console.error("Error al crear la póliza:", error);
			mostrarNotificacion(
				error.message || "Error al crear la póliza",
				"error"
			);
		},
	});

	const actualizarPoliza = useMutation({
		mutationFn: async (poliza: PolizaGastosDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await polizaService.actualizarPoliza(poliza, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["polizas"] });
			mostrarNotificacion("Póliza actualizada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al actualizar póliza: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const eliminarPoliza = useMutation({
		mutationFn: async (id: number) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await polizaService.eliminarPoliza(id, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["polizas"] });
			mostrarNotificacion("Póliza eliminada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al eliminar póliza: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const cargarPolizas = useMutation({
		mutationFn: async ({ fechaInicio, fechaFin }: { fechaInicio: string; fechaFin: string }) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await polizaService.cargarPolizas(fechaInicio, fechaFin, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["polizas"] });
			mostrarNotificacion("Pólizas cargadas exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al cargar pólizas: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	/**
	 * Obtiene una póliza por ID de gasto y tipo de póliza
	 */
	const obtenerPolizaxidGastoYTipoPoliza = async (
		idGasto: number,
		tipoPoliza: number
	): Promise<PolizaGastosDTO> => {
		if (!idEmpresa) {
			throw new Error("Falta el ID de empresa");
		}
		return await polizaService.obtenerPolizaxidGastoYTipoPoliza(idGasto, tipoPoliza, idEmpresa);
	};

	/**
	 * Obtiene los detalles de una póliza por ID de póliza
	 */
	const obtenerDetallePolizasxidPoliza = async (
		idPoliza: number
	): Promise<PolizaDetalleGastosDTO[]> => {
		if (!idEmpresa) {
			throw new Error("Falta el ID de empresa");
		}
		return await polizaService.obtenerDetallePolizasxidPoliza(idPoliza, idEmpresa);
	};

	return {
		gastos: gastos || [],
		polizas: gastos || [], // Alias para compatibilidad
		isLoading,
		isError,
		error,
		refetch,
		crearPoliza,
		actualizarPoliza,
		eliminarPoliza,
		cargarPolizas,
		obtenerPolizaxidGastoYTipoPoliza,
		obtenerDetallePolizasxidPoliza,
		isCreating: crearPoliza.isPending,
		isUpdating: actualizarPoliza.isPending,
		isDeleting: eliminarPoliza.isPending,
		isLoadingPolizas: cargarPolizas.isPending,
	};
}

