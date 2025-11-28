import { create } from "zustand";

/**
 * Servicio para gestionar el título de la página actual
 * Migrado de TituloService de Angular (BehaviorSubject)
 * Permite que múltiples componentes compartan y actualicen el título
 */
interface TituloState {
	titulo: string;
	actualizarTitulo: (titulo: string) => void;
}

export const useTituloStore = create<TituloState>((set) => ({
	titulo: "Inicio",
	actualizarTitulo: (nuevoTitulo: string) => {
		set({ titulo: nuevoTitulo });
	},
}));

