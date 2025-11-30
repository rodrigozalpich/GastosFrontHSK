/**
 * @file El punto de entrada principal para la aplicación de React.
 * Este archivo renderiza el componente raíz de la aplicación (`App`) en el DOM.
 *
 * Configura el `StrictMode` de React para resaltar problemas potenciales en la aplicación
 * y envuelve toda la aplicación con `BrowserRouter` de `react-router` para habilitar el enrutamiento del lado del cliente.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Configuración optimizada de React Query para producción
 * 
 * - staleTime: Tiempo que los datos se consideran "frescos" antes de refetch automático
 * - gcTime: Tiempo que los datos se mantienen en caché después de que no hay componentes suscritos
 * - retry: Función inteligente que solo reintenta errores de red, no errores 4xx
 * - refetchOnWindowFocus: Deshabilitado para evitar refetches innecesarios
 * - refetchOnReconnect: Habilitado para actualizar datos cuando se recupera la conexión
 */
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Tiempo que los datos se consideran "frescos" antes de refetch automático
			staleTime: 1000 * 60 * 5, // 5 minutos
			// Tiempo que los datos se mantienen en caché después de que no hay componentes suscritos
			gcTime: 1000 * 60 * 10, // 10 minutos (antes cacheTime)
			// Reintentos inteligentes: solo reintenta errores de red, no errores 4xx
			retry: (failureCount, error) => {
				// No reintentar si es un error 4xx (errores del cliente)
				if (error && typeof error === "object" && "response" in error) {
					const axiosError = error as { response?: { status?: number } };
					const status = axiosError.response?.status;
					if (status && status >= 400 && status < 500) {
						return false;
					}
				}
				// Reintentar hasta 2 veces para errores de red o servidor
				return failureCount < 2;
			},
			// Refetch cuando la ventana recupera el foco (deshabilitado para mejor UX)
			refetchOnWindowFocus: false,
			// Refetch cuando se reconecta la red (habilitado para mantener datos actualizados)
			refetchOnReconnect: true,
			// No refetch automático al montar si los datos están frescos
			refetchOnMount: true,
		},
		mutations: {
			// Reintentos para mutaciones: solo errores de red
			retry: (failureCount, error) => {
				if (error && typeof error === "object" && "response" in error) {
					const axiosError = error as { response?: { status?: number } };
					const status = axiosError.response?.status;
					if (status && status >= 400 && status < 500) {
						return false;
					}
				}
				return failureCount < 1;
			},
		},
	},
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
