import { type JSX, useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CuentaContableGastosDTO } from "../../types/gastos";
import { useCuentaContable } from "../../hooks/useCuentaContable";
import { useAuthStore } from "../../store/authStore";
import { cuentaContableService } from "../../services/cuentaContableService";
import { monedaService } from "../../services/monedaService";
import AutocompleteSelectField from "../AutocompleteSelectField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "../ActionButton";

interface ModalCuentaContableProps {
	cuentaContable: CuentaContableGastosDTO | null;
	modo: "crear" | "editar" | null;
	onClose: () => void;
}

/**
 * Modal para crear o editar una cuenta contable
 */
export default function ModalCuentaContable({
	cuentaContable,
	modo,
	onClose,
}: ModalCuentaContableProps): JSX.Element | null {
	const { crearCuentaContable, actualizarCuentaContable, isCreating, isUpdating } = useCuentaContable();
	const { obtenerIdEmpresa } = useAuthStore();
	const idEmpresa = obtenerIdEmpresa();
	const [isClosing, setIsClosing] = useState(false);

	// Obtener monedas
	const { data: monedas = [], isLoading: isLoadingMonedas } = useQuery({
		queryKey: ["monedas", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) return [];
			return await monedaService.obtenerTodos(idEmpresa);
		},
		enabled: !!idEmpresa,
	});

	// Obtener tipos de cuentas contables
	const { data: tiposCuentas = [], isLoading: isLoadingTipos } = useQuery({
		queryKey: ["tiposCuentasContables", idEmpresa],
		queryFn: async () => {
			if (!idEmpresa) return [];
			return await cuentaContableService.obtenerTipos(idEmpresa);
		},
		enabled: !!idEmpresa,
	});

	// Preparar opciones de monedas para el AutocompleteSelectField
	const monedasOptions = useMemo(() => {
		return monedas.map((moneda) => ({
			id: moneda.id,
			nombre: moneda.nombre || moneda.descripcion || moneda.codigo || `Moneda ${moneda.id}`,
		}));
	}, [monedas]);

	// Preparar opciones de tipos de cuentas para el AutocompleteSelectField
	const tiposCuentasOptions = useMemo(() => {
		return tiposCuentas.map((tipo: unknown, index: number) => {
			const tipoObj = tipo as { id?: number; nombre?: string; descripcion?: string; tipoDeCuentaN?: string; [key: string]: unknown };
			return {
				id: tipoObj.id || index + 1,
				nombre: tipoObj.nombre || tipoObj.descripcion || tipoObj.tipoDeCuentaN || `Tipo ${index + 1}`,
			};
		});
	}, [tiposCuentas]);

	// Estado del formulario
	const [formData, setFormData] = useState<Partial<CuentaContableGastosDTO>>({
		codigo: "",
		descripcion: "",
		tipoMoneda: 1, // 1 = MXN por defecto
		esAcreedor: false,
		tipoCuenta: 0,
		tipoDeCuentaN: null,
		borrado: false,
	});

	// Función para obtener el nombre del tipo de cuenta por ID
	const obtenerNombreTipoCuenta = useMemo(() => {
		return (idTipo: number): string | null => {
			const tipo = tiposCuentasOptions.find((t) => t.id === idTipo);
			return tipo?.nombre || null;
		};
	}, [tiposCuentasOptions]);

	// Cargar datos de la cuenta contable cuando se abre en modo editar
	useEffect(() => {
		if (cuentaContable && modo === "editar") {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setFormData({
				id: cuentaContable.id,
				codigo: cuentaContable.codigo || "",
				descripcion: cuentaContable.descripcion || "",
				tipoMoneda: cuentaContable.tipoMoneda,
				esAcreedor: cuentaContable.esAcreedor,
				tipoCuenta: cuentaContable.tipoCuenta,
				tipoDeCuentaN: cuentaContable.tipoDeCuentaN || obtenerNombreTipoCuenta(cuentaContable.tipoCuenta),
				borrado: cuentaContable.borrado,
			});
		} else if (modo === "crear") {
			// Resetear formulario para crear
			setFormData({
				codigo: "",
				descripcion: "",
				tipoMoneda: 1,
				esAcreedor: false,
				tipoCuenta: 0,
				tipoDeCuentaN: null,
				borrado: false,
			});
		}
	}, [cuentaContable, modo, obtenerNombreTipoCuenta]);

	const handleClose = () => {
		if (isClosing) return;
		setIsClosing(true);
	};

	// Mantener el modal montado durante la animación de salida
	if (!modo && !isClosing) {
		return null;
	}

	const handleTipoCuentaChange = (idTipo: number) => {
		const nombreTipo = obtenerNombreTipoCuenta(idTipo);
		setFormData({
			...formData,
			tipoCuenta: idTipo,
			tipoDeCuentaN: nombreTipo,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Asegurar que tipoDeCuentaN esté presente
		const tipoDeCuentaNFinal =
			formData.tipoDeCuentaN || obtenerNombreTipoCuenta(formData.tipoCuenta || 0);

		if (modo === "editar" && cuentaContable) {
			const cuentaContableActualizada: CuentaContableGastosDTO = {
				...cuentaContable,
				codigo: formData.codigo || null,
				descripcion: formData.descripcion || null,
				tipoMoneda: formData.tipoMoneda || 1,
				esAcreedor: formData.esAcreedor || false,
				tipoCuenta: formData.tipoCuenta || 0,
				tipoDeCuentaN: tipoDeCuentaNFinal,
				borrado: formData.borrado || false,
			};

			actualizarCuentaContable.mutate(cuentaContableActualizada, {
				onSuccess: () => {
					if (!isClosing) {
						handleClose();
					}
				},
			});
		} else if (modo === "crear") {
			const nuevaCuentaContable: CuentaContableGastosDTO = {
				id: 0,
				codigo: formData.codigo || null,
				descripcion: formData.descripcion || null,
				tipoMoneda: formData.tipoMoneda || 1,
				idPadre: 0,
				nivel: 0,
				existeMovimiento: false,
				existePoliza: false,
				fechaAlta: new Date().toISOString(),
				esAcreedor: formData.esAcreedor || false,
				estatus: true, // Siempre true al crear
				tipoCuenta: formData.tipoCuenta || 0,
				borrado: false,
				permiso: false,
				tipoDeCuentaN: tipoDeCuentaNFinal,
				esDefault: null,
				editarDefault: null,
			};

			crearCuentaContable.mutate(nuevaCuentaContable, {
				onSuccess: () => {
					if (!isClosing) {
						handleClose();
					}
				},
			});
		}
	};

	return (
		<div
			className={`fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
				isClosing ? "animate-modal-overlay-out" : "animate-modal-overlay-in"
			}`}
			onClick={handleClose}
		>
			<div
				className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
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
						{modo === "crear" && "Crear Nueva Cuenta Contable"}
						{modo === "editar" && "Editar Cuenta Contable"}
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
					<div className="grid grid-cols-2 gap-4">
						{/* Código */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
							<input
								type="text"
								value={formData.codigo || ""}
								onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						{/* Descripción */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Descripción <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								value={formData.descripcion || ""}
								onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
								required
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						{/* Tipo Moneda */}
						<AutocompleteSelectField
							value={formData.tipoMoneda || 0}
							onChange={(value) => setFormData({ ...formData, tipoMoneda: value })}
							options={monedasOptions}
							label="Tipo Moneda"
							placeholder="Seleccione una moneda"
							displayField="nombre"
							disabled={isLoadingMonedas}
						/>

						{/* Tipo Cuenta */}
						<AutocompleteSelectField
							value={formData.tipoCuenta || 0}
							onChange={handleTipoCuentaChange}
							options={tiposCuentasOptions}
							label="Tipo Cuenta"
							placeholder="Seleccione un tipo de cuenta"
							displayField="nombre"
							disabled={isLoadingTipos}
						/>
					</div>

					{/* Es Acreedor */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Tipo de Cuenta <span className="text-red-500">*</span>
						</label>
						<select
							value={formData.esAcreedor ? "true" : "false"}
							onChange={(e) => setFormData({ ...formData, esAcreedor: e.target.value === "true" })}
							required
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="false">Deudora</option>
							<option value="true">Acreedora</option>
						</select>
					</div>

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
							text={modo === "crear" ? "Crear" : "Guardar"}
							isLoading={isCreating || isUpdating}
							loadingText="Guardando..."
							disabled={isCreating || isUpdating}
						/>
					</div>
				</form>
			</div>
		</div>
	);
}

