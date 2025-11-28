import { useNotificacionStore } from "../store/notificacionStore.ts";
import { type JSX, useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCheckCircle,
	faCircleExclamation,
	faCircleInfo,
	faExclamationTriangle,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Un componente global que muestra notificaciones (snackbars) al usuario.
 * Se integra con un store de manejo de estado global (`useNotificacionStore`) para mostrar mensajes.
 * El snackbar aparece en la parte superior derecha de la pantalla y se oculta automáticamente después de 4 segundos.
 *
 * @component
 * @returns {JSX.Element} Un componente de notificaciones con diseño personalizado usando Tailwind CSS.
 */

interface NotificacionItemProps {
	notif: {
		id: number;
		mensaje: string;
		gravedad: "success" | "error" | "info" | "warning";
	};
	onClose: (id: number) => void;
}

const NotificacionItem = ({
	notif,
	onClose,
}: NotificacionItemProps): JSX.Element => {
	const [isExiting, setIsExiting] = useState(false);
	const progressRef = useRef<HTMLDivElement>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Configuración de iconos y colores según el tipo de notificación
	const getNotificacionConfig = (
		gravedad: "success" | "error" | "info" | "warning"
	) => {
		switch (gravedad) {
			case "success":
				return {
					icon: faCheckCircle,
					iconColor: "text-green-700",
					iconBg: "bg-green-100",
					iconTextColor: "text-green-700",
				};
			case "error":
				return {
					icon: faCircleExclamation,
					iconColor: "text-red-700",
					iconBg: "bg-red-100",
					iconTextColor: "text-red-700",
				};
			case "info":
				return {
					icon: faCircleInfo,
					iconColor: "text-blue-700",
					iconBg: "bg-blue-100",
					iconTextColor: "text-blue-700",
				};
			case "warning":
				return {
					icon: faExclamationTriangle,
					iconColor: "text-yellow-700",
					iconBg: "bg-yellow-100",
					iconTextColor: "text-yellow-700",
				};
			default:
				return {
					icon: faCircleInfo,
					iconColor: "text-blue-700",
					iconBg: "bg-blue-100",
					iconTextColor: "text-blue-700",
				};
		}
	};

	const config = getNotificacionConfig(notif.gravedad);

	const handleClose = useCallback(() => {
		// Detener el timer si existe
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		// Detener la animación de la barra de progreso
		if (progressRef.current) {
			progressRef.current.style.animation = "none";
		}
		setIsExiting(true);
		// Esperar a que termine la animación antes de cerrar
		setTimeout(() => {
			onClose(notif.id);
		}, 400); // Duración de la animación bounceOut
	}, [notif.id, onClose]);

	// Iniciar la barra de progreso y el timer de auto-cierre
	useEffect(() => {
		// Iniciar animación de la barra de progreso
		if (progressRef.current) {
			progressRef.current.style.animation = "progressBar 4s linear forwards";
		}

		// Timer para auto-cerrar después de 4 segundos
		timeoutRef.current = setTimeout(() => {
			handleClose();
		}, 4000);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [handleClose]);

	// Obtener color de la barra de progreso
	const getProgressBarColor = () => {
		switch (notif.gravedad) {
			case "success":
				return "bg-green-500";
			case "error":
				return "bg-red-500";
			case "info":
				return "bg-blue-500";
			case "warning":
				return "bg-yellow-500";
			default:
				return "bg-blue-500";
		}
	};

	return (
		<div
			className={`relative flex items-center w-full max-w-full sm:max-w-xs p-3 sm:p-4 mb-4 text-gray-500 bg-white rounded-lg shadow ${
				isExiting ? "animate-fade-out" : "animate-fade-in"
			}`}
			role="alert"
		>
			{/* Icono con fondo de color */}
			<div
				className={`inline-flex items-center justify-center flex-shrink-0 w-10 h-10 ${config.iconBg} ${config.iconTextColor} rounded-lg`}
			>
				<FontAwesomeIcon
					icon={config.icon}
					size="lg"
					aria-hidden="true"
				/>
				<span className="sr-only">
					{notif.gravedad === "success"
						? "Success icon"
						: notif.gravedad === "error"
						? "Error icon"
						: notif.gravedad === "warning"
						? "Warning icon"
						: "Info icon"}
				</span>
			</div>

			{/* Mensaje */}
			<div className="flex-1 ml-2 sm:ml-3 text-xs sm:text-sm font-medium min-w-0">
				<div
					className="text-gray-600 break-words"
					dangerouslySetInnerHTML={{ __html: notif.mensaje }}
				/>
			</div>

			{/* Botón de cerrar */}
			<button
				type="button"
				onClick={handleClose}
				className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
				aria-label="Close"
			>
				<span className="sr-only">Close</span>
				<FontAwesomeIcon
					icon={faTimes}
					className="w-3 h-3"
					aria-hidden="true"
				/>
			</button>

			{/* Barra de progreso */}
			<div className="overflow-hidden absolute right-0 bottom-0 left-0 h-1 bg-gray-200 rounded-b-lg">
				<div
					ref={progressRef}
					className={`h-full ${getProgressBarColor()} toast-progress`}
				/>
			</div>
		</div>
	);
};

const GlobalSnackbar = (): JSX.Element => {
	const { notificaciones, cerrarNotificacion } = useNotificacionStore();

	if (notificaciones.length === 0) {
		return <></>;
	}

	return (
		<div className="flex fixed top-4 right-2 sm:right-4 z-50 flex-col gap-2 sm:gap-3 max-w-[calc(100vw-1rem)] sm:max-w-xs">
			{notificaciones.map((notif) => (
				<NotificacionItem
					key={notif.id}
					notif={notif}
					onClose={cerrarNotificacion}
				/>
			))}
		</div>
	);
};

export default GlobalSnackbar;


