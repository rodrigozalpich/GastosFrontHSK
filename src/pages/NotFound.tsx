import { type JSX } from "react";
import { Link } from "react-router";
import { ROUTES } from "../config/routes.config";
import ActionButton from "../components/ActionButton";

/**
 * Componente de página 404 (No encontrada).
 * Se muestra cuando el usuario intenta acceder a una ruta que no existe.
 *
 * @returns {JSX.Element} El componente de página no encontrada.
 */
export default function NotFound(): JSX.Element {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
				<p className="text-xl text-gray-600 mb-8">Página no encontrada</p>
				<Link to={ROUTES.LOGIN}>
					<ActionButton
						variant="primary"
						text="Volver al inicio"
						customClassName="bg-orange-400 text-white hover:bg-orange-500"
					/>
				</Link>
			</div>
		</div>
	);
}


