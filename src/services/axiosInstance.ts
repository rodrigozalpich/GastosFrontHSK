import axios from "axios";
import { seguridadService } from "./seguridadService";

/**
 * Una instancia de Axios configurada para la API de Single Sign-On (SSO).
 * @constant {import("axios").AxiosInstance}
 */
export const apiSSO = axios.create({
	baseURL: import.meta.env.VITE_API_SSO_BASE_URL,
});

/**
 * Interceptor de peticiones de Axios para la instancia `apiSSO`.
 * Antes de que se envíe cada petición, este interceptor obtiene el token de autenticación
 * del `seguridadService` y lo añade al encabezado `Authorization` como un token Bearer.
 * Esto asegura que todas las peticiones a la API de SSO estén autenticadas.
 */
apiSSO.interceptors.request.use((config) => {
	const token = seguridadService.obtenerToken();
	const estaLogueado = seguridadService.estaLogueado();
	
	if (token && estaLogueado) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

/**
 * Interceptor de respuestas de Axios para la instancia `apiSSO`.
 * Si la respuesta es un error 401, se cierra la sesión y se redirige al login.
 */
apiSSO.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response?.status === 401) {
			if (seguridadService.estaLogueado()) {
				seguridadService.logout();
				// Redirigir al login - esto se manejará en el componente
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	}
);

/**
 * Una instancia de Axios configurada para la API principal del backend.
 * @constant {import("axios").AxiosInstance}
 */
export const apiBACK = axios.create({
	baseURL: import.meta.env.VITE_API_BACK_BASE_URL,
});

/**
 * Interceptor de peticiones de Axios para la instancia `apiBACK`.
 * Antes de que se envíe cada petición, este interceptor obtiene el token de autenticación
 * del `seguridadService` y lo añade al encabezado `Authorization` como un token Bearer.
 * Esto asegura que todas las peticiones a la API principal del backend estén autenticadas.
 */
apiBACK.interceptors.request.use((config) => {
	const token = seguridadService.obtenerToken();
	const estaLogueado = seguridadService.estaLogueado();
	
	if (token && estaLogueado) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

/**
 * Interceptor de respuestas de Axios para la instancia `apiBACK`.
 * Si la respuesta es un error 401, se cierra la sesión y se redirige al login.
 */
apiBACK.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response?.status === 401) {
			if (seguridadService.estaLogueado()) {
				seguridadService.logout();
				// Redirigir al login - esto se manejará en el componente
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	}
);


