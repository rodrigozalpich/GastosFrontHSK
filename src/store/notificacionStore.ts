import { create } from "zustand";

/**
 * @interface Notificacion
 * @description Define la estructura de una notificación individual.
 * @property {number} id - Identificador único de la notificación.
 * @property {string} mensaje - El mensaje a mostrar en la notificación.
 * @property {"success" | "error" | "info" | "warning"} gravedad - El nivel de severidad de la notificación (controla el color y el icono).
 */
export interface Notificacion {
	id: number;
	mensaje: string;
	gravedad: "success" | "error" | "info" | "warning";
}

/**
 * @interface NotificacionState
 * @description Define el estado y las acciones para el store de notificaciones.
 * @property {boolean} abrir - Controla si la notificación está visible.
 * @property {string} mensaje - El mensaje a mostrar en la notificación.
 * @property {"success" | "error" | "info" | "warning"} gravedad - El nivel de severidad de la notificación (controla el color y el icono).
 * @property {(mensaje: string, gravedad?: "success" | "error" | "info" | "warning") => void} mostrarNotificacion - Acción para mostrar una nueva notificación.
 * @property {() => void} cerrarNotificacion - Acción para cerrar la notificación actual.
 */
interface NotificacionState {
	notificaciones: Notificacion[];
	mostrarNotificacion: (mensaje: string, gravedad?: Notificacion["gravedad"]) => void;
	cerrarNotificacion: (id: number) => void;
}

/**
 * Un store de Zustand para manejar notificaciones globales en la aplicación.
 * Permite agregar y eliminar notificaciones, cada una con un mensaje y un nivel de severidad.
 * Las notificaciones se almacenan en un array, permitiendo múltiples notificaciones simultáneas.
 *
 * @store
 * @returns {NotificacionState} El estado y las acciones del store de notificaciones.
 */
export const useNotificacionStore = create<NotificacionState>((set) => ({
	notificaciones: [],

	mostrarNotificacion: (mensaje, gravedad = "info") =>
		set((state) => ({
			notificaciones: [
				...state.notificaciones,
				{ id: Date.now(), mensaje, gravedad },
			],
		})),

	cerrarNotificacion: (id) =>
		set((state) => ({
			notificaciones: state.notificaciones.filter(
				(notificacion) => notificacion.id !== id
			),
		})),
}));


