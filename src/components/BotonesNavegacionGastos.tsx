import { type JSX, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import IconoSVG from "./IconoSVG";
import { ICONOS_MENU } from "../config/iconPaths";
import { ROUTES } from "../config/routes.config";
import { useAuthStore } from "../store/authStore";

/**
 * Configuración de los botones de navegación
 */
const BOTONES_NAVEGACION = [
	{
		name: "Mis gastos",
		link: ROUTES.GASTOS_MIS_GASTOS,
		imageUrl: ICONOS_MENU.misGastos,
		requiereAutorizador: false,
	},
	{
		name: "Listado de gastos",
		link: ROUTES.GASTOS_LISTADO,
		imageUrl: ICONOS_MENU.listadoDeGastos,
		requiereAutorizador: false,
	},
	{
		name: "Gastos por autorizar",
		link: ROUTES.GASTOS_POR_AUTORIZAR,
		imageUrl: ICONOS_MENU.gestionGastos,
		requiereAutorizador: true,
	},
	{
		name: "Gastos autorizados",
		link: ROUTES.GASTOS_AUTORIZADOS,
		imageUrl: ICONOS_MENU.gestionGastos,
		requiereAutorizador: true,
	},
	{
		name: "Gastos por pagar",
		link: ROUTES.GASTOS_POR_PAGAR,
		imageUrl: ICONOS_MENU.gastosPorPagar,
		requiereAutorizador: false,
	},
] as const;

/**
 * Componente de botones de navegación para las páginas de gastos
 * Muestra botones de navegación para acceder a las diferentes secciones de gastos
 *
 * @returns {JSX.Element} El componente de botones de navegación
 */
export default function BotonesNavegacionGastos(): JSX.Element {
	const navigate = useNavigate();
	const location = useLocation();
	const esAutorizador = useAuthStore((state) => state.esAutorizador);

	// Filtrar botones según si el usuario es autorizador
	const botonesVisibles = useMemo(() => {
		return BOTONES_NAVEGACION.filter((boton) => {
			// Si el botón requiere autorizador, solo mostrarlo si esAutorizador === true
			if (boton.requiereAutorizador) {
				return esAutorizador === true;
			}
			// Los botones que no requieren autorizador siempre se muestran
			return true;
		});
	}, [esAutorizador]);

	const navegarARuta = (ruta: string) => {
		navigate(ruta);
	};

	return (
		<div className="mb-4 sm:mb-6">
			{/* Botones de navegación */}
			<div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
				{botonesVisibles.map((boton) => {
					const estaActivo = location.pathname === boton.link;
					return (
						<button
							key={boton.link}
							onClick={() => navegarARuta(boton.link)}
							className={`group cursor-pointer rounded-lg items-center px-6 py-2 flex font-medium tracking-wider text-center transition-all duration-200 shadow-md hover:shadow-lg min-w-[200px] justify-center ${estaActivo ? "bg-[#312E81] text-[#F0F5F8]" : "bg-[#E0E7FF] text-[#818CF8] hover:text-[#3730A3]"}`}
						>
							<IconoSVG
								src={boton.imageUrl}
								alt={boton.name}
								className={`w-5 mr-3 mt-[2.25px] ${estaActivo ? "text-[#F0F5F8]" : "text-[#818CF8] group-hover:text-[#3730A3]"}`}
							/>
							<span className="text-base">{boton.name}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

