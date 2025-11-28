import { type JSX } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import type { PolizaGastosDTO, PolizaDetalleGastosDTO } from "../../types/gastos";
import Loader from "../Loader";
import ActionButton from "../ActionButton";
import { faFilePdf, faTimes } from "@fortawesome/free-solid-svg-icons";
import { formatearFechaLocalizada } from "../../helpers/dateHelpers";
import { formatearMoneda } from "../../helpers/formatHelpers";

interface ModalDetallePolizaProps {
	abierto: boolean;
	poliza: PolizaGastosDTO | null;
	detalles: PolizaDetalleGastosDTO[];
	cargandoDetalles: boolean;
	onClose: () => void;
	onDescargarPdf?: (idPoliza: number) => void;
	estaDescargando?: boolean;
}

/**
 * Modal para mostrar los detalles de una póliza
 */
export default function ModalDetallePoliza({
	abierto,
	poliza,
	detalles,
	cargandoDetalles,
	onClose,
	onDescargarPdf,
	estaDescargando = false,
}: ModalDetallePolizaProps): JSX.Element {
	return (
		<Dialog open={abierto} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle>
				<div className="flex items-center justify-between">
					<span>
						Detalles de Póliza {poliza ? `#${poliza.numeroPoliza}` : ""}
					</span>
					<div className="flex gap-2">
						{poliza && onDescargarPdf && (
							<ActionButton
								icon={faFilePdf}
								text="Descargar PDF"
								variant="custom"
								customClassName="bg-red-500 text-white hover:bg-red-600"
								onClick={() => onDescargarPdf(poliza.id)}
								disabled={estaDescargando}
								isLoading={estaDescargando}
								showText={false}
							/>
						)}
						<ActionButton
							icon={faTimes}
							text="Cerrar"
							variant="cancel"
							onClick={onClose}
							showText={false}
						/>
					</div>
				</div>
			</DialogTitle>
			<DialogContent>
				{cargandoDetalles ? (
					<Loader text="Cargando detalles de la póliza..." />
				) : poliza ? (
					<div className="space-y-4">
						{/* Información general de la póliza */}
						<div className="mb-4 space-y-2">
							<p>
								<strong>Descripción:</strong> {poliza.descripcion}
							</p>
							<p>
								<strong>Fecha de Póliza:</strong>{" "}
								{formatearFechaLocalizada(poliza.fechaPoliza)}
							</p>
							<p>
								<strong>Tipo de Póliza:</strong>{" "}
								{poliza.tipoPoliza === 1
									? "Ingreso"
									: poliza.tipoPoliza === 2
									? "Egreso"
									: "Diario"}
							</p>
							<p>
								<strong>Total Cargo:</strong>{" "}
								{formatearMoneda(poliza.totalCargo)}
							</p>
							<p>
								<strong>Total Abono:</strong>{" "}
								{formatearMoneda(poliza.totalAbono)}
							</p>
						</div>

						{/* Tabla de detalles */}
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200 border border-gray-300">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
											Cuenta Contable
										</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
											Concepto
										</th>
										<th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
											Cargo
										</th>
										<th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
											Abono
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{detalles.length === 0 ? (
										<tr>
											<td colSpan={4} className="px-4 py-4 text-center text-gray-500">
												No hay detalles disponibles
											</td>
										</tr>
									) : (
										detalles.map((detalle) => (
											<tr key={detalle.id}>
												<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
													{detalle.cuentaContableString || "-"}
												</td>
												<td className="px-4 py-2 text-sm text-gray-900">
													{detalle.concepto}
												</td>
												<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
													{detalle.cargo ? formatearMoneda(detalle.cargo) : "-"}
												</td>
												<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
													{detalle.abono ? formatearMoneda(detalle.abono) : "-"}
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				) : (
					<p>No hay información disponible</p>
				)}
			</DialogContent>
		</Dialog>
	);
}

