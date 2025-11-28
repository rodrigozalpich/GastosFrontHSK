import { useState, type JSX } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";
import { useNotificacionStore } from "../store/notificacionStore";
import Loader from "../components/Loader";
import ActionButton from "../components/ActionButton";

/**
 * Componente de página de inicio de sesión.
 * Permite a los usuarios autenticarse en el sistema.
 *
 * @returns {JSX.Element} El componente de login.
 */
export default function Login(): JSX.Element {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);
	const mostrarNotificacion = useNotificacionStore((state) => state.mostrarNotificacion);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const success = await login(email, password);
			if (success) {
				mostrarNotificacion("Inicio de sesión exitoso", "success");
				// Pequeño delay para asegurar que el estado se actualice
				setTimeout(() => {
					navigate("/dashboard", { replace: true });
				}, 100);
			} else {
				mostrarNotificacion("Credenciales inválidas", "error");
			}
		} catch (error) {
			console.error("Error en login:", error);
			mostrarNotificacion("Error al iniciar sesión. Intente nuevamente.", "error");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return <Loader text="Iniciando sesión..." />;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to from-gray-100 to-white px-4 py-8">
			<div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-lg shadow-lg">
				<h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Iniciar Sesión</h1>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
							Correo electrónico
						</label>
						<input
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
							placeholder="usuario@ejemplo.com"
						/>
					</div>
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
							Contraseña
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
							placeholder="••••••••"
						/>
					</div>
					<ActionButton
						variant="primary"
						type="submit"
						text="Iniciar Sesión"
						isLoading={isLoading}
						loadingText="Iniciando sesión..."
						disabled={isLoading}
						customClassName="w-full bg-orange-400 text-white hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium"
					/>
				</form>
			</div>
		</div>
	);
}


