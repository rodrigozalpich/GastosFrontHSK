import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { claveProductoService } from "../services/claveProductoService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import type { ClaveProductoDTO } from "../types/catalogos";

/**
 * Hook personalizado para gestionar claves de producto
 */
export function useClaveProducto() {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);

	const idEmpresa = obtenerIdEmpresa();

	const {
		data: clavesProducto,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["clavesProducto", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await claveProductoService.obtenerTodos(idEmpresa);
		},
		enabled: !!idEmpresa,
	});

	const crearClaveProducto = useMutation({
		mutationFn: async (claveProducto: ClaveProductoDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await claveProductoService.crear(claveProducto, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["clavesProducto"] });
			mostrarNotificacion("Clave de producto creada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al crear clave de producto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	// Nota: Las claves de producto no tienen endpoint de actualización según la API
	// Se crean y eliminan, pero no se editan directamente
	const actualizarClaveProducto = useMutation({
		mutationFn: async () => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			// La API no tiene endpoint de edición para claves de producto
			throw new Error("La actualización de claves de producto no está soportada por la API");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al actualizar clave de producto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const eliminarClaveProducto = useMutation({
		mutationFn: async (claveProducto: ClaveProductoDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			// Asegurar que el objeto tenga todos los campos requeridos
			const claveProductoCompleto: ClaveProductoDTO = {
				id: claveProducto.id,
				idClaveProd: claveProducto.idClaveProd || 0,
				idDivision: claveProducto.idDivision || 0,
				idCuentaContable: claveProducto.idCuentaContable || 0,
				idCategoria: claveProducto.idCategoria || 0,
				borrado: true, // Marcar como borrado
				claveProd: claveProducto.claveProd || "",
				nombreClave: claveProducto.nombreClave || "",
				nombreDivision: claveProducto.nombreDivision || "",
				nombreCuentaContable: claveProducto.nombreCuentaContable || "",
			};
			return await claveProductoService.eliminar(claveProductoCompleto, idEmpresa);
		},
		onSuccess: (data) => {
			mostrarNotificacion(data.descripcion || "Clave de producto eliminada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al eliminar clave de producto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	return {
		clavesProducto: clavesProducto || [],
		isLoading,
		isError,
		error,
		refetch,
		crearClaveProducto,
		actualizarClaveProducto,
		eliminarClaveProducto,
		isCreating: crearClaveProducto.isPending,
		isUpdating: actualizarClaveProducto.isPending,
		isDeleting: eliminarClaveProducto.isPending,
	};
}

