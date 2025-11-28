import { type JSX, useEffect, useState } from "react";
import { useTituloStore } from "../services/tituloService";

/**
 * URLs de los iframes de PowerBI
 */
const IFRAME_URLS = {
	tablero: "https://app.powerbi.com/view?r=eyJrIjoiOGU4YTljMjYtOGQ2YS00NmQ2LWI5YzAtZDVlZjVlNjE5NTVjIiwidCI6ImMyZmM3YzNkLTE2M2YtNGY2NS05NmQ3LWQwZmVmMjMyNWQ1MiJ9",
	anomalias: "https://app.powerbi.com/view?r=eyJrIjoiNTQzZGQ2NzgtNjEwYy00YmY1LThjZWItNzg2ZDk3YTgzYjVlIiwidCI6ImMyZmM3YzNkLTE2M2YtNGY2NS05NmQ3LWQwZmVmMjMyNWQ1MiJ9",
	cluster: "https://app.powerbi.com/view?r=eyJrIjoiM2M1OGQ1M2UtOWE1Yi00NGNkLTg4ZjYtZGU4MDM2MmVhYjNkIiwidCI6ImMyZmM3YzNkLTE2M2YtNGY2NS05NmQ3LWQwZmVmMjMyNWQ1MiJ9",
	mba: "/assets/recomendacion.html", // Archivo local
} as const;

type VistaAnalytics = keyof typeof IFRAME_URLS;

/**
 * Componente de Analytics de Gastos
 * Muestra diferentes dashboards de PowerBI mediante iframes
 *
 * @returns {JSX.Element} El componente de analytics
 */
export default function Analytics(): JSX.Element {
	const { actualizarTitulo } = useTituloStore();
	const [vistaActiva, setVistaActiva] = useState<VistaAnalytics>(() => {
		// Recuperar la vista activa del localStorage si existe
		const vistaGuardada = localStorage.getItem("analyticsVistaActiva") as VistaAnalytics | null;
		return vistaGuardada && vistaGuardada in IFRAME_URLS ? vistaGuardada : "tablero";
	});

	useEffect(() => {
		actualizarTitulo("Analytics de Gastos");
	}, [actualizarTitulo]);

	useEffect(() => {
		// Guardar la vista activa en localStorage
		localStorage.setItem("analyticsVistaActiva", vistaActiva);
	}, [vistaActiva]);

	const seleccionarVista = (vista: VistaAnalytics) => {
		setVistaActiva(vista);
	};

	const getTituloVista = (vista: VistaAnalytics): string => {
		const titulos: Record<VistaAnalytics, string> = {
			tablero: "Tablero de control",
			anomalias: "Análisis de Anomalías",
			cluster: "Cluster análisis para clientes",
			mba: "Market Basket Analysis (MBA)",
		};
		return titulos[vista];
	};

	return (
		<div className="p-3 sm:p-4 lg:p-6">
			<div className="mb-4 sm:mb-6">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Analytics de Gastos</h1>
				<p className="text-sm sm:text-base text-gray-600">
					Análisis y visualización de datos de gastos mediante dashboards interactivos
				</p>
			</div>

			{/* Botones de navegación */}
			<div className="flex flex-wrap justify-center sm:justify-around gap-3 sm:gap-4 my-6">
				{(Object.keys(IFRAME_URLS) as VistaAnalytics[]).map((vista) => (
					<button
						key={vista}
						onClick={() => seleccionarVista(vista)}
						className={`
							bg-[#51aec7] text-[#f2f2f2] rounded-lg items-center px-4 py-2 flex font-bold tracking-wider
							text-center transition-all duration-200 hover:bg-[#367d91] hover:-translate-y-1 hover:scale-110
							${vistaActiva === vista ? "bg-[#367d91] text-white border-[#367d91]" : "text-white bg-[#51aec7] hover:bg-[#367d91]"}
						`}
					>
						{getTituloVista(vista)}
					</button>
				))}
			</div>

			{/* Contenedor del iframe con aspecto responsive */}
			<div className="w-full max-w-full overflow-hidden mb-8">
				<div className="relative pb-[56.25%] h-0">
					<iframe
						className="absolute top-0 left-0 w-full h-full border-0"
						title={getTituloVista(vistaActiva)}
						src={IFRAME_URLS[vistaActiva]}
						allowFullScreen
						loading="lazy"
					/>
				</div>
			</div>
		</div>
	);
}
