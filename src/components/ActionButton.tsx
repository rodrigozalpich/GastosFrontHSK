import { type JSX } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faPlus, faTimes, faSave, faCheck } from "@fortawesome/free-solid-svg-icons";

export type ActionButtonVariant = "cancel" | "submit" | "create" | "save" | "primary" | "secondary" | "custom";
export type ActionButtonType = "button" | "submit" | "reset";

interface ActionButtonProps {
	onClick?: () => void;
	text: string;
	variant?: ActionButtonVariant;
	type?: ActionButtonType;
	disabled?: boolean;
	isLoading?: boolean;
	loadingText?: string;
	icon?: IconDefinition | null; // null para ocultar icono
	customClassName?: string;
	showText?: boolean; // Si es false, siempre oculta el texto (útil para móvil)
	ariaLabel?: string;
	tooltip?: string; // Texto para tooltip (opcional)
	className?: string; // Clase CSS adicional (opcional)
}

/**
 * Componente reutilizable para botones de acción
 * Soporta diferentes variantes: cancelar, enviar, crear, guardar, primario, secundario y personalizado
 * Maneja estados de carga y diferentes tipos de botón
 */
export default function ActionButton({
	onClick,
	text,
	variant = "primary",
	type = "button",
	disabled = false,
	isLoading = false,
	loadingText,
	icon,
	customClassName,
	showText = true,
	ariaLabel,
	tooltip,
	className = "",
}: ActionButtonProps): JSX.Element {
	// Clases base
	const baseClasses = "cursor-pointer px-4 py-2 rounded transition-colors flex items-center gap-2";

	// Icono por defecto según la variante
	const getDefaultIcon = (): IconDefinition | null => {
		if (icon !== undefined) return icon; // Si se especifica explícitamente (incluso null), usar ese

		switch (variant) {
			case "cancel":
				return faTimes;
			case "create":
				return faPlus;
			case "save":
				return faSave;
			case "submit":
				return faCheck;
			default:
				return null; // Sin icono por defecto para primary, secondary, custom
		}
	};

	// Clases de color según la variante
	const getVariantClasses = (): string => {
		if (customClassName) {
			return customClassName;
		}

		switch (variant) {
			case "cancel":
				return "bg-gray-200 text-gray-800 hover:bg-gray-300";
			case "submit":
			case "save":
			case "primary":
				return "bg-blue-500 text-white hover:bg-blue-600";
			case "create":
				return "bg-green-600 text-white hover:bg-green-700";
			case "secondary":
				return "bg-gray-500 text-white hover:bg-gray-600";
			default:
				return "bg-blue-500 text-white hover:bg-blue-600";
		}
	};

	const disabledClasses = disabled || isLoading ? "opacity-50 cursor-not-allowed" : "";
	const defaultIcon = getDefaultIcon();
	const displayText = isLoading && loadingText ? loadingText : text;
	const finalDisabled = disabled || isLoading;

	// Si hay customClassName, usarlo en lugar de getVariantClasses
	const finalClassName = customClassName
		? `${baseClasses} ${customClassName} ${disabledClasses} ${className}`
		: `${baseClasses} ${getVariantClasses()} ${disabledClasses} ${className}`;

	const button = (
		<button
			type={type}
			onClick={onClick}
			className={finalClassName}
			disabled={finalDisabled}
			aria-label={ariaLabel || text}
			title={tooltip}
		>
			{defaultIcon && <FontAwesomeIcon icon={defaultIcon} className="w-4 h-4" />}
			{showText && <span className={variant === "create" ? "hidden sm:inline" : ""}>{displayText}</span>}
		</button>
	);

	// Si hay tooltip, envolver en un div con title
	if (tooltip) {
		return <div title={tooltip}>{button}</div>;
	}

	return button;
}

