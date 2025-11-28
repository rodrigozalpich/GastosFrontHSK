import type { JSX } from "react";

export interface LoaderProps {
	/** Texto opcional para mostrar en lugar del mensaje predeterminado */
	text?: string;
	/** Valor de z-index para el loader. Por defecto es 50 */
	zIndex?: number;
	/** Variante del loader: default, compact o minimal */
	variant?: "default" | "compact" | "minimal";
	/** Clase CSS adicional para personalización */
	className?: string;
}

/**
 * Un componente indicador de carga a pantalla completa.
 * Muestra diferentes variantes de animaciones de carga con diseño limpio y orgánico.
 * Es una pantalla de carga completa, no un modal con fondo borroso.
 *
 * @component
 * @param {LoaderProps} props - Las propiedades del componente.
 * @returns {JSX.Element} Un elemento div que actúa como una pantalla de carga completa.
 */
export default function Loader({
	text,
	zIndex = 50,
	variant = "default",
	className,
}: LoaderProps): JSX.Element {
	// Función helper para combinar clases
	const cn = (...classes: (string | undefined | false)[]): string => {
		return classes.filter(Boolean).join(" ");
	};

	// Variante minimal - La más simple y discreta
	if (variant === "minimal") {
		return (
			<div
				className={cn(
					"fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-white",
					className
				)}
				style={{ zIndex }}
			>
				<div className="flex flex-col items-center gap-4">
					<div className="relative">
						<div className="loader"></div>
					</div>
					{text && (
						<p className="text-sm text-gray-600 font-medium animate-pulse">
							{text}
						</p>
					)}
				</div>
			</div>
		);
	}

	// Variante compact - Intermedia, balanceada
	if (variant === "compact") {
		return (
			<div
				className={cn(
					"fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-orange-100/40",
					className
				)}
				style={{ zIndex }}
			>
				<div className="flex flex-col items-center gap-6 px-8">
					{/* Spinner principal con efecto de pulso */}
					<div className="relative flex items-center justify-center">
						{/* Círculo de pulso exterior */}
						<div
							className="absolute inset-0 rounded-full bg-orange-400/20 animate-ping"
							style={{ animationDuration: "2s" }}
						></div>
						{/* Spinner central */}
						<div className="relative">
							<div
								className="loader"
								style={{ width: "64px", padding: "12px" }}
							></div>
						</div>
					</div>

					{/* Texto de carga */}
					<div className="text-center space-y-2">
						<p className="text-base font-semibold text-gray-700">
							{text ? text : "Cargando, por favor espere..."}
						</p>
						{/* Puntos animados */}
						<div className="flex justify-center gap-2 mt-2">
							<div
								className="w-2 h-2 rounded-full bg-orange-400 animate-bounce"
								style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
							></div>
							<div
								className="w-2 h-2 rounded-full bg-orange-400 animate-bounce"
								style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
							></div>
							<div
								className="w-2 h-2 rounded-full bg-orange-400 animate-bounce"
								style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
							></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Variante default - La más completa y elegante
	return (
		<div
			className={cn(
				"fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-orange-100/50",
				className
			)}
			style={{ zIndex }}
		>
			<div className="flex flex-col items-center justify-center gap-8 px-6 py-12">
				{/* Contenedor principal del spinner con efecto orbital */}
				<div className="relative w-48 h-48 flex items-center justify-center">
					{/* Círculo de pulso exterior grande */}
					<div
						className="absolute inset-0 rounded-full bg-orange-400/10 animate-ping"
						style={{ animationDuration: "3s" }}
					></div>

					{/* Anillo orbital animado */}
					<div
						className="absolute inset-0 rounded-full border-2 border-orange-400/20 animate-spin"
						style={{ animationDuration: "4s" }}
					></div>

					{/* Spinner central con tamaño aumentado */}
					<div className="absolute inset-0 flex items-center justify-center z-10">
						<div className="relative">
							{/* Pulso interior */}
							<div
								className="absolute inset-0 rounded-full bg-orange-400/30 animate-pulse"
								style={{ animationDuration: "1.5s" }}
							></div>
							{/* Spinner principal */}
							<div className="relative">
								<div
									className="loader"
									style={{ width: "80px", padding: "16px" }}
								></div>
							</div>
						</div>
					</div>

					{/* Puntos decorativos orbitales */}
					<div
						className="absolute inset-0 animate-spin"
						style={{ animationDuration: "6s" }}
					>
						<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
							<div className="w-3 h-3 rounded-full bg-orange-400/60"></div>
						</div>
						<div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
							<div className="w-3 h-3 rounded-full bg-blue-400/60"></div>
						</div>
						<div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
							<div className="w-3 h-3 rounded-full bg-gray-400/60"></div>
						</div>
						<div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
							<div className="w-3 h-3 rounded-full bg-gray-400"></div>
						</div>
					</div>
				</div>

				{/* Texto y mensaje */}
				<div className="text-center space-y-3 max-w-md">
					<h3 className="text-xl font-semibold text-gray-800 animate-pulse">
						{text ? text : "Cargando, por favor espere..."}
					</h3>
					<p className="text-sm text-gray-600">
						Esto puede tardar unos momentos
					</p>
				</div>

				{/* Puntos animados decorativos */}
				<div className="flex gap-3 mt-4">
					<div
						className="w-3 h-3 rounded-full bg-orange-400 animate-pulse"
						style={{ animationDelay: "0ms", animationDuration: "1.2s" }}
					></div>
					<div
						className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"
						style={{ animationDelay: "400ms", animationDuration: "1.2s" }}
					></div>
					<div
						className="w-3 h-3 rounded-full bg-gray-500 animate-pulse"
						style={{ animationDelay: "800ms", animationDuration: "1.2s" }}
					></div>
				</div>
			</div>
		</div>
	);
}


