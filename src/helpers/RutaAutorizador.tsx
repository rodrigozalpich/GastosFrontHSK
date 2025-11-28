import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/authStore";
import Loader from "../components/Loader";

/**
 * Componente de ruta protegida para autorizadores.
 * Redirige a la página de inicio si el usuario no es un autorizador.
 */
const RutaAutorizador = () => {
	const { esAutorizador, verificarSiEsAutorizador, empresaActivaId } = useAuthStore();
	const lastCheckedEmpresaRef = useRef<number | null>(null);
	const isCheckingRef = useRef(false);

	useEffect(() => {
		// Solo verificar si es autorizador si:
		// 1. Hay una empresa activa
		// 2. No se está verificando actualmente
		// 3. No se ha verificado para esta empresa específica (o es null, lo que significa que cambió la empresa)
		if (
			empresaActivaId &&
			!isCheckingRef.current &&
			lastCheckedEmpresaRef.current !== empresaActivaId
		) {
			isCheckingRef.current = true;
			lastCheckedEmpresaRef.current = empresaActivaId;
			void verificarSiEsAutorizador(empresaActivaId).finally(() => {
				isCheckingRef.current = false;
			});
		}
	}, [empresaActivaId, verificarSiEsAutorizador]);

	if (esAutorizador === null || !empresaActivaId) {
		return <Loader text="Cargando autorizador..." />;
	}

	if (!esAutorizador) {
		return <Navigate to="/dashboard" replace />;
	}

	return <Outlet />;
};

export default RutaAutorizador;


