import type { MenuPage } from "../types/menu";

/**
 * Configuración base de menús del sistema
 * Esta configuración se filtra según los permisos del usuario
 * Migrado de LeftMenuComponent.filtraMenus() de Angular
 */
export const menuConfigBase: MenuPage[] = [
	{
		name: "Proveedores",
		link: "",
		imageUrl: "/assets/iconos2.0/proveedores.svg",
		nestedPages: [
			{
				name: "Ordenes de compra",
				link: "/ordenes-compra",
				imageUrl: "/assets/iconos2.0/oc.svg",
				permiso: "SeccionOrdenCompraRFacil",
				unico: false,
			},
			{
				name: "Facturas",
				link: "/facturas",
				imageUrl: "/assets/iconos2.0/facturas.svg",
				permiso: "SeccionFactura",
				unico: false,
			},
			{
				name: "Depósitos",
				link: "/depositos",
				imageUrl: "/assets/iconos2.0/pagos.svg",
				permiso: "SeccionPagos",
				unico: false,
			},
			{
				name: "Expediente digital",
				link: "/documentacion",
				imageUrl: "/assets/iconos2.0/digital.svg",
				permiso: "SeccionCargaDocumentos",
				unico: false,
			},
			{
				name: "Reportes",
				link: "/reportes",
				imageUrl: "/assets/iconos2.0/reportes.svg",
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
			imageUrl: "/assets/iconos2.0/iconos gastos/gastos.svg",
			nestedPages: [
				{
					name: "Listado de gastos",
					link: "/gastos/listado",
					imageUrl: "/assets/iconos2.0/iconos gastos/gestionGastos.svg",
					permiso: "SeccionGestionGastos",
					unico: false,
				},
				{
					name: "Mis gastos",
					link: "/gastos/mis-gastos",
					imageUrl: "/assets/iconos2.0/iconos gastos/gestionGastos.svg",
					permiso: "SeccionGestionGastos",
					unico: false,
				},
				{
					name: "Gastos por autorizar",
					link: "/gastos/por-autorizar",
					imageUrl: "/assets/iconos2.0/iconos gastos/gestionGastos.svg",
					permiso: "SeccionGestionGastos",
					unico: false,
				},
				{
					name: "Gastos autorizados",
					link: "/gastos/autorizados",
					imageUrl: "/assets/iconos2.0/iconos gastos/gestionGastos.svg",
					permiso: "SeccionGestionGastos",
					unico: false,
				},
				{
					name: "Gastos por pagar",
					link: "/gastos/por-pagar",
					imageUrl: "/assets/iconos2.0/iconos gastos/gestionGastos.svg",
					permiso: "SeccionGestionGastos",
					unico: false,
				},
				{
					name: "Datos para el empleado",
					link: "/datos-empleado",
					imageUrl: "/assets/iconos2.0/iconos gastos/datosEmpleado.svg",
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
		imageUrl: "/assets/iconos2.0/contabilidad.svg",
		nestedPages: [
			{
				name: "Layout",
				link: "/layout",
				imageUrl: "/assets/iconos2.0/layout.svg",
				permiso: "SeccionLayout",
				unico: false,
			},
			{
				name: "Cuentas contables",
				link: "/cuenta-contable",
				imageUrl: "/assets/cuentaContable.svg",
				permiso: "SeccionCuentaContableGastos",
				unico: false,
			},
			{
				name: "Parámetros de gastos",
				link: "/configuracion-parametros-gastos",
				imageUrl: "/assets/settings.svg",
				permiso: "SeccionParametrosGastos",
				unico: false,
			},
			{
				name: "Centro de costos",
				link: "/catalogos/centros-costos",
				imageUrl: "/assets/iconos2.0/iconos gastos/costosCuenta.svg",
				permiso: "SeccionCentrodeCostosGastos",
				unico: false,
			},
			{
				name: "Ordenes de compra entorno",
				link: "/orden-compra-entorno",
				imageUrl: "/assets/cuentaContable.svg",
				permiso: "SeccionEntornoOc",
				unico: true,
				nestedPages: [],
			},
		],
		expanded: false,
		unico: false,
	},
	{
		name: "Catálogo",
		link: "",
		imageUrl: "/assets/iconos2.0/catalogos.svg",
		nestedPages: [
			{
				name: "Tipo de documento",
				link: "/tiposdocumento",
				imageUrl: "/assets/iconos2.0/tipoDocumento.svg",
				permiso: "SeccionTiposDocumentos",
				unico: false,
			},
			{
				name: "Orden de mantenimiento",
				link: "/orden-mantenimiento",
				imageUrl: "/assets/iconos2.0/ordenMantenimiento.svg",
				permiso: "SeccionOrdenMantenimiento",
				unico: false,
			},
			{
				name: "Centro de costos",
				link: "/catalogos/centros-costos",
				imageUrl: "/assets/iconos2.0/iconos gastos/cuentasCosto.svg",
				permiso: "SeccionCentrodeCostosGastos",
				unico: false,
			},
			{
				name: "Claves de productos",
				link: "/catalogos/claves-producto",
				imageUrl: "/assets/iconos2.0/iconos gastos/clavesProducto.svg",
				permiso: "SeccionClaveProductoGastos",
				unico: false,
			},
			{
				name: "División",
				link: "/catalogos/division",
				imageUrl: "/assets/iconos2.0/iconos gastos/division.svg",
				permiso: "SeccionDivision",
				unico: false,
			},
			{
				name: "Plazas",
				link: "/catalogos/plazas",
				imageUrl: "/assets/iconos2.0/iconos gastos/plazas.svg",
				permiso: "SeccionPlazas",
				unico: false,
			},
			{
				name: "Cuentas contables",
				link: "/catalogos/cuentas-contables",
				imageUrl: "/assets/cuentaContable.svg",
				permiso: "SeccionCuentaContableGastos",
				unico: false,
			},
		],
		expanded: false,
		unico: false,
	},
	{
		name: "Pólizas de Gastos",
		link: "/polizas",
		imageUrl: "/assets/iconos2.0/iconos gastos/polizas.svg",
		permiso: "SeccionPolizasGastos",
		expanded: false,
		unico: true,
		nestedPages: [],
	},
	{
		name: "Timbrado de Gastos",
		link: "/timbrado-de-gastos",
		imageUrl: "/assets/iconos2.0/iconos gastos/timbrado.svg",
		permiso: "SeccionTimbradoGastos",
		expanded: false,
		unico: true,
		nestedPages: [],
	},
	{
		name: "Analitycs",
		link: "/analytics",
		imageUrl: "/assets/iconos2.0/reportes.svg",
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
	imageUrl: "/assets/iconos2.0/usuarios/usuarios.svg",
	nestedPages: [
		{
			name: "Corporativo",
			link: "/corporativo",
			imageUrl: "/assets/iconos2.0/usuarios/corporativos.svg",
			permiso: "",
			unico: false,
		},
		{
			name: "Empresas",
			link: "/empresas",
			imageUrl: "/assets/iconos2.0/usuarios/empresas.svg",
			permiso: "",
			unico: false,
		},
		{
			name: "Servicio por Empresa",
			link: "/menu-empresa",
			imageUrl: "/assets/iconos2.0/usuarios/servicioEmpresa.svg",
			permiso: "",
			unico: false,
		},
		{
			name: "Usuarios Corporativos",
			link: "/usuario-multiempresa",
			imageUrl: "/assets/iconos2.0/usuarios/usuarioCorporativo.svg",
			permiso: "",
			unico: false,
		},
		{
			name: "Roles por corporativo",
			link: "/rol-por-corporativo",
			imageUrl: "/assets/iconos2.0/usuarios/roles.svg",
			permiso: "",
			unico: false,
		},
		{
			name: "Roles por empresas",
			link: "/rol-multiempresa",
			imageUrl: "/assets/iconos2.0/usuarios/roles.svg",
			permiso: "",
			unico: false,
		},
		{
			name: "Usuarios",
			link: "/usuario-multiempresa-filtrado",
			imageUrl: "/assets/iconos2.0/usuarios1.svg",
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
	imageUrl: "/assets/iconos2.0/usuarios/usuarios.svg",
	nestedPages: [
		{
			name: "Empresas",
			link: "/empresas",
			imageUrl: "/assets/iconos2.0/usuarios/empresas.svg",
			permiso: "",
			unico: false,
		},
		{
			name: "Roles por empresas",
			link: "/rol-multiempresa",
			imageUrl: "/assets/iconos2.0/usuarios/roles.svg",
			permiso: "",
			unico: false,
		},
		{
			name: "Usuarios",
			link: "/usuario-multiempresa-filtrado",
			imageUrl: "/assets/iconos2.0/usuarios1.svg",
			permiso: "",
			unico: false,
		},
		{
			name: "Configuración",
			link: "/configuracion",
			imageUrl: "/assets/view.svg",
			permiso: "",
			unico: false,
		},
	],
	expanded: false,
	unico: false,
};

