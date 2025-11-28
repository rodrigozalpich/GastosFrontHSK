import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

/**
 * Gestiona la expiración de la sesión de autenticación.
 * Monitorea la fecha de expiración del token y cierra la sesión automáticamente
 * cuando el token expira o si no ha habido actividad.
 */
export const GestionDeSesion = (): null => {
	const { estaLogueado, fechaExpiracion, logout, estaHidratado } =
		useAuthStore();

	useEffect(() => {
		// No hacer nada si el store no está hidratado
		if (!estaHidratado) {
			return;
		}

		let timerId: ReturnType<typeof setTimeout> | undefined;

		if (estaLogueado && fechaExpiracion) {
			const expiryDate = new Date(fechaExpiracion);
			const now = new Date();

			// Calcular el tiempo restante hasta la expiración (en milisegundos)
			const expiresIn = expiryDate.getTime() - now.getTime();

			// Si ya expiró, cerrar sesión inmediatamente
			if (expiresIn <= 0) {
				logout();
			} else {
				// Configurar un timer para cerrar la sesión cuando expire
				timerId = setTimeout(() => {
					logout();
				}, expiresIn);
			}
		}

		// Limpiar el timer cuando el componente se desmonte o cambien las dependencias
		return () => {
			if (timerId) {
				clearTimeout(timerId);
			}
		};
	}, [estaLogueado, fechaExpiracion, logout, estaHidratado]);

	return null;
};

