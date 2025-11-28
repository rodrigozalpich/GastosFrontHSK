import { type JSX, useState, useRef, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faTimes } from "@fortawesome/free-solid-svg-icons";

export interface AutocompleteOption {
	id: number;
	[key: string]: unknown;
}

interface AutocompleteSelectFieldProps<T extends AutocompleteOption = AutocompleteOption> {
	value: number;
	onChange: (value: number) => void;
	options: T[];
	label: string;
	required?: boolean;
	disabled?: boolean;
	placeholder?: string;
	displayField?: string; // Campo a mostrar (nombre, descripcion, etc.)
	valueField?: string; // Campo para el valor (id por defecto)
	emptyLabel?: string;
	initialVisibleCount?: number; // Número de opciones a mostrar inicialmente (default: 10)
}

/**
 * Componente reutilizable de autocomplete con dropdown
 * Similar a AutocompleteSelectFieldLocal pero con nombre más descriptivo
 */
export default function AutocompleteSelectField<T extends AutocompleteOption = AutocompleteOption>({
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
	initialVisibleCount = 10,
}: AutocompleteSelectFieldProps<T>): JSX.Element {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	// Función para obtener el texto a mostrar (memoizada)
	const getDisplayText = useCallback(
		(option: T): string => {
			const fieldValue = option[displayField];
			const text =
				(typeof fieldValue === "string" ? fieldValue : null) ||
				(typeof option.nombre === "string" ? option.nombre : null) ||
				(typeof (option as unknown as { descripcion?: string | null }).descripcion === "string"
					? (option as unknown as { descripcion: string }).descripcion
					: null) ||
				`ID: ${option.id}`;

			return text || emptyLabel;
		},
		[displayField, emptyLabel]
	);

	// Función para obtener el valor (memoizada)
	const getValue = useCallback(
		(option: T): number => {
			const fieldValue = option[valueField];
			return (typeof fieldValue === "number" ? fieldValue : null) || option.id || 0;
		},
		[valueField]
	);

	// Obtener la opción seleccionada (memoizada)
	const selectedOption = useMemo(
		() => options.find((opt) => getValue(opt) === value),
		[options, value, getValue]
	);

	const displayValue = useMemo(
		() => (selectedOption ? getDisplayText(selectedOption) : ""),
		[selectedOption, getDisplayText]
	);

	// Pre-calcular textos de visualización para mejor rendimiento
	const optionsWithText = useMemo(() => {
		return options.map((option) => ({
			option,
			text: getDisplayText(option),
			textLower: getDisplayText(option).toLowerCase(),
			value: getValue(option),
		}));
	}, [options, getDisplayText, getValue]);

	// Filtrar y ordenar opciones (memoizado)
	const sortedOptions = useMemo(() => {
		let filtered: typeof optionsWithText;
		
		if (!searchTerm) {
			// Si no hay término de búsqueda, solo ordenar
			filtered = [...optionsWithText].sort((a, b) => {
				return a.textLower.localeCompare(b.textLower, "es", { sensitivity: "base" });
			});
		} else {
			// Filtrar y ordenar
			const searchLower = searchTerm.toLowerCase();
			filtered = [...optionsWithText]
				.filter((item) => item.textLower.includes(searchLower))
				.sort((a, b) => {
					return a.textLower.localeCompare(b.textLower, "es", { sensitivity: "base" });
				});
		}
		
		return filtered;
	}, [optionsWithText, searchTerm]);

	// Opciones visibles (limitadas inicialmente, todas cuando hay búsqueda)
	const visibleOptions = useMemo(() => {
		// Si hay búsqueda, mostrar todas las opciones filtradas
		if (searchTerm) {
			return sortedOptions;
		}
		// Si no hay búsqueda, mostrar solo las primeras N opciones
		return sortedOptions.slice(0, visibleCount);
	}, [sortedOptions, searchTerm, visibleCount]);


	// Manejar scroll para cargar más opciones
	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const target = e.currentTarget;
			const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

			if (isNearBottom && !searchTerm && visibleCount < sortedOptions.length) {
				// Cargar 10 más
				setVisibleCount((prev) => Math.min(prev + 10, sortedOptions.length));
			}
		},
		[searchTerm, visibleCount, sortedOptions.length]
	);

	// Cerrar dropdown al hacer click fuera
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setSearchTerm("");
				setVisibleCount(initialVisibleCount);
			}
		};

		// Usar setTimeout para evitar que se cierre inmediatamente al abrir
		const timeoutId = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 0);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, initialVisibleCount]);

	// Focus en el input cuando se abre el dropdown
	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	const handleSelect = useCallback(
		(option: T) => {
			const optionValue = getValue(option);
			onChange(optionValue);
			setIsOpen(false);
			setSearchTerm("");
			setVisibleCount(initialVisibleCount);
		},
		[onChange, getValue, initialVisibleCount]
	);

	const handleClear = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onChange(0);
			setSearchTerm("");
		},
		[onChange]
	);

	const handleToggleOpen = useCallback(() => {
		setIsOpen((prev) => {
			if (prev) {
				// Si se está cerrando, resetear el contador
				setVisibleCount(initialVisibleCount);
				setSearchTerm("");
			}
			return !prev;
		});
	}, [initialVisibleCount]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newSearchTerm = e.target.value;
			setSearchTerm(newSearchTerm);
			// Si hay búsqueda, mostrar todas las opciones
			if (newSearchTerm) {
				setVisibleCount(sortedOptions.length);
			} else {
				setVisibleCount(initialVisibleCount);
			}
			if (!isOpen) {
				setIsOpen(true);
			}
		},
		[isOpen, sortedOptions.length, initialVisibleCount]
	);

	const handleInputFocus = useCallback(() => {
		setIsOpen(true);
		setSearchTerm("");
	}, []);

	const handleInputClick = useCallback(() => {
		setIsOpen(true);
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<label className="block text-sm font-medium text-gray-700 mb-1">
				{label} {required && <span className="text-red-500">*</span>}
			</label>
			<div className="relative">
				<input
					ref={inputRef}
					type="text"
					value={isOpen ? searchTerm : displayValue}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
					onClick={handleInputClick}
					disabled={disabled}
					required={required}
					placeholder={placeholder}
					className="w-full border border-gray-300 rounded-md px-3 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
				/>
				<div className="absolute inset-y-0 right-0 flex items-center pr-2">
					{value !== 0 && !disabled && (
						<button
							type="button"
							onClick={handleClear}
							className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
							aria-label="Limpiar"
						>
							<FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
						</button>
					)}
					<button
						type="button"
						onClick={handleToggleOpen}
						disabled={disabled}
						className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
						aria-label="Abrir/cerrar"
					>
						<FontAwesomeIcon
							icon={faChevronDown}
							className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
						/>
					</button>
				</div>
			</div>

			{/* Dropdown */}
			{isOpen && (
				<div
					ref={listRef}
					className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
					style={{ willChange: "transform" }}
					onScroll={handleScroll}
				>
					{visibleOptions.length === 0 ? (
						<div className="px-4 py-2 text-sm text-gray-500">No se encontraron opciones</div>
					) : (
						<>
							{visibleOptions.map((item) => {
								const isSelected = item.value === value;

								return (
									<button
										key={item.value}
										type="button"
										onClick={() => handleSelect(item.option)}
										className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
											isSelected ? "bg-blue-100 font-medium" : ""
										}`}
									>
										{item.text}
									</button>
								);
							})}
							{!searchTerm && visibleCount < sortedOptions.length && (
								<div className="px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-200">
									Mostrando {visibleCount} de {sortedOptions.length} opciones. 
									<span className="text-blue-600 ml-1">Desplázate para ver más</span>
								</div>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
}

