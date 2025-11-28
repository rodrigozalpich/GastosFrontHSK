/**
 * Tipos para el sistema de menús del Sidebar
 * Migrado de LeftMenuComponent de Angular
 */

export interface MenuPage {
	link: string;
	name: string;
	icon?: string;
	imageUrl?: string;
	permiso?: string; // Permiso requerido para mostrar el menú (patrón: "Permiso-{idEmpresa}")
	nestedPages?: MenuPage[]; // Páginas anidadas (submenús)
	expanded?: boolean; // Estado de expansión para menús anidados
	unico: boolean; // Si es true, es una página única sin submenús
}

