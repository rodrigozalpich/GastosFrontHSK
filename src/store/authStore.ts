import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seguridadService } from "../services/seguridadService";
import type { CredencialesUsuario, RespuestaAutenticacion } from "../types/seguridad";
import { jwtDecode } from "jwt-decode";

/**
 * @interface Seccion
 * @description Representa una sección dentro de una empresa.
 */
export interface Seccion {
	id: number;
	descripcion: string;
	codigoSeccion: string;
	descripcionInterna: string;
	esSeccionUnica: boolean;
	existeRelacion: boolean;
}

/**
 * @interface Actividad
 * @description Representa una actividad dentro de una empresa.
 */
interface Actividad {
	id: number;
	idSeccion: number;
	descripcion: string;
	codigoActividad: string;
	descripcionInterna: string;
	esActividadUnica: boolean;
	existeRelacion: boolean;
}

/**
 * @interface Empresa
 * @description Representa una empresa y sus secciones y actividades asociadas.
 */
export interface Empresa {
	idEmpresa: number;
	nombreEmpresa: string;
	seccionesDTO: Seccion[];
	actividades: Actividad[];
}

interface DecodedToken {
	idUsuario: string;
	Username: string;
	nombreCompleto: string;
	exp: number;
	SuperUser?: string | boolean | number;

	[key: string]: string | number | boolean | undefined;
}

// Extender AuthState para incluir nombreCompleto como getter
declare module "../store/authStore" {
	interface AuthState {
		nombreCompleto: string | null;
	}
}

/**
 * @interface AuthState
 * @description Define el estado y las acciones para el store de autenticación.
 */
interface AuthState {
	token: string | null;
	fechaExpiracion: string | null;
	empresaSeccionActividades: Record<number, Empresa> | null;
	empresasPertenecientes: import("../types/empresas").Empresa1[] | null;
	estaLogueado: boolean;
	estaHidratado: boolean;
	esSuperUsuario: boolean;
	permisosEspeciales: DecodedToken | null;
	esAutorizador: boolean | null;
	empresaActivaId: number | null;
	muestraEmpresas: boolean;

	login: (email: string, password: string) => Promise<boolean>;
	logout: () => void;
	verificarSiEsAutorizador: (idEmpresa: number) => Promise<void>;
	setEmpresaActiva: (idEmpresa: number) => void;
	cargarEmpresas: () => Promise<void>;
	cambiarEmpresa: (idEmpresa: number) => void;

	getEmpresaById: (idEmpresa: number) => Empresa | undefined;
	getSeccionesByEmpresa: (idEmpresa: number) => Seccion[] | undefined;
	getActividadesByEmpresa: (idEmpresa: number) => Actividad[] | undefined;
	getActividadByCodigo: (idEmpresa: number, codigo: string) => Actividad | undefined;

	// Nuevos métodos para multiempresa
	obtenerIdEmpresa: () => number | null;
	guardarIdEmpresa: (idEmpresa: number) => void;
	obtenerCampoJwt: (campo: string) => string;
	obtenerPermisoEspecial: (clave: string) => string;
	tienePermiso: (permiso: string, idEmpresa?: number) => boolean;
}

/**
 * Store de Zustand para manejar el estado de autenticación de la aplicación.
 * Utiliza el middleware `persist` para guardar el estado en el almacenamiento local.
 *
 * @property {string | null} token - El token de autenticación JWT.
 * @property {string | null} fechaExpiracion - La fecha de expiración del token.
 * @property {Empresa[] | null} empresaSeccionActividades - Datos sobre las empresas, secciones y actividades del usuario.
 * @property {boolean} estaLogueado - Un indicador de si el usuario está autenticado.
 * @property {boolean} estaHidratado - Un indicador para saber si el estado ha sido rehidratado desde el almacenamiento.
 * @function login - Realiza la autenticación del usuario y actualiza el estado.
 * @function logout - Cierra la sesión del usuario y limpia el estado.
 * @function getEmpresaById - Obtiene los datos de una empresa por su ID.
 * @function getSeccionesByEmpresa - Obtiene las secciones de una empresa por su ID.
 * @function getActividadesByEmpresa - Obtiene las actividades de una empresa por su ID.
 * @function getActividadByCodigo - Obtiene una actividad específica por su código dentro de una empresa.
 */
