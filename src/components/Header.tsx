import { type JSX, useEffect, useState, useRef, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { useSidenavStore } from "../store/sidenavStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBars,
	faTimes,
	faChevronDown,
	faBell,
	faCircleQuestion,
	faRightFromBracket,
	faBuilding,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Componente Header - Barra superior de la aplicación
 * Muestra el título de la página y el selector de empresa (si aplica)
 */

/**
 * Obtiene las iniciales del nombre completo del usuario
 */
const obtenerIniciales = (
	nombreCompleto: string | null | undefined
): string => {
	if (!nombreCompleto) return "U";
	const partes = nombreCompleto.trim().split(/\s+/);
	if (partes.length === 0) return "U";
	if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
	return (
		partes[0].charAt(0) + partes[partes.length - 1].charAt(0)
	).toUpperCase();
};

export default function Header(): JSX.Element {
	const {
		empresasPertenecientes,
		empresaActivaId,
		muestraEmpresas,
		cargarEmpresas,
		cambiarEmpresa,
		estaLogueado,
		permisosEspeciales,
		logout,
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

	// Estado para el dropdown del usuario
	const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
	const [isUserDropdownClosing, setIsUserDropdownClosing] = useState(false);
	const userDropdownRef = useRef<HTMLDivElement>(null);

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
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				if (isDropdownOpen && !isClosing) {
					handleCloseDropdown();
				}
			}
			if (
				userDropdownRef.current &&
				!userDropdownRef.current.contains(event.target as Node)
			) {
				if (isUserDropdownOpen && !isUserDropdownClosing) {
					setIsUserDropdownClosing(true);
				}
			}
		};

		if (
			isDropdownOpen ||
			isClosing ||
			isUserDropdownOpen ||
			isUserDropdownClosing
		) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [
		isDropdownOpen,
		isClosing,
		isUserDropdownOpen,
		isUserDropdownClosing,
		handleCloseDropdown,
	]);

	// Manejar cierre del dropdown del usuario
	const handleCloseUserDropdown = useCallback(() => {
		if (isUserDropdownClosing) return;
		setIsUserDropdownClosing(true);
	}, [isUserDropdownClosing]);

	const handleOpenUserDropdown = () => {
		if (!isUserDropdownOpen && !isUserDropdownClosing) {
			setIsUserDropdownClosing(false);
			setIsUserDropdownOpen(true);
		}
	};

	const handleLogout = () => {
		logout();
		handleCloseUserDropdown();
	};

	// Obtener la empresa activa
	const empresaActiva = empresasPertenecientes?.find(
		(e) => e.id === empresaActivaId
	);

	// Obtener nombre del usuario
	const nombreUsuario = permisosEspeciales?.nombreCompleto || "Usuario";
	const inicialesUsuario = obtenerIniciales(nombreUsuario);

	if (!estaLogueado) {
		return <></>;
	}

	return (
		<header
			className={`bg-[#1E1B4B] shadow-sm border-b border-gray-200 fixed top-0 right-0 z-30 h-16 sm:h-20 transition-all duration-300 ${
				sideNavState ? "left-0 lg:left-64 xl:left-72" : "left-0"
			}`}
		>
			<div className="h-full flex items-center px-3 sm:px-4 lg:px-6 xl:px-8">
				<div className="flex items-center justify-between w-full gap-2 sm:gap-4">
					<div className="flex items-center gap-2 sm:gap-6 flex-1 min-w-0">
						{/* Botón Hamburguesa y Título */}
						<div className="flex items-center gap-2 sm:gap-4 shrink-0">
							<button
								onClick={toggleSideNav}
								className="cursor-pointer p-1.5 sm:p-2.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
								aria-label={sideNavState ? "Ocultar menú" : "Mostrar menú"}
							>
								<FontAwesomeIcon
									icon={sideNavState ? faTimes : faBars}
									size="lg"
									className="w-5 h-5 text-white transition-transform duration-300"
								/>
							</button>
						</div>

						{/* Selector de Empresa */}
						{muestraEmpresas &&
							empresasPertenecientes &&
							empresasPertenecientes.length > 0 && (
								<div
									className="relative shrink-0"
									ref={dropdownRef}
								>
									<button
										type="button"
										onClick={() => {
											if (isDropdownOpen && !isClosing) {
												handleCloseDropdown();
											} else if (!isDropdownOpen) {
												handleOpenDropdown();
											}
										}}
										className="flex w-[180px] md:w-full items-center gap-2 sm:gap-3 p-1.5 lg:p-3 bg-[#204675] hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1E1B4B] rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-[#2D5E9C] cursor-pointer"
										aria-label="Seleccionar empresa"
										aria-expanded={isDropdownOpen && !isClosing}
										aria-haspopup="listbox"
									>
										{/* Ícono*/}
										<FontAwesomeIcon
											icon={faBuilding}
											className="w-3 h-3 sm:w-4 sm:h-4 text-white transition-transform duration-200 shrink-0"
										/>
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
												isClosing
													? "animate-dropdown-fade-out"
													: "animate-dropdown-fade-in"
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
													<li
														key={empresa.id}
														role="option"
													>
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

					{/* Sección derecha: Botones de acción y perfil de usuario */}
					<div className="flex items-center gap-2 md:gap-3 lg:gap-4 shrink-0">
						{/* Botón de Notificaciones */}
						<button
							type="button"
							className="relative p-1 lg:p-2 text-white hover:bg-[#204675] rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1E1B4B]"
							aria-label="Notificaciones"
						>
							<FontAwesomeIcon
								icon={faBell}
								className="w-4 h-4 lg:w-6 lg:h-6"
							/>
							{/* Indicador de notificaciones (opcional) */}
							{/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
						</button>

						{/* Botón de Ayuda */}
						<button
							type="button"
							className="p-1 lg:p-2 text-white hover:bg-[#204675] rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1E1B4B]"
							aria-label="Ayuda"
						>
							<FontAwesomeIcon
								icon={faCircleQuestion}
								className="w-4 h-4 lg:w-6 lg:h-6"
							/>
						</button>

						{/* Perfil de Usuario */}
						<div
							className="relative shrink-0"
							ref={userDropdownRef}
						>
							<button
								type="button"
								onClick={() => {
									if (isUserDropdownOpen && !isUserDropdownClosing) {
										handleCloseUserDropdown();
									} else if (!isUserDropdownOpen) {
										handleOpenUserDropdown();
									}
								}}
								onMouseEnter={() => {
									// Opcional: abrir en hover en desktop
									if (window.innerWidth >= 1024) {
										if (!isUserDropdownOpen && !isUserDropdownClosing) {
											handleOpenUserDropdown();
										}
									}
								}}
								className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-[#204675] rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1E1B4B] group"
								aria-label="Menú de usuario"
								aria-expanded={isUserDropdownOpen && !isUserDropdownClosing}
								aria-haspopup="menu"
							>
								{/* Avatar circular con iniciales */}
								<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
									<span className="text-white font-semibold text-xs sm:text-sm">
										{inicialesUsuario}
									</span>
								</div>
								{/* Nombre del usuario - oculto en móviles pequeños */}
								<span className="text-white font-medium text-sm sm:text-base whitespace-nowrap hidden md:block max-w-[150px] lg:max-w-[200px] truncate">
									{nombreUsuario}
								</span>
								{/* Chevron hacia abajo */}
								<FontAwesomeIcon
									icon={faChevronDown}
									className={`w-3 h-3 sm:w-4 sm:h-4 text-white transition-transform duration-200 shrink-0 ${
										isUserDropdownOpen && !isUserDropdownClosing
											? "rotate-180"
											: ""
									}`}
								/>
							</button>

							{/* Dropdown del usuario */}
							{(isUserDropdownOpen || isUserDropdownClosing) && (
								<div
									className={`absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 ${
										isUserDropdownClosing
											? "animate-dropdown-fade-out"
											: "animate-dropdown-fade-in"
									}`}
									onAnimationEnd={(e) => {
										if (e.currentTarget === e.target && isUserDropdownClosing) {
											setIsUserDropdownClosing(false);
											setIsUserDropdownOpen(false);
										}
									}}
									onMouseLeave={() => {
										// Cerrar al salir del dropdown en desktop
										if (window.innerWidth >= 1024) {
											handleCloseUserDropdown();
										}
									}}
								>
									<div className="py-2">
										{/* Información del usuario */}
										<div className="px-4 py-3 border-b border-gray-200">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
													<span className="text-white font-semibold text-sm">
														{inicialesUsuario}
													</span>
												</div>
												<div className="min-w-0 flex-1">
													<p className="text-sm font-medium text-gray-900 truncate">
														{nombreUsuario}
													</p>
													{permisosEspeciales?.Username && (
														<p className="text-xs text-gray-500 truncate">
															{permisosEspeciales.Username}
														</p>
													)}
												</div>
											</div>
										</div>
										{/* Opción de logout */}
										<button
											type="button"
											onClick={handleLogout}
											className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-colors duration-150"
										>
											<FontAwesomeIcon
												icon={faRightFromBracket}
												className="w-4 h-4 text-gray-500 transition-colors duration-150"
											/>
											<span className="transition-colors duration-150">Cerrar sesión</span>
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
