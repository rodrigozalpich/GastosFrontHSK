import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Store para gestionar el estado del Sidebar/Sidenav
 * Migrado de SidenavService de Angular
 */
interface SidenavState {
	sideNavState: boolean; // Estado abierto/cerrado del sidebar
	linkText: boolean; // Estado del texto de los links

	// Acciones
	toggleSideNav: () => void;
	setSideNavState: (state: boolean) => void;
	setLinkText: (state: boolean) => void;
}

export const useSidenavStore = create<SidenavState>()(
	persist(
		(set) => ({
			sideNavState: true, // Por defecto abierto
			linkText: true,

			toggleSideNav: () => {
				set((state) => ({
					sideNavState: !state.sideNavState,
					linkText: !state.sideNavState, // Sincronizar con sideNavState
				}));
			},

			setSideNavState: (state: boolean) => {
				set({ sideNavState: state, linkText: state });
			},

			setLinkText: (state: boolean) => {
				set({ linkText: state });
			},
		}),
		{
			name: "sidenav-storage",
		}
	)
);

