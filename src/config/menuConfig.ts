import type { MenuPage } from "../types/menu";
import { ICONOS_MENU } from "./iconPaths";

/**
 * Configuración base de menús del sistema
 * Esta configuración se filtra según los permisos del usuario
 * Migrado de LeftMenuComponent.filtraMenus() de Angular
 */
export const menuConfigBase: MenuPage[] = [
	{
		name: "Proveedores",
		link: "",
		imageUrl: ICONOS_MENU.proveedores,
		nestedPages: [
			{
				name: "Ordenes de compra",
				link: "/ordenes-compra",
				imageUrl: ICONOS_MENU.oc,
				permiso: "SeccionOrdenCompraRFacil",
				unico: false,
			},
			{
				name: "Facturas",
				link: "/facturas",
				imageUrl: ICONOS_MENU.facturas,
				permiso: "SeccionFactura",
				unico: false,
			},
			{
				name: "Depósitos",
				link: "/depositos",
				imageUrl: ICONOS_MENU.pagos,
				permiso: "SeccionPagos",
				unico: false,
			},
			{
				name: "Expediente digital",
				link: "/documentacion",
				imageUrl: ICONOS_MENU.digital,
				permiso: "SeccionCargaDocumentos",
				unico: false,
			},
			{
				name: "Reportes",
				link: "/reportes",
				imageUrl: ICONOS_MENU.analytics,
				permiso: "SeccionReportes",
				unico: false,
			},
		],
		expanded: false,
		unico: false,
	},
	{
		name: "Gastos",
		link: "",
		imageUrl: ICONOS_MENU.gastos,
		nestedPages: [
			{
				name: "Gestión de gastos",
				link: "/gastos/listado",
				imageUrl: ICONOS_MENU.gestionGastos,
				permiso: "SeccionGestionGastos",
				unico: false,
			},
			{
				name: "Datos para el empleado",
				link: "/datos-empleado",
				imageUrl: ICONOS_MENU.datosEmpleado,
				permiso: "SeccionDatosEmpleado",
				unico: false,
			},
		],
		expanded: false,
		unico: false,
	},
	{
		name: "Configuración",
		link: "",
		imageUrl: ICONOS_MENU.contabilidad,
		nestedPages: [
			{
				name: "Cuentas contables",
				link: "/cuenta-contable",
				imageUrl: ICONOS_MENU.cuentaContable,
				permiso: "SeccionCuentaContableGastos",
				unico: false,
			},
			{
				name: "Parámetros de gastos",
				link: "/configuracion-parametros-gastos",
				imageUrl: ICONOS_MENU.settings,
				permiso: "SeccionParametrosGastos",
				unico: false,
			},
			{
				name: "Centro de costos",
				link: "/catalogos/centros-costos",
				imageUrl: ICONOS_MENU.costosCuenta,
				permiso: "SeccionCentrodeCostosGastos",
				unico: false,
			},
		],
		expanded: false,
		unico: false,
	},
	{
		name: "Catálogo",
		link: "",
		imageUrl: ICONOS_MENU.catalogos,
		nestedPages: [
			{
				name: "Tipo de documento",
				link: "/tiposdocumento",
				imageUrl: ICONOS_MENU.tipoDocumento,
				permiso: "SeccionTiposDocumentos",
				unico: false,
			},
			{
				name: "Orden de mantenimiento",
				link: "/orden-mantenimiento",
				imageUrl: ICONOS_MENU.ordenMantenimiento,
				permiso: "SeccionOrdenMantenimiento",
				unico: false,
			},
			{
				name: "Claves de productos",
				link: "/catalogos/claves-producto",
				imageUrl: ICONOS_MENU.clavesProducto,
				permiso: "SeccionClaveProductoGastos",
				unico: false,
			},
			{
				name: "División",
				link: "/catalogos/division",
				imageUrl: ICONOS_MENU.division,
				permiso: "SeccionDivision",
				unico: false,
			},
			{
				name: "Plazas",
				link: "/catalogos/plazas",
				imageUrl: ICONOS_MENU.plazas,
				permiso: "SeccionPlazas",
				unico: false,
			},
		],
		expanded: false,
		unico: false,
	},
	{
		name: "Pólizas de Gastos",
		link: "/polizas",
		imageUrl: ICONOS_MENU.polizas,
		permiso: "SeccionPolizasGastos",
		expanded: false,
		unico: true,
		nestedPages: [],
	},
	{
		name: "Timbrado de Gastos",
		link: "/timbrado-de-gastos",
		imageUrl: ICONOS_MENU.timbrado,
		permiso: "SeccionTimbradoGastos",
		expanded: false,
		unico: true,
		nestedPages: [],
	},
	{
		name: "Analitycs",
		link: "/analytics",
		imageUrl: ICONOS_MENU.analytics,
		permiso: "SeccionAnalitycs",
		expanded: false,
		unico: true,
		nestedPages: [],
	},
];

/**
 * Menús especiales para Administrador
 */
export const menuAdministrador: MenuPage = {
	name: "Administración",
	link: "",
	imageUrl: ICONOS_MENU.usuarios,
	nestedPages: [
		{
			name: "Corporativo",
			link: "/corporativo",
			imageUrl: ICONOS_MENU.corporativos,
			permiso: "",
			unico: false,
		},
		{
			name: "Empresas",
			link: "/empresas",
			imageUrl: ICONOS_MENU.empresas,
			permiso: "",
			unico: false,
		},
		{
			name: "Servicio por Empresa",
			link: "/menu-empresa",
			imageUrl: ICONOS_MENU.servicioEmpresa,
			permiso: "",
			unico: false,
		},
		{
			name: "Usuarios Corporativos",
			link: "/usuario-multiempresa",
			imageUrl: ICONOS_MENU.usuarioCorporativo,
			permiso: "",
			unico: false,
		},
		{
			name: "Roles por corporativo",
			link: "/rol-por-corporativo",
			imageUrl: ICONOS_MENU.roles,
			permiso: "",
			unico: false,
		},
		{
			name: "Roles por empresas",
			link: "/rol-multiempresa",
			imageUrl: ICONOS_MENU.roles,
			permiso: "",
			unico: false,
		},
		{
			name: "Usuarios",
			link: "/usuario-multiempresa-filtrado",
			imageUrl: ICONOS_MENU.usuarios1,
			permiso: "",
			unico: false,
		},
	],
	expanded: false,
	unico: false,
};

/**
 * Menús especiales para VisorCorporativo (no Administrador)
 */
export const menuVisorCorporativo: MenuPage = {
	name: "Administración",
	link: "",
	imageUrl: ICONOS_MENU.usuarios,
	nestedPages: [
		{
			name: "Empresas",
			link: "/empresas",
			imageUrl: ICONOS_MENU.empresas,
			permiso: "",
			unico: false,
		},
		{
			name: "Roles por empresas",
			link: "/rol-multiempresa",
			imageUrl: ICONOS_MENU.roles,
			permiso: "",
			unico: false,
		},
		{
			name: "Usuarios",
			link: "/usuario-multiempresa-filtrado",
			imageUrl: ICONOS_MENU.usuarios1,
			permiso: "",
			unico: false,
		},
		{
			name: "Configuración",
			link: "/configuracion",
			imageUrl: ICONOS_MENU.view,
			permiso: "",
			unico: false,
		},
	],
	expanded: false,
	unico: false,
};

