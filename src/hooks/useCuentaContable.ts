import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cuentaContableService } from "../services/cuentaContableService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import type { CuentaContableGastosDTO } from "../types/gastos";

/**
 * Hook personalizado para gestionar cuentas contables
 */
export function useCuentaContable() {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);

	const idEmpresa = obtenerIdEmpresa();

	const {
		data: cuentasContables,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["cuentasContables", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await cuentaContableService.obtenerTodos(idEmpresa);
		},
		enabled: !!idEmpresa,
	});

	const crearCuentaContable = useMutation({
		mutationFn: async (cuentaContable: CuentaContableGastosDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await cuentaContableService.crear(cuentaContable, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["cuentasContables"] });
			mostrarNotificacion("Cuenta contable creada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al crear cuenta contable: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const actualizarCuentaContable = useMutation({
		mutationFn: async (cuentaContable: CuentaContableGastosDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			return await cuentaContableService.actualizar(cuentaContable, idEmpresa);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["cuentasContables"] });
			mostrarNotificacion("Cuenta contable actualizada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al actualizar cuenta contable: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	const eliminarCuentaContable = useMutation({
		mutationFn: async (cuentaContable: CuentaContableGastosDTO) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			// Asegurar que el objeto tenga todos los campos requeridos
			const cuentaContableCompleta: CuentaContableGastosDTO = {
				id: cuentaContable.id,
				codigo: cuentaContable.codigo || null,
				descripcion: cuentaContable.descripcion || null,
				tipoMoneda: cuentaContable.tipoMoneda || 0,
				idPadre: cuentaContable.idPadre || 0,
				nivel: cuentaContable.nivel || 0,
				existeMovimiento: cuentaContable.existeMovimiento || false,
				existePoliza: cuentaContable.existePoliza || false,
				fechaAlta: cuentaContable.fechaAlta || new Date().toISOString(),
				esAcreedor: cuentaContable.esAcreedor || false,
				estatus: cuentaContable.estatus || false,
				tipoCuenta: cuentaContable.tipoCuenta || 0,
				borrado: true,
				permiso: cuentaContable.permiso || false,
				tipoDeCuentaN: cuentaContable.tipoDeCuentaN || null,
				esDefault: cuentaContable.esDefault || null,
				editarDefault: cuentaContable.editarDefault || null,
			};
			return await cuentaContableService.eliminar(cuentaContableCompleta, idEmpresa);
		},
		onSuccess: () => {
			mostrarNotificacion("Cuenta contable eliminada exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al eliminar cuenta contable: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	return {
		cuentasContables: cuentasContables || [],
		isLoading,
		isError,
		error,
		refetch,
		crearCuentaContable,
		actualizarCuentaContable,
		eliminarCuentaContable,
		isCreating: crearCuentaContable.isPending,
		isUpdating: actualizarCuentaContable.isPending,
		isDeleting: eliminarCuentaContable.isPending,
	};
}

