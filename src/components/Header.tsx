import { type JSX, useEffect, useState, useRef, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { useSidenavStore } from "../store/sidenavStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faChevronDown } from "@fortawesome/free-solid-svg-icons";

/**
 * Componente Header - Barra superior de la aplicación
 * Muestra el título de la página y el selector de empresa (si aplica)
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
	const { sideNavState, toggleSideNav } = useSidenavStore();

	useEffect(() => {
		if (estaLogueado && !empresasPertenecientes) {
			cargarEmpresas();
		}
	}, [estaLogueado, empresasPertenecientes, cargarEmpresas]);

	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const handleCloseDropdown = useCallback(() => {
		if (isClosing) return; // Prevenir múltiples cierres
		setIsClosing(true);
	}, [isClosing]);

	const handleEmpresaChange = (empresaId: number) => {
		cambiarEmpresa(empresaId);
		handleCloseDropdown();
	};

	const handleOpenDropdown = () => {
		if (!isDropdownOpen && !isClosing) {
			setIsClosing(false);
			setIsDropdownOpen(true);
		}
	};

	// Cerrar dropdown al hacer clic fuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				if (isDropdownOpen && !isClosing) {
					handleCloseDropdown();
				}
			}
		};

		if (isDropdownOpen || isClosing) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isDropdownOpen, isClosing, handleCloseDropdown]);

	// Obtener la empresa activa
	const empresaActiva = empresasPertenecientes?.find((e) => e.id === empresaActivaId);

	if (!estaLogueado) {
		return <></>;
	}

	return (
		<header
			className={`bg-[#1E1B4B] shadow-sm border-b border-gray-200 fixed top-0 right-0 z-30 h-14 sm:h-16 transition-all duration-300 ${
				sideNavState ? "left-0 lg:left-64 xl:left-72" : "left-0"
			}`}
		>
			<div className="h-full flex items-center px-3 sm:px-4 lg:px-6 xl:px-8">
				<div className="flex items-center justify-between w-full gap-2 sm:gap-4">
					{/* Botón Hamburguesa y Título */}
					<div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
						<button
							onClick={toggleSideNav}
							className="cursor-pointer p-1.5 sm:p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
							aria-label={sideNavState ? "Ocultar menú" : "Mostrar menú"}
						>
							<FontAwesomeIcon
								icon={sideNavState ? faTimes : faBars}
								className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300"
							/>
						</button>
					</div>

					{/* Selector de Empresa */}
					{muestraEmpresas && empresasPertenecientes && empresasPertenecientes.length > 0 && (
						<div className="relative shrink-0" ref={dropdownRef}>
							<button
								type="button"
								onClick={() => {
									if (isDropdownOpen && !isClosing) {
										handleCloseDropdown();
									} else if (!isDropdownOpen) {
										handleOpenDropdown();
									}
								}}
								className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-[#204675] hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1E1B4B] rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-[#2D5E9C] cursor-pointer"
								aria-label="Seleccionar empresa"
								aria-expanded={isDropdownOpen && !isClosing}
								aria-haspopup="listbox"
							>
								{/* Ícono de documento/impresora */}
								<svg
									className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
									/>
								</svg>
								{/* Texto de la empresa */}
								<span className="text-white font-medium text-xs sm:text-sm uppercase whitespace-nowrap max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] truncate">
									{empresaActiva?.nombreComercial || "Seleccionar empresa"}
								</span>
								{/* Chevron hacia abajo */}
								<FontAwesomeIcon
									icon={faChevronDown}
									className={`w-3 h-3 sm:w-4 sm:h-4 text-white transition-transform duration-200 shrink-0 ${
										isDropdownOpen && !isClosing ? "rotate-180" : ""
									}`}
								/>
							</button>

							{/* Dropdown flotante */}
							{(isDropdownOpen || isClosing) && (
								<div
									className={`absolute right-0 mt-2 w-full min-w-[200px] sm:min-w-[250px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[300px] overflow-y-auto ${
										isClosing ? "animate-dropdown-fade-out" : "animate-dropdown-fade-in"
									}`}
									onAnimationEnd={(e) => {
										// Solo procesar el evento del elemento principal, no de los hijos
										if (e.currentTarget === e.target && isClosing) {
											setIsClosing(false);
											setIsDropdownOpen(false);
										}
									}}
								>
									<ul
										role="listbox"
										className="py-1"
										aria-label="Lista de empresas"
									>
										{empresasPertenecientes.map((empresa) => (
											<li key={empresa.id} role="option">
												<button
													type="button"
													onClick={() => handleEmpresaChange(empresa.id)}
													className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
														empresa.id === empresaActivaId
															? "bg-blue-50 text-blue-700 font-medium"
															: "text-gray-700 hover:bg-gray-50"
													}`}
													aria-selected={empresa.id === empresaActivaId}
												>
													{empresa.nombreComercial}
												</button>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

