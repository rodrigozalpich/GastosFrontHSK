import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { divisionService } from "../services/divisionService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import type { DivisionDTO } from "../types/catalogos";

/**
 * Hook personalizado para gestionar divisiones
 */
export function useDivision() {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);

	const idEmpresa = obtenerIdEmpresa();

	const {
		data: divisiones,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["divisiones", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await divisionService.obtenerTodos(idEmpresa);
		},
		enabled: !!idEmpresa,
	});

	const crearDivision = useMutation({
		mutationFn: async (division: DivisionDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await divisionService.crear(division, idEmpresa);
		},
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: ["divisiones"] });
			mostrarNotificacion(data.descripcion || "División creada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al crear división: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const actualizarDivision = useMutation({
		mutationFn: async (division: DivisionDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await divisionService.actualizar(division, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["divisiones"] });
			mostrarNotificacion("División actualizada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al actualizar división: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const eliminarDivision = useMutation({
		mutationFn: async (division: DivisionDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			// Asegurar que el objeto tenga todos los campos requeridos
			const divisionCompleta: DivisionDTO = {
				id: division.id,
				nombre: division.nombre || "",
				codigoSAP: division.codigoSAP || null,
				registroPatronal: division.registroPatronal || null,
				estatus: division.estatus || 0,
				asignaAC: division.asignaAC || false,
				fechaAlta: division.fechaAlta || new Date().toISOString(),
				fechaBaja: new Date().toISOString(),
				borrado: true,
			};
			return await divisionService.eliminar(divisionCompleta, idEmpresa);
		},
		onSuccess: () => {
			mostrarNotificacion("División eliminada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al eliminar división: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	return {
		divisiones: divisiones || [],
		isLoading,
		isError,
		error,
		refetch,
		crearDivision,
		actualizarDivision,
		eliminarDivision,
		isCreating: crearDivision.isPending,
		isUpdating: actualizarDivision.isPending,
		isDeleting: eliminarDivision.isPending,
	};
}

