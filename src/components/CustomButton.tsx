import { type JSX } from "react";

interface CustomButtonProps {
	type?: "button" | "submit" | "reset";
	text: string;
	onClick?: () => void;
	disabled?: boolean;
	isLoading?: boolean;
	className?: string;
	variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "info";
}

/**
 * Componente de botón personalizado y reutilizable
 * Soporta diferentes variantes y estados de carga
 */
export default function CustomButton({
	type = "button",
	text,
	onClick,
	disabled = false,
	isLoading = false,
	className = "",
	variant = "primary",
}: CustomButtonProps): JSX.Element {
	const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
	
	const variantClasses = {
		primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
		secondary: "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500",
		danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
		success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500",
		warning: "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500",
		info: "bg-blue-400 text-white hover:bg-blue-500 focus:ring-blue-400",
	};

	const disabledClasses = disabled || isLoading ? "opacity-50 cursor-not-allowed" : "";

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled || isLoading}
			className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
		>
			{isLoading ? "Cargando..." : text}
		</button>
	);
}

