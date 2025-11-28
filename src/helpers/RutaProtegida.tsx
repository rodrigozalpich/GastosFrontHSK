import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/authStore";
import Loader from "../components/Loader";
import type { JSX } from "react";
import { seguridadService } from "../services/seguridadService";

interface Props {
	allowedPermissions?: string[];
}

/**
 * Un componente de protección de rutas para usar con React Router.
 * Asegura que un usuario esté autenticado antes de permitir el acceso a una ruta anidada.
 *
 * Revisa dos condiciones:
 * 1. `estaHidratado`: Espera a que el estado de autenticación se rehidrate desde el almacenamiento, mostrando un `Loader` mientras tanto.
 * 2. `estaLogueado`: Si el estado está hidratado y no está logueado, redirige al usuario a la página de `/login`.
 *
 * Si la ruta requiere permisos específicos, valida que el usuario tenga al menos uno de los permisos requeridos.
 * 
 * Validación de permisos:
 * - Primero busca el permiso directamente (sin ID de empresa) para verificar si es una "sección única" (EsSeccionUnica)
 * - Si el valor es "EsSeccionUnica", otorga acceso inmediatamente
 * - Si no es sección única, busca usando el patrón `Permiso-{idEmpresa}`
 * - También verifica si el usuario es VisorCorporativo, que tiene acceso a todo
 *
 * @component
 * @returns {JSX.Element} El `<Outlet />` para usuarios autenticados, un componente `<Navigate>` para usuarios no autenticados, o un `<Loader />` durante la rehidratación del estado.
 */
export default function RutaProtegida({ allowedPermissions }: Props): JSX.Element {
	const { estaLogueado, estaHidratado, esSuperUsuario, obtenerIdEmpresa } =
		useAuthStore();

	// Mientras Zustand se rehidrata desde localStorage, no sabemos si el usuario está logueado.
	// Mostramos un loader para evitar un parpadeo de la página de login.
	if (!estaHidratado) {
		return <Loader text="Cargando usuario..." />;
	}

	// Si no está logueado, lo mandamos a la página de inicio de sesión.
	if (!estaLogueado || !seguridadService.estaLogueado()) {
		return <Navigate to="/login" replace />;
	}

	// Super usuarios tienen acceso a todo
	if (esSuperUsuario) {
		return <Outlet />;
	}

	// Si la ruta SÍ requiere permisos específicos...
	if (allowedPermissions && allowedPermissions.length > 0) {
		const idEmpresa = obtenerIdEmpresa();
		
		// Si no hay empresa activa, permitir acceso si es super usuario
		// o redirigir al dashboard para rutas que requieren empresa
		if (!idEmpresa) {
			if (esSuperUsuario) {
				// Super usuarios pueden acceder sin empresa
				return <Outlet />;
			}
			// Para otros usuarios sin empresa, redirigir al dashboard
			return <Navigate to="/dashboard" replace />;
		}

		// Validar permisos
		// Algunos permisos son "secciones únicas" (EsSeccionUnica) y no requieren ID de empresa
		const tienePermiso = allowedPermissions.some((permiso) => {
			// Primero intentar buscar el permiso directamente (para secciones únicas)
			const valorPermisoDirecto = seguridadService.obtenerCampoJwt(permiso);
			
			// Si el permiso directo existe y es "EsSeccionUnica", tiene acceso
			if (valorPermisoDirecto === "EsSeccionUnica") {
				console.log("Validación de permisos (sección única):", {
					permiso,
					valorPermiso: valorPermisoDirecto,
					tipo: "seccionUnica",
				});
				return true;
			}

			// Si no es sección única, buscar con el patrón Permiso-{idEmpresa}
			const permisoArmado = `${permiso}-${idEmpresa}`;
			const valorPermiso = seguridadService.obtenerCampoJwt(permisoArmado);
			const visorCorporativo = seguridadService.obtenerCampoJwt("VisorCorporativo");

			// Debug: Log para verificar permisos
			console.log("Validación de permisos:", {
				permiso,
				permisoArmado,
				valorPermiso,
				valorPermisoDirecto,
				visorCorporativo,
				idEmpresa,
				tienePermisoEspecifico: valorPermiso !== undefined && valorPermiso !== null && valorPermiso !== "",
				esVisorCorporativo: visorCorporativo !== undefined && visorCorporativo !== null && visorCorporativo !== "",
			});

			return (
				(valorPermiso !== undefined && valorPermiso !== null && valorPermiso !== "") ||
				(visorCorporativo !== undefined && visorCorporativo !== null && visorCorporativo !== "")
			);
		});

		if (!tienePermiso) {
			// Debug: Log cuando no tiene permiso
			console.warn("Acceso denegado - No tiene permisos:", {
				allowedPermissions,
				idEmpresa,
			});
			// Si no tiene el permiso, redirigir al dashboard
			return <Navigate to="/dashboard" replace />;
		}
	}

	// Si está logueado y (no se requieren permisos o sí los tiene), le damos acceso.
	return <Outlet />;
}


