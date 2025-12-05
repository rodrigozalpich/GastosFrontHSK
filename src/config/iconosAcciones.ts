/**
 * Mapeo de iconos de acciones comunes a rutas de SVG
 * Utilizado para reemplazar iconos de FontAwesome con SVGs personalizados
 * 
 * NOTA: Por ahora se usan iconos existentes como placeholders.
 * Se pueden crear iconos específicos más adelante si es necesario.
 */

export const ICONOS_ACCIONES = {
	// Acciones básicas - usando iconos existentes como placeholders
	ver: "/assets/iconosAcciones/ver.svg", // TODO: Crear icono específico para "ver"
	editar: "/assets/iconosAcciones/editar.svg", // TODO: Crear icono específico para "editar"
	eliminar: "/assets/iconosAcciones/eliminar.svg", // TODO: Crear icono específico para "eliminar"
	aprobar: "/assets/iconosAcciones/settings.svg", // TODO: Crear icono específico para "aprobar"
	rechazar: "/assets/iconosAcciones/settings.svg", // TODO: Crear icono específico para "rechazar"
	agregar: "/assets/iconosAcciones/settings.svg", // TODO: Crear icono específico para "agregar"
	favorito: "/assets/iconosAcciones/settings.svg", // TODO: Crear icono específico para "favorito"
} as const;

/**
 * Mapeo de iconos de FontAwesome a rutas de SVG
 * Para facilitar la migración desde FontAwesome
 * 
 * NOTA: Este mapeo usa iconos existentes como placeholders.
 * Se recomienda crear iconos SVG específicos para cada acción.
 */
export const MAPEO_ICONOS_FA_A_SVG: Record<string, string> = {
	// Iconos comunes de FontAwesome
	faEye: ICONOS_ACCIONES.ver,
	faEdit: ICONOS_ACCIONES.editar,
	faTrash: ICONOS_ACCIONES.eliminar,
	faCheck: ICONOS_ACCIONES.aprobar,
	faTimes: ICONOS_ACCIONES.rechazar,
	faPlus: ICONOS_ACCIONES.agregar,
	faStar: ICONOS_ACCIONES.favorito,
	faUserPen: ICONOS_ACCIONES.editar,
	faDollar: "/assets/iconosAcciones/gastos.svg",
};

/**
 * Obtiene la ruta del SVG para un icono de FontAwesome
 * @param iconName - Nombre del icono de FontAwesome (ej: "faEye")
 * @returns Ruta del SVG o ruta por defecto si no se encuentra
 */
export function obtenerIconoSVG(iconName: string): string {
	return MAPEO_ICONOS_FA_A_SVG[iconName] || ICONOS_ACCIONES.ver;
}

