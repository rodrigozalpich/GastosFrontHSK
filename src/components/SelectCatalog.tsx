import { type JSX, useMemo, useCallback } from "react";

// Tipo base para opciones de catálogo
type CatalogOptionBase = {
	id: number;
	[key: string]: unknown;
};

interface SelectCatalogProps<T extends CatalogOptionBase = CatalogOptionBase> {
	value: number;
	onChange: (value: number) => void;
	options: T[];
	label: string;
	required?: boolean;
	disabled?: boolean;
	placeholder?: string;
	displayField?: string; // Campo a mostrar (nombre, nombrePlaza, etc.)
	valueField?: string; // Campo para el valor (id por defecto)
	emptyLabel?: string;
}

/**
 * Componente reutilizable para seleccionar elementos de catálogos
 * Soporta diferentes tipos de catálogos (CentroCostos, Plazas, Divisiones, etc.)
 */
export default function SelectCatalog<T extends CatalogOptionBase = CatalogOptionBase>({
	value,
	onChange,
	options,
	label,
	required = false,
	disabled = false,
	placeholder = "Seleccione una opción",
	displayField = "nombre",
	valueField = "id",
	emptyLabel = "Sin seleccionar",
}: SelectCatalogProps<T>): JSX.Element {
	// Función para obtener el texto a mostrar
	const getDisplayText = useCallback(
		(option: T): string => {
			// Intentar diferentes campos comunes
			const fieldValue = option[displayField];
			const text =
				(typeof fieldValue === "string" ? fieldValue : null) ||
				(typeof option.nombre === "string" ? option.nombre : null) ||
				(typeof (option as unknown as { nombrePlaza?: string | null }).nombrePlaza === "string"
					? (option as unknown as { nombrePlaza: string }).nombrePlaza
					: null) ||
				(typeof (option as unknown as { nombreDivision?: string | null }).nombreDivision === "string"
					? (option as unknown as { nombreDivision: string }).nombreDivision
					: null) ||
				(typeof (option as unknown as { nombreClave?: string | null }).nombreClave === "string"
					? (option as unknown as { nombreClave: string }).nombreClave
					: null) ||
				(typeof (option as unknown as { claveProd?: string | null }).claveProd === "string"
					? (option as unknown as { claveProd: string }).claveProd
					: null) ||
				(typeof (option as unknown as { codigo?: string | null }).codigo === "string"
					? (option as unknown as { codigo: string }).codigo
					: null) ||
				(typeof (option as unknown as { descripcion?: string | null }).descripcion === "string"
					? (option as unknown as { descripcion: string }).descripcion
					: null) ||
				`ID: ${option.id}`;

			return text || emptyLabel;
		},
		[displayField, emptyLabel]
	);

	// Función para obtener el valor
	const getValue = (option: T): number => {
		const fieldValue = option[valueField];
		return (typeof fieldValue === "number" ? fieldValue : null) || option.id || 0;
	};

	// Ordenar opciones por el texto de visualización
	const sortedOptions = useMemo(() => {
		return [...options].sort((a, b) => {
			const textA = getDisplayText(a).toLowerCase();
			const textB = getDisplayText(b).toLowerCase();
			return textA.localeCompare(textB, "es", { sensitivity: "base" });
		});
	}, [options, getDisplayText]);

	return (
		<div>
			<label className="block text-sm font-medium text-gray-700 mb-1">
				{label} {required && <span className="text-red-500">*</span>}
			</label>
			<select
				value={value || 0}
				onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
				disabled={disabled}
				required={required}
				className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
			>
				<option value={0}>{placeholder}</option>
				{sortedOptions.map((option) => {
					const optionValue = getValue(option);
					const displayText = getDisplayText(option);
					return (
						<option key={optionValue} value={optionValue}>
							{displayText}
						</option>
					);
				})}
			</select>
		</div>
	);
}

