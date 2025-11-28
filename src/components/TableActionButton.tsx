import { type JSX } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Tooltip } from "@mui/material";

export type TableActionButtonVariant = "edit" | "delete" | "toggle" | "custom";
export type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface TableActionButtonProps {
	icon: IconDefinition;
	onClick: () => void;
	tooltip: string;
	variant?: TableActionButtonVariant;
	disabled?: boolean;
	customClassName?: string;
	customActiveClassName?: string;
	isActive?: boolean;
	tooltipPlacement?: TooltipPlacement;
}

/**
 * Componente reutilizable para botones de acciones en tablas
 * Soporta diferentes variantes: editar, eliminar, toggle y personalizado
 * Incluye tooltip visual con Material-UI Tooltip
 * Basado en el diseño de ActionButton.tsx
 */
export default function TableActionButton({
	icon,
	onClick,
	tooltip,
	variant = "custom",
	disabled = false,
	customClassName,
	customActiveClassName,
	isActive = false,
	tooltipPlacement = "top",
}: TableActionButtonProps): JSX.Element {
	// Clases base para todos los botones
	// Usando rounded-xl como en ActionButton.tsx
	const baseClasses = "px-2 py-1 rounded-xl transition-colors cursor-pointer";

	// Clases según la variante
	const getVariantClasses = (): string => {
		if (customClassName) {
			// Si hay clase personalizada y está activo, usar la clase activa
			if (isActive && customActiveClassName) {
				return customActiveClassName;
			}
			return customClassName;
		}

		switch (variant) {
			case "edit":
				return "bg-yellow-500 text-white hover:bg-yellow-600";
			case "delete":
				return "bg-red-500 text-white hover:bg-red-600";
			case "toggle":
				return isActive
					? "bg-blue-500 text-white hover:bg-blue-600"
					: "bg-gray-300 text-gray-700 hover:bg-gray-400";
			default:
				return "bg-gray-500 text-white hover:bg-gray-600";
		}
	};

	const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

	return (
		<Tooltip
			title={tooltip}
			placement={tooltipPlacement}
			arrow
			slotProps={{
				popper: {
					modifiers: [
						{
							name: "offset",
							options: {
								offset: [0, -8],
							},
						},
					],
				},
			}}
		>
			<button
				onClick={onClick}
				disabled={disabled}
				className={`${baseClasses} ${getVariantClasses()} ${disabledClasses}`}
				aria-label={tooltip}
			>
				{icon && <FontAwesomeIcon icon={icon} size="lg" />}
			</button>
		</Tooltip>
	);
}