export const useAuthStore = create<AuthState>()(
		persist(
			(set, get) => ({
				token: null,
				fechaExpiracion: null,
				empresaSeccionActividades: null,
				empresasPertenecientes: null,
				estaLogueado: false,
				estaHidratado: false,
				esSuperUsuario: false,
				permisosEspeciales: null,
				esAutorizador: null,
				empresaActivaId: null,
				muestraEmpresas: true,

			setEmpresaActiva: (idEmpresa: number) => {
				set({ empresaActivaId: idEmpresa });
				seguridadService.guardarIdEmpresa(idEmpresa);
			},

			verificarSiEsAutorizador: async (idEmpresa: number) => {
				const { permisosEspeciales } = get();
				if (!permisosEspeciales || !idEmpresa) {
					set({ esAutorizador: false });
					return;
				}

				try {
					// Obtener el JSON de UsuarioGastos del JWT
					const usuarioGastosString = seguridadService.obtenerCampoJwt("UsuarioGastos");
					if (!usuarioGastosString || usuarioGastosString === "") {
						set({ esAutorizador: false });
						return;
					}

					// Parsear el JSON para obtener el id del empleado
					const usuarioGastosJSON = JSON.parse(usuarioGastosString);
					const idEmpleado = usuarioGastosJSON?.idUsuario;
					
					if (!idEmpleado) {
						set({ esAutorizador: false });
						return;
					}

					// Obtener autorizadores por ID de empleado
					const { gastoService } = await import("../services/gastoService");
					const autorizadores = await gastoService.obtenerAutorizadorxidEmpleado(
						parseInt(idEmpleado, 10),
						idEmpresa
					);

					// Si hay al menos un autorizador, el usuario es autorizador
					set({ esAutorizador: autorizadores.length > 0 });
				} catch (error) {
					console.error("Error al verificar si es autorizador:", error);
					set({ esAutorizador: false });
				}
			},

			login: async (email, password) => {
				try {
					const credenciales: CredencialesUsuario = {
						email,
						password,
						role: "", // El backend puede requerir esto, ajustar según necesidad
					};

					const respuesta = await seguridadService.login(credenciales);

					if (
						respuesta.token &&
						respuesta.token !== "NoToken" &&
						respuesta.token !== "UsuarioNoActivo"
					) {
						// Guardar token en el servicio de seguridad
						seguridadService.guardarToken(respuesta);

						const decodedToken: DecodedToken = jwtDecode(respuesta.token);
						const superUserValue = decodedToken.SuperUser;

						// Verificar si SuperUser tiene un valor válido
						const esSuperUser =
							superUserValue != null &&
							superUserValue !== "" &&
							String(superUserValue).trim().length > 0;

						// Obtener empresas del token o de la respuesta
						// La respuesta puede venir en diferentes formatos según el backend
						const respuestaCompleta = respuesta as RespuestaAutenticacion & {
							empresaSeccionActividades?: Empresa[];
							empresas?: Empresa[];
						};
						const empresasArray: Empresa[] = 
							respuestaCompleta.empresaSeccionActividades ?? 
							respuestaCompleta.empresas ?? 
							[];
						
						// Debug: Log para ver qué viene en la respuesta
						console.log("Respuesta login completa:", {
							token: respuesta.token ? "Presente" : "Ausente",
							empresasEnRespuesta: empresasArray.length,
							decodedToken: decodedToken,
						});

						const empresasNormalizadas = empresasArray.reduce((acc, empresa) => {
							acc[empresa.idEmpresa] = empresa;
							return acc;
						}, {} as Record<number, Empresa>);

						const fechaExpiracionStr =
							typeof respuesta.fechaExpiracion === "string"
								? respuesta.fechaExpiracion
								: respuesta.fechaExpiracion?.toString() || "";

						set({
							token: respuesta.token,
							fechaExpiracion: fechaExpiracionStr,
							empresaSeccionActividades: empresasNormalizadas,
							estaLogueado: true,
							permisosEspeciales: decodedToken,
							esSuperUsuario: esSuperUser,
						});

						if (empresasArray.length > 0) {
							const primeraEmpresaId = empresasArray[0].idEmpresa;
							set({ empresaActivaId: primeraEmpresaId });
							seguridadService.guardarIdEmpresa(primeraEmpresaId);
							await get().verificarSiEsAutorizador(primeraEmpresaId);
						} else {
							set({ esAutorizador: false, empresaActivaId: null });
						}

						// Cargar empresas del usuario después del login exitoso
						// Esto carga las empresas para el selector del header
						void get().cargarEmpresas();

						// Llamar a respuestaFront después del login exitoso
						// Esta llamada es opcional y no debe afectar el flujo de login
						// Se ejecuta en segundo plano sin bloquear
						// No esperamos su resultado ya que puede fallar con 401/204 sin ser crítico
						void seguridadService.respuestaFront(credenciales);

						return true;
					}

					return false;
				} catch (error) {
					console.error("Error en login:", error);
					return false;
				}
			},

			logout: () => {
				seguridadService.logout();
				set({
					token: null,
					fechaExpiracion: null,
					empresaSeccionActividades: null,
					empresasPertenecientes: null,
					estaLogueado: false,
					esSuperUsuario: false,
					permisosEspeciales: null,
					esAutorizador: null,
					empresaActivaId: null,
					muestraEmpresas: true,
				});
			},

			cargarEmpresas: async () => {
				try {
					const { usuarioEmpresaService } = await import("../services/usuarioEmpresaService");
					const empresas = await usuarioEmpresaService.obtenEmpresasPorUsuario();
					
					const { permisosEspeciales } = get();
					const visorCorporativo = permisosEspeciales 
						? seguridadService.obtenerCampoJwt("VisorCorporativo")
						: "";
					
					const muestraEmpresas = !(
						typeof visorCorporativo !== "undefined" &&
						visorCorporativo &&
						visorCorporativo !== ""
					);

					set({
						empresasPertenecientes: empresas,
						muestraEmpresas: muestraEmpresas,
					});

					// Si hay empresas y no hay empresa activa, seleccionar la primera
					if (empresas.length > 0 && !get().empresaActivaId) {
						const idEmpresaGuardada = seguridadService.obtenerIdEmpresa();
						if (idEmpresaGuardada) {
							const idEmpresaNum = parseInt(idEmpresaGuardada, 10);
							if (!isNaN(idEmpresaNum) && empresas.some(e => e.id === idEmpresaNum)) {
								get().cambiarEmpresa(idEmpresaNum);
							} else {
								get().cambiarEmpresa(empresas[0].id);
							}
						} else {
							get().cambiarEmpresa(empresas[0].id);
						}
					}
				} catch (error) {
					console.error("Error al cargar empresas:", error);
				}
			},

			cambiarEmpresa: (idEmpresa: number) => {
				set({ empresaActivaId: idEmpresa });
				seguridadService.guardarIdEmpresa(idEmpresa);
				// Verificar si es autorizador para la nueva empresa
				get().verificarSiEsAutorizador(idEmpresa);
			},

			// 🔎 Helpers
			getEmpresaById: (idEmpresa) => {
				return get().empresaSeccionActividades?.[idEmpresa];
			},

			getSeccionesByEmpresa: (idEmpresa) => {
				return get().empresaSeccionActividades?.[idEmpresa]?.seccionesDTO;
			},

			getActividadesByEmpresa: (idEmpresa) => {
				return get().empresaSeccionActividades?.[idEmpresa]?.actividades;
			},

			getActividadByCodigo: (idEmpresa, codigo) => {
				return get()
					.empresaSeccionActividades?.[idEmpresa]?.actividades.find(
						(a) => a.codigoActividad === codigo
					);
			},

			// Nuevos métodos para multiempresa
			obtenerIdEmpresa: () => {
				const idEmpresaStr = seguridadService.obtenerIdEmpresa();
				if (!idEmpresaStr) {
					return get().empresaActivaId;
				}
				const idEmpresaNum = parseInt(idEmpresaStr, 10);
				if (!isNaN(idEmpresaNum)) {
					return idEmpresaNum;
				}
				return get().empresaActivaId;
			},

			guardarIdEmpresa: (idEmpresa: number) => {
				seguridadService.guardarIdEmpresa(idEmpresa);
				set({ empresaActivaId: idEmpresa });
			},

			obtenerCampoJwt: (campo: string) => {
				return seguridadService.obtenerCampoJwt(campo);
			},

			obtenerPermisoEspecial: (clave: string) => {
				return seguridadService.obtenerPermisoEspecialPantalla(clave);
			},

			tienePermiso: (permiso: string, idEmpresa?: number) => {
				const empresaId = idEmpresa || get().obtenerIdEmpresa();
				if (!empresaId) {
					return false;
				}

				const permisoArmado = `${permiso}-${empresaId}`;
				const valorPermiso = seguridadService.obtenerCampoJwt(permisoArmado);
				const visorCorporativo = seguridadService.obtenerCampoJwt("VisorCorporativo");

				return (
					(valorPermiso !== undefined && valorPermiso !== null && valorPermiso !== "") ||
					(visorCorporativo !== undefined && visorCorporativo !== null && visorCorporativo !== "")
				);
			},
		}),
		{
			name: "auth-storage",
			onRehydrateStorage: () => {
				// Retornar una función que se ejecutará después de la rehidratación
				return (state) => {
					if (state) {
						// Modificar el estado directamente (esto es seguro en onRehydrateStorage)
						state.estaHidratado = true;
						// Sincronizar token con seguridadService después de rehidratar
						if (state.token) {
							seguridadService.guardarToken({
								token: state.token,
								fechaExpiracion: state.fechaExpiracion || "",
							});
						}
						// Sincronizar empresa activa
						if (state.empresaActivaId) {
							seguridadService.guardarIdEmpresa(state.empresaActivaId);
						}
					}
				};
			},
		}
	)
);


