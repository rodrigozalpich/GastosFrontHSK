import { type JSX, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useTituloStore } from "../services/tituloService";
import { useSidenavStore } from "../store/sidenavStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

/**
 * Componente Header - Barra superior de la aplicación
 * Muestra el título de la página y el selector de empresa (si aplica)
 * Integra TituloService para títulos dinámicos
 */
export default function Header(): JSX.Element {
	const {
		empresasPertenecientes,
		empresaActivaId,
		muestraEmpresas,
		cargarEmpresas,
		cambiarEmpresa,
		estaLogueado,
	} = useAuthStore();
	const { titulo } = useTituloStore();
	const { sideNavState, toggleSideNav } = useSidenavStore();

	useEffect(() => {
		if (estaLogueado && !empresasPertenecientes) {
			cargarEmpresas();
		}
	}, [estaLogueado, empresasPertenecientes, cargarEmpresas]);

	const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const nuevaEmpresaId = parseInt(e.target.value, 10);
		if (!isNaN(nuevaEmpresaId)) {
			cambiarEmpresa(nuevaEmpresaId);
		}
	};

	if (!estaLogueado) {
		return <></>;
	}

	return (
		<header
			className={`bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 z-30 h-14 sm:h-16 transition-all duration-300 ${
				sideNavState ? "left-0 lg:left-64 xl:left-72" : "left-0"
			}`}
		>
			<div className="h-full flex items-center px-3 sm:px-4 lg:px-6 xl:px-8">
				<div className="flex items-center justify-between w-full gap-2 sm:gap-4">
					{/* Botón Hamburguesa y Título */}
					<div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
						<button
							onClick={toggleSideNav}
							className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
							aria-label={sideNavState ? "Ocultar menú" : "Mostrar menú"}
						>
							<FontAwesomeIcon
								icon={sideNavState ? faTimes : faBars}
								className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 transition-transform duration-300"
							/>
						</button>
						<div className="flex-shrink-0 min-w-0">
							<h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
								{titulo || "Rfácil"}
							</h1>
						</div>
					</div>

					{/* Selector de Empresa */}
					{muestraEmpresas && empresasPertenecientes && empresasPertenecientes.length > 0 && (
						<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
							<svg
								className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hidden sm:block"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
							<select
								value={empresaActivaId || ""}
								onChange={handleEmpresaChange}
								className="block w-full max-w-[150px] sm:max-w-[200px] lg:max-w-none rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm bg-white px-2 sm:px-3 py-1.5 sm:py-2 border"
							>
								{empresasPertenecientes.map((empresa) => (
									<option key={empresa.id} value={empresa.id}>
										{empresa.nombreComercial}
									</option>
								))}
							</select>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

