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

// Configuración optimizada de React Query
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Tiempo que los datos se consideran "frescos" antes de refetch automático
			staleTime: 1000 * 60 * 5, // 5 minutos
			// Tiempo que los datos se mantienen en caché después de que no hay componentes suscritos
			gcTime: 1000 * 60 * 10, // 10 minutos (antes cacheTime)
			// Reintentos automáticos en caso de error
			retry: 1,
			// Refetch cuando la ventana recupera el foco
			refetchOnWindowFocus: false,
			// Refetch cuando se reconecta la red
			refetchOnReconnect: true,
		},
		mutations: {
			// Reintentos automáticos en caso de error
			retry: 1,
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
