import { type JSX } from "react";
import { Switch } from "@mui/material";
import { styled } from "@mui/material/styles";

interface CustomSwitchProps {
	checked: boolean;
	onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) | (() => void);
	checkedText?: string;
	uncheckedText?: string;
	disabled?: boolean;
	className?: string;
	size?: "small" | "medium";
	color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
}

// Crear el componente estilizado fuera de la función de render
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
	width: 58,
	height: 34,
	padding: 7,
	"& .MuiSwitch-switchBase": {
		margin: 1,
		padding: 0,
		transform: "translateX(6px)",
		"&.Mui-checked": {
			color: "#fff",
			transform: "translateX(22px)",
			"& .MuiSwitch-thumb:before": {
				backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
					"#fff"
				)}" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>')`,
			},
			"& + .MuiSwitch-track": {
				opacity: 1,
				backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
			},
		},
	},
	"& .MuiSwitch-thumb": {
		backgroundColor: theme.palette.mode === "dark" ? "#003892" : "#001e3c",
		width: 32,
		height: 32,
		"&:before": {
			content: "''",
			position: "absolute",
			width: "100%",
			height: "100%",
			left: 0,
			top: 0,
			zIndex: -1,
			backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
				"#fff"
			)}" d="M19 13H5v-2h14v2z"/></svg>')`,
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center",
		},
	},
	"& .MuiSwitch-track": {
		opacity: 1,
		backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
		borderRadius: 20 / 2,
	},
}));

/**
 * Componente Switch personalizado y reutilizable
 * Basado en Material-UI Switch con texto opcional para estados checked/unchecked
 */
export default function CustomSwitch({
	checked,
	onChange,
	checkedText,
	uncheckedText,
	disabled = false,
	className = "",
	size = "medium",
	color = "primary",
}: CustomSwitchProps): JSX.Element {
	return (
		<div className={`flex items-center gap-2 ${className}`}>
			{uncheckedText && !checked && (
				<span className="text-sm text-gray-600 whitespace-nowrap">{uncheckedText}</span>
			)}
			<MaterialUISwitch
				checked={checked}
				onChange={(e) => {
					// Si onChange no espera evento, llamarlo sin parámetros
					if (onChange.length === 0) {
						(onChange as () => void)();
					} else {
						(onChange as (event: React.ChangeEvent<HTMLInputElement>) => void)(e);
					}
				}}
				disabled={disabled}
				size={size}
				color={color}
			/>
			{checkedText && checked && (
				<span className="text-sm text-gray-600 whitespace-nowrap">{checkedText}</span>
			)}
		</div>
	);
}
