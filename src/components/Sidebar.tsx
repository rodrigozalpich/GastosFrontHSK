import { type JSX, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSidenavStore } from "../store/sidenavStore";
import { useTituloStore } from "../services/tituloService";
import { useAuthStore } from "../store/authStore";
import { seguridadService } from "../services/seguridadService";
import type { MenuPage } from "../types/menu";
import {
	menuConfigBase,
	menuAdministrador,
	menuVisorCorporativo,
} from "../config/menuConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

/**
 * Componente Sidebar - Menú lateral de navegación
 * Migrado de LeftMenuComponent de Angular
 * Incluye menús anidados, filtrado por permisos multiempresa, y menús especiales
 */
export default function Sidebar(): JSX.Element {
	const navigate = useNavigate();
	const location = useLocation();
	const { sideNavState, toggleSideNav } = useSidenavStore();
	const { actualizarTitulo } = useTituloStore();
	const { obtenerIdEmpresa, permisosEspeciales } = useAuthStore();

	const [paginasFiltradas, setPaginasFiltradas] = useState<MenuPage[]>([]);
	const idEmpresa = obtenerIdEmpresa();

	// Filtrar menús según permisos multiempresa
	// Se recalcula cuando cambia idEmpresa o permisosEspeciales
	const filtrarMenus = useMemo(() => {
		const paginas: MenuPage[] = [];
		const idEmpresaActual = idEmpresa;

		// Filtrar menús base
		for (const page of menuConfigBase) {
			const paginasFiltradasHijas: MenuPage[] = [];

					// Filtrar páginas anidadas
					if (page.nestedPages) {
						for (const nestedPage of page.nestedPages) {
							if (!nestedPage.permiso) {
								// Si no tiene permiso, siempre se muestra
								paginasFiltradasHijas.push(nestedPage);
							} else {
								// Intentar obtener permiso con idEmpresa
								let permiso = "";
								if (idEmpresaActual) {
									permiso = seguridadService.obtenerCampoJwt(
										`${nestedPage.permiso}-${idEmpresaActual}`
									);
								}

								// Si no se encontró con idEmpresa, intentar sin idEmpresa (permisos globales)
								if (!permiso || permiso === "") {
									permiso = seguridadService.obtenerCampoJwt(nestedPage.permiso);
								}


								// Verificar también VisorCorporativo
								const visorCorporativo = seguridadService.obtenerCampoJwt("VisorCorporativo");
								const tieneVisorCorporativo = visorCorporativo && visorCorporativo !== "";

								// Si tiene permiso o es VisorCorporativo, agregarlo
								if ((permiso && permiso !== "") || tieneVisorCorporativo) {
									paginasFiltradasHijas.push(nestedPage);
								}
							}
						}
					}

			// Si tiene páginas anidadas filtradas, agregar el menú padre
			if (paginasFiltradasHijas.length > 0) {
				paginas.push({
					...page,
					nestedPages: paginasFiltradasHijas,
					expanded: false,
				});
			}

			// Si es una página única (unico: true), verificar permiso directamente
			if (page.unico) {
				let permiso = "";
				if (page.permiso) {
					if (idEmpresaActual) {
						permiso = seguridadService.obtenerCampoJwt(
							`${page.permiso}-${idEmpresaActual}`
						);
					}
					if (!permiso || permiso === "") {
						permiso = seguridadService.obtenerCampoJwt(page.permiso);
					}
				}

				// Si tiene permiso o no requiere permiso, agregarlo
				if (!page.permiso || (permiso && permiso !== "")) {
					paginas.push({
						...page,
						expanded: false,
					});
				}
			}
		}

		// Agregar menús especiales según rol
		const visorCorporativo = seguridadService.obtenerCampoJwt("VisorCorporativo");
		const role = permisosEspeciales?.role || "";

		// Menú para Administrador
		if (role === "Administrador") {
			paginas.push({
				...menuAdministrador,
				expanded: false,
			});
		}
		// Menú para VisorCorporativo (no Administrador)
		else if (
			visorCorporativo &&
			visorCorporativo !== "" &&
			role !== "Administrador"
		) {
			paginas.push({
				...menuVisorCorporativo,
				expanded: false,
			});
		}

		return paginas;
	}, [idEmpresa, permisosEspeciales]);

	// Actualizar páginas filtradas cuando cambian los permisos
	useEffect(() => {
		setPaginasFiltradas(filtrarMenus);
	}, [filtrarMenus]);

	// Función para establecer el título basado en la ruta
	const setPageTitleBasedOnRoute = useCallback((route: string) => {
		for (const page of paginasFiltradas) {
			if (page.nestedPages) {
				for (const nestedPage of page.nestedPages) {
					if (route === nestedPage.link) {
						actualizarTitulo(nestedPage.name);
						return;
					}
				}
			}
			if (page.unico && route === page.link) {
				actualizarTitulo(page.name);
				return;
			}
		}
	}, [paginasFiltradas, actualizarTitulo]);

	// Actualizar título basado en la ruta actual
	useEffect(() => {
		const currentRoute = location.pathname;
		setPageTitleBasedOnRoute(currentRoute);
	}, [location.pathname, setPageTitleBasedOnRoute]);

	// Toggle de expansión de menús anidados
	const toggleNestedPages = (page: MenuPage) => {
		setPaginasFiltradas((prevPages) =>
			prevPages.map((p) => {
				if (p === page) {
					return { ...p, expanded: !p.expanded };
				}
				// Cerrar otros menús cuando se abre uno nuevo
				return { ...p, expanded: false };
			})
		);
	};

	// Navegar y actualizar título
	const handlePageClick = (page: MenuPage) => {
		if (!page.unico) {
			return;
		}
		if (page.link !== "") {
			actualizarTitulo(page.name);
			navigate(page.link);
		}
	};

	// Navegar a página anidada
	const handleNestedPageClick = (nestedPage: MenuPage) => {
		actualizarTitulo(nestedPage.name);
		navigate(nestedPage.link);
	};

	return (
		<>
			{/* Overlay cuando el sidebar está abierto en móvil (opcional para responsive) */}
			{sideNavState && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
					onClick={toggleSideNav}
					aria-hidden="true"
				/>
			)}

			{/* Sidebar con transiciones suaves - Se oculta completamente cuando está cerrado */}
			<div
				className={`bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40 overflow-hidden transition-all duration-300 ease-in-out ${
					sideNavState
						? "w-64 lg:w-64 xl:w-72 translate-x-0"
						: "w-0 -translate-x-full"
				}`}
			>
				<div
					className={`h-full overflow-y-auto transition-opacity duration-300 ${
						sideNavState ? "opacity-100" : "opacity-0"
					}`}
				>
					{/* Logo - Solo visible cuando está expandido */}
					{sideNavState && (
						<div className="flex justify-center py-3 sm:py-4 border-b border-gray-200 px-2">
							<a href="/dashboard" className="flex items-center">
								<img
									className="w-24 sm:w-32 py-[0.3rem]"
									src="/assets/LOGOS RFACIL_SIMPLE.svg"
									alt="Rfácil Logo"
								/>
							</a>
						</div>
					)}

					{/* Menú - Solo visible cuando está expandido */}
					{sideNavState && (
						<nav className="mt-4">
							{paginasFiltradas.map((page, index) => (
							<div key={index}>
								{/* Item de menú principal */}
								<div
									onClick={() => {
										if (page.nestedPages && page.nestedPages.length > 0) {
											toggleNestedPages(page);
										} else {
											handlePageClick(page);
										}
									}}
									className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:bg-gray-100 transition-colors ${
										location.pathname === page.link ? "bg-blue-50 border-l-4 border-blue-500" : ""
									}`}
								>
									{page.imageUrl && (
										<img
											src={page.imageUrl}
											alt={page.name}
											className="w-6 h-6 sm:w-7 sm:h-7 shrink-0"
										/>
									)}
									<div className="text-[#808080] text-xs sm:text-sm flex justify-between items-center w-full min-w-0">
										<span className="truncate">{page.name}</span>
										{page.nestedPages && page.nestedPages.length > 0 && (
											<FontAwesomeIcon
												icon={page.expanded ? faChevronUp : faChevronDown}
												className="text-[#21416e] text-xs sm:text-sm shrink-0 ml-2"
											/>
										)}
									</div>
								</div>

								{/* Páginas anidadas */}
								{page.nestedPages && page.expanded && (
									<div className="overflow-hidden transition-all duration-300 ease-in-out bg-gray-50">
										{page.nestedPages.map((nestedPage, nestedIndex) => (
											<a
												key={nestedIndex}
												onClick={(e) => {
													e.preventDefault();
													handleNestedPageClick(nestedPage);
												}}
												className={`flex items-center gap-2 ml-4 sm:ml-6 px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
													location.pathname === nestedPage.link
														? "bg-blue-50 border-l-4 border-blue-500"
														: ""
												}`}
											>
												{nestedPage.imageUrl && (
													<img
														src={nestedPage.imageUrl}
														alt={nestedPage.name}
														className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"
													/>
												)}
												<span className="text-[#808080] text-xs truncate">
													{nestedPage.name}
												</span>
											</a>
										))}
									</div>
								)}
							</div>
							))}
						</nav>
					)}
				</div>
			</div>
		</>
	);
}

