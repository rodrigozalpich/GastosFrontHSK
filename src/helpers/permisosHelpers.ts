/**
 * Helpers para validación de permisos multiempresa
 * Adaptado de safe.guard.ts de Angular
 */

import { seguridadService } from "../services/seguridadService";

/**
 * Función helper genérica para validar permisos por empresa
 * @param permisoBase - Nombre base del permiso (ej: "SeccionGastos")
 * @param idEmpresa - ID de la empresa (opcional, se obtiene del localStorage si no se proporciona)
 * @returns true si el usuario tiene el permiso o es VisorCorporativo
 */
function tienePermisoPorEmpresa(permisoBase: string, idEmpresa?: string | null): boolean {
	const empresaId = idEmpresa || seguridadService.obtenerIdEmpresa();
	
	if (!empresaId || empresaId === "") {
		return false;
	}

	const permisoArmado = `${permisoBase}-${empresaId}`;
	const permiso = seguridadService.obtenerCampoJwt(permisoArmado);
	const visorCorporativo = seguridadService.obtenerCampoJwt("VisorCorporativo");

	// Tiene el permiso específico o es VisorCorporativo
	return (
		(permiso !== undefined && permiso !== null && permiso !== "") ||
		(visorCorporativo !== undefined && visorCorporativo !== null && visorCorporativo !== "")
	);
}

/**
 * Verifica si el usuario es Administrador
 */
export function esAdmin(): boolean {
	const role = seguridadService.obtenerCampoJwt("role");
	return role === "Administrador";
}

/**
 * Verifica si el usuario es VisorCorporativo
 */
export function esVisorCorporativo(): boolean {
	const visorCorporativo = seguridadService.obtenerCampoJwt("VisorCorporativo");
	return visorCorporativo !== undefined && visorCorporativo !== null && visorCorporativo !== "";
}

//#region Permisos de Gastos

/**
 * Verifica si el usuario puede crear gastos
 */
export function esCrearGasto(): boolean {
	return tienePermisoPorEmpresa("CrearGasto");
}

/**
 * Verifica si el usuario puede pagar gastos
 */
export function esPagarGasto(): boolean {
	return tienePermisoPorEmpresa("PagarGasto");
}

/**
 * Verifica si el usuario puede ver lista de gastos
 */
export function esVerListaGastos(): boolean {
	return tienePermisoPorEmpresa("VerTodosGastos");
}

/**
 * Verifica si el usuario puede ver la sección de mis gastos
 */
export function esSeccionMisGastos(): boolean {
	return tienePermisoPorEmpresa("SeccionMisGastos");
}

//#endregion

//#region Permisos de Pólizas

/**
 * Verifica si el usuario puede ver pólizas de diario
 */
export function esVerPolizaDiario(): boolean {
	return tienePermisoPorEmpresa("VerPolizaDiario");
}

/**
 * Verifica si el usuario puede ver pólizas de ingreso
 */
export function esVerPolizaIngreso(): boolean {
	return tienePermisoPorEmpresa("VerPolizaIngreso");
}

/**
 * Verifica si el usuario puede ver pólizas de egreso
 */
export function esVerPolizaEgreso(): boolean {
	return tienePermisoPorEmpresa("VerPolizaEgreso");
}

/**
 * Verifica si el usuario puede crear pólizas de egreso
 */
export function esCrearPolizaEgreso(): boolean {
	return tienePermisoPorEmpresa("CrearPolizaEgreso");
}

/**
 * Verifica si el usuario puede crear pólizas de diario
 */
export function esCrearPolizaDiario(): boolean {
	return tienePermisoPorEmpresa("CrearPolizaDiario");
}

/**
 * Verifica si el usuario puede crear pólizas de ingreso
 */
export function esCrearPolizaIngreso(): boolean {
	return tienePermisoPorEmpresa("CrearPolizaIngreso");
}

//#endregion

//#region Permisos de Timbrado

/**
 * Verifica si el usuario puede ver gastos timbrados
 */
export function esVerGastosTimbrados(): boolean {
	return tienePermisoPorEmpresa("VerGastosTimbrados");
}

/**
 * Verifica si el usuario puede ver gastos por timbrar
 */
export function esVerGastosPorTimbrar(): boolean {
	return tienePermisoPorEmpresa("VerGastosTimbrados"); // Mismo permiso según el código Angular
}

//#endregion

//#region Permisos de Catálogos de Gastos

/**
 * Verifica si el usuario puede crear divisiones
 */
export function esCrearDivision(): boolean {
	return tienePermisoPorEmpresa("CrearDivision");
}

/**
 * Verifica si el usuario puede editar divisiones
 */
export function esEditarDivision(): boolean {
	return tienePermisoPorEmpresa("EditarDivision");
}

/**
 * Verifica si el usuario puede borrar divisiones
 */
export function esBorrarDivision(): boolean {
	return tienePermisoPorEmpresa("EliminarDivision");
}

/**
 * Verifica si el usuario puede crear plazas
 */
export function esCrearPlaza(): boolean {
	return tienePermisoPorEmpresa("CrearPlaza");
}

/**
 * Verifica si el usuario puede editar plazas
 */
export function esEditarPlaza(): boolean {
	return tienePermisoPorEmpresa("EditarPlaza");
}

/**
 * Verifica si el usuario puede borrar plazas
 */
export function esBorrarPlaza(): boolean {
	return tienePermisoPorEmpresa("EliminarPlaza");
}

/**
 * Verifica si el usuario puede crear cuentas contables de gastos
 */
