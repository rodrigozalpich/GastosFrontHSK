import { type JSX, useEffect, useMemo, useState } from "react";
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from "material-react-table";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { gastoService } from "../../services/gastoService";
import { useAuthStore } from "../../store/authStore";
import Loader from "../Loader";
import { MRT_Localization_ES } from "../../config/mrtLocalization";
import type {
	ArchivoComprobacionDTO,
	ConceptoGastosDTO,
	ConceptoImpuestosGastosDTO,
} from "../../types/gastos";
import { formatearMoneda } from "../../helpers/formatHelpers";
import TableActionButton from "../TableActionButton";
import { ICONOS_ACCIONES } from "../../config/iconosAcciones";
import { Box, Typography, Table, TableCell, TableRow } from "@mui/material";
import IconoSVG from "../IconoSVG";

interface TablaDetalleFacturaProps {
	archivo: ArchivoComprobacionDTO;
	onClose: () => void;
}

/**
 * Modal que muestra los elementos (conceptos) de una factura
 * Similar a TablaDetalleFactura.tsx del proyecto de referencia
 */
export default function TablaDetalleFactura({
	archivo,
	onClose,
}: TablaDetalleFacturaProps): JSX.Element {
	const { obtenerIdEmpresa } = useAuthStore();
	const idEmpresa = obtenerIdEmpresa();

	// Obtener conceptos del archivo
	const {
		data: conceptos,
		isLoading,
		isFetching,
		error,
	} = useQuery<ConceptoGastosDTO[]>({
		queryKey: ["conceptosFactura", archivo.id, idEmpresa],
		queryFn: async () => {
			if (!archivo.id || !idEmpresa) {
				throw new Error("Faltan datos de archivo o empresa");
			}
			return await gastoService.obtenerConceptosxidArchivo(
				archivo.id,
				idEmpresa
			);
		},
		enabled: !!archivo.id && !!idEmpresa,
		staleTime: 1000 * 60,
	});

	useEffect(() => {
		if (error) {
			console.error("Error al obtener conceptos de factura:", error);
		}
	}, [error]);

	const conceptosData = conceptos ?? [];

	// Definir columnas
	const columns = useMemo<MRT_ColumnDef<ConceptoGastosDTO>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Ver impuesto",
				size: 120,
				Cell: ({ row }) => {
					const tieneImpuestos =
						row.original.listaImpuestos &&
						row.original.listaImpuestos.length > 0;
					return (
						<div className="flex justify-center">
							{tieneImpuestos && (
								<span className="px-2 py-1 rounded bg-[#0284C7] hover:bg-[#075985] text-white transition-colors inline-flex items-center">
									<IconoSVG
										src={ICONOS_ACCIONES.ver}
										alt="Ver impuesto"
										className="w-5 h-5"
									/>
								</span>
							)}
						</div>
					);
				},
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
				accessorKey: "descripcion",
				header: "Nombre",
				size: 200,
			},
			{
				accessorKey: "codigoSAT",
				header: "Código SAT",
				size: 150,
			},
			{
				accessorKey: "cantidad",
				header: "Cantidad",
				size: 120,
				Cell: ({ cell }) => {
					const valor = cell.getValue<number>();
					return valor.toFixed(3);
				},
			},
			{
				accessorKey: "importe",
				header: "Importe",
				size: 120,
				Cell: ({ cell }) => {
					const valor = cell.getValue<number>();
					return formatearMoneda(valor);
				},
			},
			{
				accessorKey: "impuestos",
				header: "Impuesto",
				size: 120,
				Cell: ({ cell }) => {
					const valor = cell.getValue<number>();
					return formatearMoneda(valor);
				},
			},
			{
				accessorKey: "total",
				header: "Total",
				size: 120,
				Cell: ({ cell }) => {
					const valor = cell.getValue<number>();
					return formatearMoneda(valor);
				},
			},
			{
				accessorKey: "montoAceptado",
				header: "Aceptado",
				size: 120,
				Cell: ({ cell }) => {
					const valor = cell.getValue<number>();
					return formatearMoneda(valor);
				},
			},
		],
		[]
	);

	// Configurar la tabla
	const table = useMaterialReactTable({
		columns,
		data: conceptosData,
		enableColumnFilters: false,
		enableGlobalFilter: false,
		enablePagination: true,
		enableSorting: false,
		enableRowSelection: false,
		enableDensityToggle: false,
		enableFullScreenToggle: false,
		enableColumnResizing: false,
		enableExpandAll: false,
		getRowCanExpand: (row) => {
			return (
				row.original.listaImpuestos &&
				row.original.listaImpuestos.length > 0
			);
		},
		initialState: {
			pagination: { pageSize: 10, pageIndex: 0 },
			density: "comfortable",
		},
		autoResetPageIndex: false,
		localization: MRT_Localization_ES,
		muiTableContainerProps: {
			sx: {
				maxHeight: "500px",
			},
		},
		muiTableHeadCellProps: {
			sx: {
				backgroundColor: "#bae6fd",
				color: "#082F49",
				fontWeight: "bold",
			},
		},
		muiTableBodyCellProps: {
			sx: {
				backgroundColor: "#082F49",
				color: "#ffffff",
			},
		},
		muiTableBodyRowProps: {
			sx: {
				"&:hover": {
					backgroundColor: "#075985",
				},
			},
		},
		muiDetailPanelProps: () => ({
			sx: {
				backgroundColor: "#f0f9ff",
				padding: "16px",
			},
		}),
		renderDetailPanel: ({ row }) => {
			if (
				!row.original.listaImpuestos ||
				row.original.listaImpuestos.length === 0
			) {
				return null;
			}

			return (
				<Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
					<Typography
						variant="h6"
						className="text-center bg-[#0284C7] text-white p-2 rounded"
					>
						Detalle de Impuestos
					</Typography>
					{row.original.listaImpuestos.map((impuesto) => (
						<Box
							key={impuesto.id}
							sx={{
								pl: 2,
								borderLeft: "2px solid #0284C7",
								my: 1,
								backgroundColor: "#f0f9ff",
								padding: "12px",
								borderRadius: "4px",
							}}
						>
							<Table>
								<TableRow>
									<TableCell>
										<strong className="text-[#082F49]">Impuesto:</strong>
									</TableCell>
									<TableCell>
										<Typography variant="body2" className="text-[#082F49]">
											{impuesto.tipoFactor} (
											{impuesto.esTraslado ? "Trasladado" : "Retenido"})
										</Typography>
									</TableCell>
									<TableCell>
										<strong className="text-[#082F49]">Importe: </strong>
									</TableCell>
									<TableCell>
										<Typography variant="body2" className="text-[#082F49]">
											{formatearMoneda(impuesto.importe)}
										</Typography>
									</TableCell>
								</TableRow>
							</Table>
						</Box>
					))}
				</Box>
			);
		},
	});

	if (isLoading || (isFetching && conceptosData.length === 0)) {
		return (
			<Dialog
				open={true}
				onClose={onClose}
				maxWidth="md"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: "12px",
					},
				}}
			>
				<DialogContent>
					<Loader text="Cargando detalles de la factura..." />
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog
			open={true}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: "12px",
					maxHeight: "90vh",
				},
			}}
		>
			<DialogTitle
				sx={{
					backgroundColor: "#082F49",
					color: "#ffffff",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "16px 24px",
				}}
			>
				<div className="flex items-center gap-2">
					<IconoSVG
						src={ICONOS_ACCIONES.ver}
						alt="Elementos"
						className="w-6 h-6 text-white"
					/>
					<span>Elementos de la factura</span>
				</div>
				<IconButton
					onClick={onClose}
					sx={{
						color: "#ffffff",
						"&:hover": {
							backgroundColor: "#075985",
						},
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent sx={{ padding: 0 }}>
				<div className="p-4">
					<MaterialReactTable table={table} />
					<div className="flex justify-center items-center my-5">
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-2 bg-[#0284C7] hover:bg-[#075985] text-white rounded-lg transition-colors font-semibold"
						>
							Cerrar
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

