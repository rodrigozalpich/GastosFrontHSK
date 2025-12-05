import { type JSX } from "react";
import { Tooltip } from "@mui/material";
import IconoSVG from "./IconoSVG";

export type TableActionButtonVariant =
	| "ver"
	| "edit"
	| "delete"
	| "toggle"
	| "custom";
export type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface TableActionButtonProps {
	iconSrc: string;
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
	iconSrc,
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
	const getVariantClasses = (): { button: string; icon: string } => {
		if (customClassName) {
			// Si hay clase personalizada y está activo, usar la clase activa
			if (isActive && customActiveClassName) {
				return { button: customActiveClassName, icon: "" };
			}
			return { button: customClassName, icon: "" };
		}

		switch (variant) {
			case "ver":
				return {
					button: "bg-[#E0F2FE] hover:bg-[#0EA5E9]",
					icon: "text-[#0369A1] group-hover:text-[#E0F2FE]",
				};
			case "edit":
				return {
					button: "bg-[#CCFBF1] hover:bg-[#14B8A6]",
					icon: "text-[#15803D] group-hover:text-[#DCFCE7]",
				};
			case "delete":
				return {
					button: "bg-[#FEE2E2] hover:bg-[#EF4444]",
					icon: "text-[#B91C1C] group-hover:text-[#FEE2E2]",
				};
			case "toggle":
				return isActive
					? {
							button: "bg-blue-500 hover:bg-blue-600",
							icon: "text-white",
					  }
					: {
							button: "bg-gray-300 hover:bg-gray-400",
							icon: "text-gray-700",
					  };
			default:
				return {
					button: "bg-gray-500 hover:bg-gray-600",
					icon: "text-white",
				};
		}
	};

	const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
	const variantClasses = getVariantClasses();

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
				className={`group ${baseClasses} ${variantClasses.button} ${disabledClasses}`}
				aria-label={tooltip}
			>
				{iconSrc && (
					<IconoSVG
						src={iconSrc}
						alt={tooltip}
						className={`w-5 h-5 transition-colors ${variantClasses.icon}`}
					/>
				)}
			</button>
		</Tooltip>
	);
}
