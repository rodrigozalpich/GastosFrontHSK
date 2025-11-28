import { type IconDefinition } from "@fortawesome/free-solid-svg-icons";
// Los iconos se importarán cuando se implementen las rutas en fases posteriores
// import {
// 	faBoxesStacked,
// 	faBuilding,
// 	faChartGantt,
// 	faCheckToSlot,
// 	faCoins,
// 	faColumns,
// 	faCreditCard,
// 	faFileInvoice,
// 	faFileLines,
// 	faKey,
// 	faMoneyBill,
// 	faNetworkWired,
// 	faTableList,
// 	faUser,
// 	faUserTie,
// } from "@fortawesome/free-solid-svg-icons";

/**
 * Constantes de rutas de la aplicación.
 * Centraliza todas las rutas para evitar strings mágicos y facilitar el mantenimiento.
 */
export const ROUTES = {
	LOGIN: "/login",
	LANDING: "/",
	DASHBOARD: "/dashboard",
	// Gestión de Gastos
	GASTOS_LISTADO: "/gastos/listado",
	GASTOS_MIS_GASTOS: "/gastos/mis-gastos",
	GASTOS_POR_AUTORIZAR: "/gastos/por-autorizar",
	GASTOS_AUTORIZADOS: "/gastos/autorizados",
	GASTOS_POR_PAGAR: "/gastos/por-pagar",
	GASTOS_DETALLE: "/gastos/:gastoId",
	// Administración
	ADMIN_ROLES: "/administracion/roles",
	ADMIN_TARJETAS: "/administracion/tarjetas",
	ADMIN_EMPRESAS: "/administracion/empresas",
	DATOS_EMPLEADO: "/datos-empleado",
	CONFIGURAR_PLAZAS: "/datos-empleado/configurar-plazas/:idEmpleado",
	CONFIGURAR_ARBOL: "/datos-empleado/configurar-arbol/:idEmpleado/:idPlazaEmpleado/:tipoArbol",
	// Catálogos
	CATALOGOS_CENTROS_COSTOS: "/catalogos/centros-costos",
	CATALOGOS_PLAZAS: "/catalogos/plazas",
	CATALOGOS_CUENTAS_CONTABLES: "/catalogos/cuentas-contables",
	CATALOGOS_CLAVES_PRODUCTO: "/catalogos/claves-producto",
	CATALOGOS_DIVISION: "/catalogos/division",
	// Funcionalidades adicionales
	POLIZAS: "/polizas",
	TIMBRADO: "/timbrado",
	TIMBRADO_DE_GASTOS: "/timbrado-de-gastos",
	ANALYTICS: "/analytics",
	CONFIG_PARAMETROS: "/configuracion-parametros-gastos",
} as const;

/**
 * Constantes de permisos de la aplicación.
 * Estos permisos se combinan con el ID de empresa para validar acceso.
 */
export const PERMISSIONS = {
	SECCION_GASTOS: "SeccionGestionGastos",
	SECCION_DATOS_EMPLEADO: "SeccionDatosEmpleado",
	SECCION_CENTRO_COSTOS: "SeccionCentrodeCostosGastos",
	SECCION_PLAZAS: "SeccionPlazas",
	SECCION_CUENTA_CONTABLE: "SeccionCuentaContableGastos",
	SECCION_CLAVES_PRODUCTO: "SeccionClaveProductoGastos",
	SECCION_DIVISION: "SeccionDivision",
	SECCION_PRORRATEO: "SeccionProrrateo",
	SECCION_POLIZAS: "SeccionPolizasGastos",
	SECCION_TIMBRADO: "SeccionTimbradoGastos",
	SECCION_ANALYTICS: "SeccionAnalitycs",
	SECCION_PARAMETROS_GASTOS: "SeccionParametrosGastos",
} as const;

/**
 * Tipo para los permisos de la aplicación.
 */
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Tipo para las rutas de la aplicación.
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Tipo que define la estructura de una ruta de navegación.
 */
export interface RouteConfig {
	/** Identificador único de la ruta */
	id: number;
	/** Etiqueta a mostrar en la UI */
	label: string;
	/** Ruta URL (opcional para rutas padre) */
	path: RoutePath | string;
	/** Icono de FontAwesome */
	icon: IconDefinition;
	/** Permisos requeridos para acceder a esta ruta */
	requiredPermissions?: Permission[];
	/** Indica si esta ruta requiere ser autorizador */
	requiresAutorizador?: boolean;
	/** Indica si esta ruta debe estar oculta para super usuarios */
	hiddenForSuperUsuario?: boolean;
	/** Rutas hijas (para submenús) */
	children?: RouteConfig[];
	/** Componente lazy a renderizar (solo para App.tsx) */
	component?: () => Promise<{ default: React.ComponentType<object> }>;
}

/**
 * Configuración centralizada de todas las rutas de la aplicación.
 * Esta configuración es la fuente única de verdad para:
 * - Definir las rutas en App.tsx
 * - Generar el menú en Sidebar.tsx
 * - Validar permisos
 */
export const routesConfig: RouteConfig[] = [
	// Dashboard - Se implementará en Fase 2
	// {
	// 	id: 1,
	// 	label: "Dashboard",
	// 	path: ROUTES.DASHBOARD,
	// 	icon: faChartGantt,
	// 	requiredPermissions: [PERMISSIONS.SECCION_GASTOS],
	// 	component: () => import("../pages/Dashboard"),
	// },
	// Gastos - Se implementará en Fase 2
	// {
	// 	id: 2,
	// 	label: "Gastos",
	// 	path: "",
	// 	icon: faMoneyBill,
	// 	children: [
	// 		{
	// 			id: 21,
	// 			label: "Gestión de gastos",
	// 			path: ROUTES.GASTOS_LISTADO,
	// 			icon: faMoneyBill,
	// 			requiredPermissions: [PERMISSIONS.SECCION_GASTOS],
	// 			component: () => import("../pages/gastos/ListadoGastos"),
	// 		},
	// 		// ... más rutas de gastos
	// 	],
	// },
	// Administración - Se implementará en fases posteriores
	// Catálogos - Se implementará en fases posteriores
	// Pólizas - Se implementará en fases posteriores
	// Timbrado - Se implementará en fases posteriores
	// Analytics - Se implementará en fases posteriores
];

/**
 * Rutas adicionales que no aparecen en el sidebar pero están en el router.
 * Estas rutas son accesibles mediante navegación programática o enlaces directos.
 * Se implementarán en fases posteriores.
 */
export const additionalRoutes: RouteConfig[] = [
	// Se implementarán en fases posteriores
];


