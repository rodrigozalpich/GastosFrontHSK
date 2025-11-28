import { type JSX, useState, useEffect } from "react";
import type { ClaveProductoDTO, ClaveProductoSAT } from "../../types/catalogos";
import { useClaveProducto } from "../../hooks/useClaveProducto";
import { divisionService } from "../../services/divisionService";
import { claveProductoService } from "../../services/claveProductoService";
import { cuentaContableService } from "../../services/cuentaContableService";
import { useAuthStore } from "../../store/authStore";
import AutocompleteSelectField from "../AutocompleteSelectField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import type { DivisionDTO } from "../../types/catalogos";
import type { CuentaContableGastosDTO } from "../../types/gastos";
import ActionButton from "../ActionButton";

interface ModalClaveProductoFormProps {
	esImpuesto: boolean;
	onClose: () => void;
	abierto?: boolean;
}

/**
 * Modal para crear una clave de producto o clave de impuesto
 */
export default function ModalClaveProductoForm({
	esImpuesto,
	onClose,
	abierto = true,
}: ModalClaveProductoFormProps): JSX.Element | null {
	const { crearClaveProducto, isCreating } = useClaveProducto();
	const { obtenerIdEmpresa } = useAuthStore();
	const idEmpresa = obtenerIdEmpresa();
	const [isClosing, setIsClosing] = useState(false);

	// Estados para los catálogos
	const [divisiones, setDivisiones] = useState<DivisionDTO[]>([]);
	const [clavesProducto, setClavesProducto] = useState<ClaveProductoDTO[]>([]);
	const [cuentasContables, setCuentasContables] = useState<CuentaContableGastosDTO[]>([]);
	const [categorias, setCategorias] = useState<Array<{ id: number; [key: string]: unknown }>>([]);
	const [isLoadingCatalogos, setIsLoadingCatalogos] = useState(false);
	const [isLoadingClavesProducto, setIsLoadingClavesProducto] = useState(false);

	// Estado del formulario
	const [formData, setFormData] = useState<Partial<ClaveProductoDTO>>({
		idClaveProd: 0,
		idDivision: 0,
		idCuentaContable: 0,
		idCategoria: 0,
		borrado: false,
	});

	// Cargar catálogos al abrir el modal
	useEffect(() => {
		const cargarCatalogos = async () => {
			if (!idEmpresa) return;

			setIsLoadingCatalogos(true);
			try {
				// Cargar divisiones
				const divisionesData = await divisionService.obtenerTodos(idEmpresa);
				setDivisiones(divisionesData);

				// Cargar cuentas contables (origen)
				const cuentasData = await cuentaContableService.obtenerOrigen(idEmpresa);
				setCuentasContables(cuentasData);
			} catch (error) {
				console.error("Error al cargar catálogos:", error);
			} finally {
				setIsLoadingCatalogos(false);
			}
		};

		cargarCatalogos();
	}, [idEmpresa]);

	// Cargar claves de producto cuando se selecciona una división
	// Estrategia: Cargar todas en segundo plano, pero mostrar solo las primeras 10 inicialmente
	useEffect(() => {
		const cargarClavesProducto = async () => {
			if (!idEmpresa || !formData.idDivision || formData.idDivision === 0) {
				setClavesProducto([]);
				setIsLoadingClavesProducto(false);
				return;
			}

			// Marcar como cargando solo brevemente para el feedback visual
			setIsLoadingClavesProducto(true);
			
			// Cargar en segundo plano sin bloquear
			claveProductoService
				.obtenerPorImpuestoYDivision(esImpuesto, formData.idDivision, idEmpresa)
				.then((clavesData) => {
					setClavesProducto(clavesData);
					setIsLoadingClavesProducto(false);
				})
				.catch((error) => {
					console.error("Error al cargar claves de producto:", error);
					setClavesProducto([]);
					setIsLoadingClavesProducto(false);
				});
		};

		cargarClavesProducto();
	}, [formData.idDivision, esImpuesto, idEmpresa]);

	// Cargar categorías cuando cambia el tipo
	useEffect(() => {
		const cargarCategorias = async () => {
			if (!idEmpresa) return;

			try {
				const categoriasData = await claveProductoService.obtenerCategorias(esImpuesto, idEmpresa);
				setCategorias(categoriasData as Array<{ id: number; [key: string]: unknown }>);
			} catch (error) {
				console.error("Error al cargar categorías:", error);
				setCategorias([]);
			}
		};

		cargarCategorias();
	}, [esImpuesto, idEmpresa]);

	// Resetear formulario cuando se abre
	useEffect(() => {
		setFormData({
			idClaveProd: 0,
			idDivision: 0,
			idCuentaContable: 0,
			idCategoria: 0,
			borrado: false,
		});
	}, [esImpuesto]);

	const handleClose = () => {
		if (isClosing) return;
		setIsClosing(true);
	};

	// Mantener el modal montado durante la animación de salida
	if ((!abierto && !isClosing) || (!idEmpresa && !isClosing)) {
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!idEmpresa) return;

		// Obtener los nombres de los catálogos seleccionados
		const divisionSeleccionada = divisiones.find((d) => d.id === formData.idDivision);
		const cuentaContableSeleccionada = cuentasContables.find(
			(cc) => cc.id === formData.idCuentaContable
		);
		const claveProductoSeleccionada: ClaveProductoSAT | undefined = clavesProducto.find(
			(cp) => cp.id === formData.idClaveProd
		) as ClaveProductoSAT | undefined;

		const nuevaClaveProducto: ClaveProductoDTO = {
			id: 0,
			idClaveProd: formData.idClaveProd || 0,
			idDivision: formData.idDivision || 0,
			idCuentaContable: formData.idCuentaContable || 0,
			idCategoria: formData.idCategoria || 0,
			borrado: false,
			claveProd: claveProductoSeleccionada?.claveProducto || "",
			nombreClave: claveProductoSeleccionada?.nombre || "",
			nombreDivision: divisionSeleccionada?.nombre || "",
			nombreCuentaContable: cuentaContableSeleccionada?.descripcion || "",
		};


		crearClaveProducto.mutate(nuevaClaveProducto, {
			onSuccess: () => {
				if (!isClosing) {
					handleClose();
				}
			},
		});
	};

	return (
		<div
			className={`fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
				isClosing ? "animate-modal-overlay-out" : "animate-modal-overlay-in"
			}`}
			onClick={handleClose}
		>
			<div
				className={`bg-white rounded-lg shadow-xl max-w-md w-full ${
					isClosing ? "animate-modal-content-out" : "animate-modal-content-in"
				}`}
				onClick={(e) => e.stopPropagation()}
				onAnimationEnd={(e) => {
					if (e.currentTarget === e.target && isClosing) {
						setTimeout(() => {
							setIsClosing(false);
							onClose();
						}, 50);
					}
				}}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-bold text-gray-900">
						{esImpuesto ? "Nueva Clave de Impuesto" : "Nueva Clave de Producto"}
					</h2>
					<button
						onClick={handleClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Cerrar"
					>
						<FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
					</button>
				</div>

				{/* Formulario */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					{/* División */}
					<AutocompleteSelectField
						value={formData.idDivision || 0}
						onChange={(value) => {
							// Resetear la clave de producto cuando cambia la división
							setFormData({ ...formData, idDivision: value, idClaveProd: 0 });
							setClavesProducto([]); // Limpiar las claves anteriores
						}}
						options={divisiones as unknown as Array<{ id: number; [key: string]: unknown }>}
						label="División"
						required
						placeholder="Seleccione una división"
						displayField="nombre"
						disabled={isLoadingCatalogos}
					/>

					{/* Clave Producto */}
					<div className="relative">
						<AutocompleteSelectField
							value={formData.idClaveProd || 0}
							onChange={(value) => setFormData({ ...formData, idClaveProd: value })}
							options={clavesProducto as unknown as Array<{ id: number; [key: string]: unknown }>}
							label={esImpuesto ? "Clave de Impuesto" : "Clave de Producto"}
							required
							placeholder={
								isLoadingClavesProducto
									? "Cargando claves..."
									: `Seleccione una ${esImpuesto ? "clave de impuesto" : "clave de producto"}`
							}
							displayField="claveProd"
							disabled={
								!formData.idDivision ||
								formData.idDivision === 0 ||
								isLoadingCatalogos ||
								isLoadingClavesProducto
							}
							initialVisibleCount={10}
						/>
						{isLoadingClavesProducto && (
							<div className="absolute right-10 top-9 flex items-center gap-2 text-sm text-gray-500 cursor-not-allowed">
								<div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
								<span className="text-xs cursor-not-allowed">Cargando...</span>
							</div>
						)}
					</div>

					{/* Cuenta Contable */}
					<AutocompleteSelectField
						value={formData.idCuentaContable || 0}
						onChange={(value) => setFormData({ ...formData, idCuentaContable: value })}
						options={cuentasContables as unknown as Array<{ id: number; [key: string]: unknown }>}
						label="Cuenta Contable"
						required
						placeholder="Seleccione una cuenta contable"
						displayField="descripcion"
						disabled={isLoadingCatalogos}
					/>

					{/* Categoría */}
					<AutocompleteSelectField
						value={formData.idCategoria || 0}
						onChange={(value) => setFormData({ ...formData, idCategoria: value })}
						options={categorias}
						label="Categoría"
						required
						placeholder="Seleccione una categoría"
						displayField="descripcion"
						disabled={isLoadingCatalogos}
					/>

					{/* Botones */}
					<div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
						<ActionButton
							variant="cancel"
							type="button"
							onClick={handleClose}
							text="Cancelar"
						/>
						<ActionButton
							variant="submit"
							type="submit"
							text="Crear"
							isLoading={isCreating || isLoadingCatalogos}
							loadingText="Creando..."
							disabled={isCreating || isLoadingCatalogos}
						/>
					</div>
				</form>
			</div>
		</div>
	);
}

