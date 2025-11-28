import type { JSX } from "react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";
import Loader from "../components/Loader";

/**
 * @interface Props
 * @description Define las propiedades para el componente RutaPublica.
 * @property {JSX.Element} children - El/los componente(s) a renderizar si la ruta es accesible.
 */
interface Props {
	children: JSX.Element;
}

/**
 * Un componente de protección de rutas para rutas públicas que no deberían ser accesibles para usuarios autenticados (por ejemplo, una página de inicio de sesión).
 *
 * Revisa dos condiciones del `useAuthStore`:
 * 1. `estaHidratado`: Espera a que el estado de autenticación se rehidrate desde el almacenamiento, mostrando un `Loader` mientras tanto.
 * 2. `token`: Si el estado está hidratado y existe un token, redirige al usuario a la página de `/dashboard`, evitando que visite la ruta pública (como el login) de nuevo.
 *
 * Si no hay token, renderiza los componentes `children`.
 *
 * @component
 * @param {Props} props - Las propiedades para el componente.
 * @returns {JSX.Element} Los `children` para usuarios no autenticados, o un `<Loader />` durante la rehidratación del estado.
 */
export default function RutaPublica({ children }: Props): JSX.Element {
	const token = useAuthStore((state) => state.token);
	const isHydrated = useAuthStore((state) => state.estaHidratado);
	const navigate = useNavigate();
	const hasRedirected = useRef(false);

	// Manejar redirección con useEffect para evitar loops infinitos
	useEffect(() => {
		if (isHydrated && token && !hasRedirected.current) {
			hasRedirected.current = true;
			navigate("/dashboard", { replace: true });
		}
	}, [isHydrated, token, navigate]);

	if (!isHydrated) {
		return <Loader text="Cargando usuario..." />;
	}

	// Si hay token, mostrar loader mientras se redirige
	if (token) {
		return <Loader text="Redirigiendo..." />;
	}

	return children;
}


