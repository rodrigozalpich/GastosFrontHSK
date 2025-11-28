/**
 * Tipos e interfaces para el sistema de autenticación y seguridad multiempresa
 */

//#region Credenciales y Autenticación

/**
 * Credenciales para iniciar sesión en el sistema
 */
export interface CredencialesUsuario {
	/** Correo electrónico de la cuenta */
	email: string;
	/** Contraseña de la cuenta */
	password: string;
	/** Identificador único del rol */
	role: string;
}

/**
 * Respuesta de autenticación del servidor
 */
export interface RespuestaAutenticacion {
	/** Token JWT para autenticación */
	token: string;
	/** Fecha de expiración del token */
	fechaExpiracion: string | Date;
}

/**
 * DTO para reestablecer contraseña
 */
export interface ReestablecerContrasenia {
	idUsuario: string;
	nuevaContrasenia: string;
	nuevaContraseniaConfirma: string;
}

//#endregion

//#region Usuarios

/**
 * Usuario base del sistema
 */
export interface UsuarioBase {
	id: number;
	idAspNetUser: string;
	nombreCompleto: string;
	apaterno: string;
	amaterno: string;
	nombreUsuario: string;
	correo: string;
	activo: boolean;
}

/**
 * Usuario base con contraseña
 */
export interface UsuarioBaseConContrasenia extends UsuarioBase {
	contrasenia: string;
}

/**
 * Usuario de gastos
 */
export interface UsuarioGasto extends UsuarioBase {
	numeroEmpleado: string;
	estatus: number;
	fecha_alta: Date | string;
	fecha_baja: Date | string | null;
}

/**
 * Usuario proveedor
 */
export interface UsuarioProveedor extends UsuarioBase {
	rfc: string;
	identificadorFiscal: string;
	numeroProveedor: string;
}

/**
 * Usuario por corporativo
 */
export interface UsuarioPorCorporativo {
	idCorporativo: number;
	idUsuario: number;
	idRol: number;
	idEmpresa: number;
	descripcion: string;
	esUsuarioCorporativo: boolean;
	estaEnEmpresa: boolean;
	estructura: UsuarioPorCorporativo[];
}

/**
 * Estructura de usuario corporativo
 */
export interface UsuarioEstructuraCorporativo extends UsuarioBase {
	idUsuario: number;
	esActivo: boolean;
	tipo: number;
	rfc: string;
}

/**
 * Estructura de usuario por empresa
 */
export interface UsuarioEmpresaEstructura {
	idEmpresa: number;
	idRol: number;
	nombreEmpresa: string;
	activoEmpresa: boolean;
	roles: unknown[]; // RolDTO - se definirá cuando se migre el módulo de roles
	esUsuarioGastos: boolean;
}

/**
 * DTO de usuario de gastos (formato específico)
 */
export interface UsuarioGastoDTO {
	id: number;
	idUsuario: number;
	nombre: string;
	apellidoPaterno: string;
	apellidoMaterno: string;
	estatus: number;
	fecha_alta: Date | string;
	fecha_baja: Date | string | null;
	numeroEmpleado: string;
}

//#endregion

//#region Roles y Permisos

/**
 * DTO para editar nombre de rol
 */
export interface RoleEditaNombre {
	id: string;
	name: string;
}

/**
 * DTO de permiso por rol
 */
export interface RolePermiso {
	id: string;
	RoleId: string;
	ClaimType: string;
	ClaimValue: string;
}

/**
 * DTO para creación de rol
 */
export interface RoleCreacion {
	descripcion: string;
	listaIdPantallas: number[];
}

/**
 * DTO de pantalla/tabla
 */
export interface PantallaTabla {
	idPantallaTabla: number;
	descripcion: string;
	codigoTabla: string;
	idPadre: number;
	listaHijos: PantallaTablaAutorizar[];
}

/**
 * DTO de pantalla/tabla con autorización
 */
export interface PantallaTablaAutorizar extends PantallaTabla {
	esAutorizado: boolean;
	esIndetermediate: boolean;
}

/**
 * DTO de rol con permiso
 */
export interface RolPermiso {
	id: string;
	permiso: PantallaTablaAutorizar;
}

/**
 * DTO de usuario con rol
 */
export interface UsuarioConRole {
	id: string;
	email: string;
	roleId: string;
	permisos: string[];
}

/**
 * DTO de usuario
 */
export interface UsuarioDTO {
	id: string;
	Email: string;
	listaHijos: PantallaTablaAutorizar[];
}

//#endregion


