import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plazaService } from "../services/plazaService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import type { PlazaDTO } from "../types/catalogos";

/**
 * Hook personalizado para gestionar plazas
 */
export function usePlazas() {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);

	const idEmpresa = obtenerIdEmpresa();

	const {
		data: plazas,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["plazas", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await plazaService.obtenerTodos(idEmpresa);
		},
		enabled: !!idEmpresa,
	});

	const crearPlaza = useMutation({
		mutationFn: async (plaza: PlazaDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await plazaService.crear(plaza, idEmpresa);
		},
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: ["plazas"] });
			mostrarNotificacion(data.descripcion || "Plaza creada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al crear plaza: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const actualizarPlaza = useMutation({
		mutationFn: async (plaza: PlazaDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await plazaService.actualizar(plaza, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["plazas"] });
			mostrarNotificacion("Plaza actualizada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al actualizar plaza: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const eliminarPlaza = useMutation({
		mutationFn: async (plaza: PlazaDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			// Asegurar que el objeto tenga todos los campos requeridos
			const plazaCompleta: PlazaDTO = {
				id: plaza.id,
				nombrePlaza: plaza.nombrePlaza || "",
				nombreDivision: plaza.nombreDivision || "",
				idDivisiones: plaza.idDivisiones || 0,
				estatus: plaza.estatus || 0,
				fechaAlta: plaza.fechaAlta || new Date().toISOString(),
				fechaBaja: new Date().toISOString(),
				esAutorizador: plaza.esAutorizador || false,
				disponible: plaza.disponible !== undefined ? plaza.disponible : true,
				empleadoAsociado: plaza.empleadoAsociado || null,
				borrado: true,
			};
			return await plazaService.eliminar(plazaCompleta, idEmpresa);
		},
		onSuccess: () => {
			mostrarNotificacion("Plaza eliminada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al eliminar plaza: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	return {
		plazas: plazas || [],
		isLoading,
		isError,
		error,
		refetch,
		crearPlaza,
		actualizarPlaza,
		eliminarPlaza,
		isCreating: crearPlaza.isPending,
		isUpdating: actualizarPlaza.isPending,
		isDeleting: eliminarPlaza.isPending,
	};
}

