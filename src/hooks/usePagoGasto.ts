import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gastoService } from "../services/gastoService";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import type { MovimientosCuentaContableDTO } from "../types/gastos";

/**
 * Hook personalizado para gestionar pagos de gastos
 * Maneja la lógica de pago de gastos
 * 
 * NOTA: Las queries para obtener gastos por pagar deben llamarse directamente
 * en los componentes usando useQuery con los métodos del servicio.
 */
export function usePagoGasto() {
	const queryClient = useQueryClient();
	const { obtenerIdEmpresa } = useAuthStore();
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);

	const idEmpresa = obtenerIdEmpresa();

	/**
	 * Mutation para pagar un gasto
	 */
	const pagarGasto = useMutation({
		mutationFn: async ({
			archivoPago,
			movimiento,
		}: {
			archivoPago: File | null;
			movimiento: MovimientosCuentaContableDTO;
		}) => {
			if (!idEmpresa) {
				throw new Error("Falta el ID de empresa");
			}
			if (!movimiento.idCuentaContable || movimiento.idCuentaContable === 0) {
				throw new Error("Debe seleccionar una cuenta contable");
			}

			return await gastoService.pagarElGasto(archivoPago, idEmpresa, movimiento);
		},
		onSuccess: () => {
			// Invalidar queries relacionadas
			void queryClient.invalidateQueries({ queryKey: ["gastosPorPagar"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorPagarPorEmpleado"] });
			void queryClient.invalidateQueries({ queryKey: ["gastos"] });
			void queryClient.invalidateQueries({ queryKey: ["misGastos"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosAutorizados"] });
			void queryClient.invalidateQueries({ queryKey: ["gastosPorAutorizar"] });
			mostrarNotificacion("Gasto pagado exitosamente", "success");
		},
		onError: (error) => {
			mostrarNotificacion(
				`Error al pagar gasto: ${error instanceof Error ? error.message : "Error desconocido"}`,
				"error"
			);
		},
	});

	/**
	 * Helper para crear un movimiento de cuenta contable desde un gasto
	 */
	const crearMovimientoDesdeGasto = (
		idGasto: number,
		presupuesto: number | null | undefined,
		idCuentaContable: number
	): MovimientosCuentaContableDTO => {
		return {
			id: 0,
			idGasto: idGasto,
			idCuentaContable: idCuentaContable,
			SaldoAnterior: 0,
			monto: presupuesto || 0,
			saldoActual: 0,
			fechaAlta: new Date().toISOString(),
			estatus: 1,
		};
	};

	return {
		// Mutation
		pagarGasto: pagarGasto.mutate,

		// Helper
		crearMovimientoDesdeGasto,

		// Estados
		isPaying: pagarGasto.isPending,
	};
}
