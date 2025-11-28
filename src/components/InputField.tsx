import { type JSX } from "react";
import { TextField } from "@mui/material";

interface InputFieldProps {
	name: string;
	label: string;
	type?: "text" | "number" | "email" | "password" | "date" | "tel" | "url";
	value: string | number;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	required?: boolean;
	disabled?: boolean;
	placeholder?: string;
	helperText?: string;
	error?: boolean;
	multiline?: boolean;
	rows?: number;
	fullWidth?: boolean;
	className?: string;
	maxLength?: number;
}

/**
 * Componente de campo de entrada reutilizable
 * Basado en Material-UI TextField con soporte para diferentes tipos de input
 */
export default function InputField({
	name,
	label,
	type = "text",
	value,
	onChange,
	required = false,
	disabled = false,
	placeholder,
	helperText,
	error = false,
	multiline = false,
	rows,
	fullWidth = true,
	className = "",
	maxLength,
}: InputFieldProps): JSX.Element {
	return (
		<TextField
			name={name}
			label={label}
			type={type}
			value={value}
			onChange={onChange}
			required={required}
			disabled={disabled}
			placeholder={placeholder}
			helperText={helperText}
			error={error}
			multiline={multiline}
			rows={rows}
			fullWidth={fullWidth}
			variant="outlined"
			size="small"
			className={className}
			inputProps={maxLength ? { maxLength: maxLength } : undefined}
		/>
	);
}