export function esCrearCuentaContableGastos(): boolean {
	return tienePermisoPorEmpresa("CrearCuentaContableGastos");
}

/**
 * Verifica si el usuario puede editar cuentas contables de gastos
 */
export function esEditarCuentaContableGastos(): boolean {
	return tienePermisoPorEmpresa("EditarCuentaCuentaContable");
}

/**
 * Verifica si el usuario puede eliminar cuentas contables de gastos
 */
export function esEliminarCuentaContableGastos(): boolean {
	return tienePermisoPorEmpresa("EliminarCuentaContableGastos");
}

/**
 * Verifica si el usuario puede crear centros de costos
 */
export function esCrearCentroCosto(): boolean {
	return tienePermisoPorEmpresa("CrearCentrodeCostos");
}

/**
 * Verifica si el usuario puede editar centros de costos
 */
export function esEditarCentroCosto(): boolean {
	return tienePermisoPorEmpresa("EditarCentrodeCostos");
}

/**
 * Verifica si el usuario puede borrar centros de costos
 */
export function esBorrarCentroCosto(): boolean {
	return tienePermisoPorEmpresa("EliminarCentrodeCostos");
}

/**
 * Verifica si el usuario puede editar empleados
 */
export function esEditarEmpleado(): boolean {
	return tienePermisoPorEmpresa("EditarEmpleado");
}

/**
 * Verifica si el usuario puede crear claves de producto por división
 */
export function esCrearClaveProdxDivision(): boolean {
	return tienePermisoPorEmpresa("CrearClaveProdxDivision");
}

/**
 * Verifica si el usuario puede borrar claves de producto por división
 */
export function esBorrarClaveProdxDivision(): boolean {
	return tienePermisoPorEmpresa("EliminarClaveProdxDivision");
}

//#endregion

//#region Permisos de Secciones

/**
 * Verifica si el usuario tiene acceso a una sección específica
 * @param seccion - Código de la sección (ej: "SeccionGastos", "SeccionDatosEmpleado")
 * @param idEmpresa - ID de la empresa (opcional)
 * @returns true si tiene acceso
 */
export function tieneAccesoSeccion(seccion: string, idEmpresa?: string | null): boolean {
	return tienePermisoPorEmpresa(seccion, idEmpresa);
}

/**
 * Verifica acceso a sección de gastos
 * Actualizado según el JWT real: "SeccionGestionGastos"
 */
export function esSeccionGastos(): boolean {
	return tienePermisoPorEmpresa("SeccionGestionGastos");
}

/**
 * Verifica acceso a sección de datos de empleado
 */
export function esSeccionDatosEmpleado(): boolean {
	return tienePermisoPorEmpresa("SeccionDatosEmpleado");
}

/**
 * Verifica acceso a sección de centro de costos
 */
export function esSeccionCentroCostos(): boolean {
	return tienePermisoPorEmpresa("SeccionCentrodeCostosGastos");
}

/**
 * Verifica acceso a sección de plazas
 */
export function esSeccionPlazas(): boolean {
	return tienePermisoPorEmpresa("SeccionPlazas");
}

/**
 * Verifica acceso a sección de cuenta contable
 */
export function esSeccionCuentaContable(): boolean {
	return tienePermisoPorEmpresa("SeccionCuentaContableGastos");
}

/**
 * Verifica acceso a sección de claves de producto
 */
export function esSeccionClaveProducto(): boolean {
	return tienePermisoPorEmpresa("SeccionClaveProductoGastos");
}

/**
 * Verifica si el usuario puede crear claves de producto
 */
export function esCrearClaveProducto(): boolean {
	return tienePermisoPorEmpresa("CrearClaveProdxDivision");
}

/**
 * Verifica si el usuario puede editar claves de producto
 */
export function esEditarClaveProducto(): boolean {
	return tienePermisoPorEmpresa("CrearClaveProdxDivision"); // Mismo permiso para crear/editar
}

/**
 * Verifica si el usuario puede borrar claves de producto
 */
export function esBorrarClaveProducto(): boolean {
	return tienePermisoPorEmpresa("EliminarClaveProdxDivision");
}

/**
 * Verifica acceso a sección de división
 */
export function esSeccionDivision(): boolean {
	return tienePermisoPorEmpresa("SeccionDivision");
}

/**
 * Verifica acceso a sección de pólizas
 */
export function esSeccionPolizas(): boolean {
	return tienePermisoPorEmpresa("SeccionPolizasGastos");
}

/**
 * Verifica acceso a sección de timbrado
 */
export function esSeccionTimbrado(): boolean {
	return tienePermisoPorEmpresa("SeccionTimbradoGastos");
}

/**
 * Verifica acceso a sección de analytics
 */
export function esSeccionAnalytics(): boolean {
	return tienePermisoPorEmpresa("SeccionAnalitycs");
}

//#endregion

//#region Permisos de Parámetros de Gastos

/**
 * Verifica acceso a sección de parámetros de gastos
 */
export function esSeccionParametrosGastos(): boolean {
	return tienePermisoPorEmpresa("SeccionParametrosGastos");
}

/**
 * Verifica si el usuario puede crear parámetros
 */
export function esCrearParametro(): boolean {
	return tienePermisoPorEmpresa("CrearParametroGastos");
}

/**
 * Verifica si el usuario puede editar parámetros
 */
export function esEditarParametro(): boolean {
	return tienePermisoPorEmpresa("EditarParametroGastos");
}

/**
 * Verifica si el usuario puede borrar parámetros
 */
export function esBorrarParametro(): boolean {
	return tienePermisoPorEmpresa("EliminarParametroGastos");
}

//#endregion


