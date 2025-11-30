/**
 * Constantes de rutas de iconos SVG
 * Centraliza todas las rutas de iconos para mejor mantenimiento y type safety
 */

export const ICONOS_MENU = {
	// Proveedores
	proveedores: "/assets/iconos/proveedores.svg",
	oc: "/assets/iconos/oc.svg",
	facturas: "/assets/iconos/facturas.svg",
	pagos: "/assets/iconos/pagos.svg",
	digital: "/assets/iconos/digital.svg",
	analytics: "/assets/iconos/analytics.svg",

	// Gastos
	gastos: "/assets/iconos/gastos.svg",
	gestionGastos: "/assets/iconos/gestionGastos.svg",
	datosEmpleado: "/assets/iconos/datosEmpleado.svg",

	// Configuración
	contabilidad: "/assets/iconos/contabilidad.svg",
	layout: "/assets/iconos/layout.svg",
	cuentaContable: "/assets/iconos/cuentaContable.svg",
	settings: "/assets/iconos/settings.svg",
	costosCuenta: "/assets/iconos/cuentasCosto.svg",

	// Catálogo
	catalogos: "/assets/iconos/catalogos.svg",
	tipoDocumento: "/assets/iconos/tipoDocumento.svg",
	ordenMantenimiento: "/assets/iconos/ordenMantenimiento.svg",
	cuentasCosto: "/assets/iconos/cuentasCosto.svg",
	clavesProducto: "/assets/iconos/clavesProducto.svg",
	division: "/assets/iconos/division.svg",
	plazas: "/assets/iconos/plazas.svg",

	// Otros
	polizas: "/assets/iconos/polizas.svg",
	timbrado: "/assets/iconos/timbrado.svg",

	// Usuarios/Administración
	usuarios: "/assets/iconos/usuarios.svg",
	corporativos: "/assets/iconos/corporativos.svg",
	empresas: "/assets/iconos/empresas.svg",
	servicioEmpresa: "/assets/iconos/servicioEmpresa.svg",
	usuarioCorporativo: "/assets/iconos/usuarioCorporativo.svg",
	roles: "/assets/iconos/roles.svg",
	usuarios1: "/assets/iconos/usuarios1.svg",
	view: "/assets/iconos/view.svg",
} as const;

/**
 * Tipo para autocompletado de nombres de iconos
 */
export type IconoMenu = keyof typeof ICONOS_MENU;

