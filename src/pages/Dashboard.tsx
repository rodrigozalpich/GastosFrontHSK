import { type JSX, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router";
import { ROUTES } from "../config/routes.config";
import { useTituloStore } from "../services/tituloService";

/**
 * Componente Dashboard - Página principal después del login
 * Muestra información resumida y acceso rápido a las funcionalidades principales
 *
 * @returns {JSX.Element} El componente Dashboard
 */
export default function Dashboard(): JSX.Element {
	const { permisosEspeciales, empresaActivaId, empresaSeccionActividades, obtenerIdEmpresa } = useAuthStore();
	const { actualizarTitulo } = useTituloStore();
	const nombreCompleto = permisosEspeciales?.nombreCompleto || permisosEspeciales?.Username || "Usuario";
	const navigate = useNavigate();
	const idEmpresa = obtenerIdEmpresa();

	// Actualizar título al montar
	useEffect(() => {
		actualizarTitulo("Dashboard");
	}, [actualizarTitulo]);

	const empresaActiva = empresaActivaId
		? empresaSeccionActividades?.[empresaActivaId]
		: null;

	return (
		<div className="min-h-screen bg-gray-50 p-4 sm:p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 wrap-break-word">
						Bienvenido, {nombreCompleto}
					</h1>
					{empresaActiva ? (
						<p className="text-sm sm:text-base lg:text-lg text-gray-600 wrap-break-word">
							Empresa: {empresaActiva.nombreEmpresa}
						</p>
					) : idEmpresa ? (
						<p className="text-sm sm:text-base lg:text-lg text-gray-600">
							Empresa ID: {idEmpresa}
						</p>
					) : (
						<p className="text-sm sm:text-base lg:text-lg text-yellow-600">
							⚠️ No hay empresa activa seleccionada
						</p>
					)}
				</div>

				{/* Cards de acceso rápido */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					{/* Card: Mis Gastos */}
					<div
						className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow"
						onClick={() => navigate(ROUTES.GASTOS_MIS_GASTOS)}
					>
						<div className="flex items-center mb-3 sm:mb-4">
							<div className="bg-orange-100 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shrink-0">
								<svg
									className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900">Mis Gastos</h3>
						</div>
						<p className="text-sm sm:text-base text-gray-600">
							Consulta y gestiona tus gastos personales
						</p>
					</div>

					{/* Card: Gestión de Gastos */}
					<div
						className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow"
						onClick={() => navigate(ROUTES.GASTOS_LISTADO)}
					>
						<div className="flex items-center mb-3 sm:mb-4">
							<div className="bg-blue-100 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shrink-0">
								<svg
									className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900">
								Gestión de Gastos
							</h3>
						</div>
						<p className="text-sm sm:text-base text-gray-600">
							Administra todos los gastos de la empresa
						</p>
					</div>

					{/* Card: Gastos por Autorizar */}
					<div
						className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow"
						onClick={() => navigate(ROUTES.GASTOS_POR_AUTORIZAR)}
					>
						<div className="flex items-center mb-3 sm:mb-4">
							<div className="bg-green-100 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shrink-0">
								<svg
									className="w-6 h-6 sm:w-8 sm:h-8 text-green-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900">
								Por Autorizar
							</h3>
						</div>
						<p className="text-sm sm:text-base text-gray-600">
							Revisa y autoriza gastos pendientes
						</p>
					</div>

					{/* Card: Gastos Autorizados */}
					<div
						className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow"
						onClick={() => navigate(ROUTES.GASTOS_AUTORIZADOS)}
					>
						<div className="flex items-center mb-3 sm:mb-4">
							<div className="bg-purple-100 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shrink-0">
								<svg
									className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900">
								Gastos Autorizados
							</h3>
						</div>
						<p className="text-sm sm:text-base text-gray-600">
							Consulta los gastos que han sido autorizados
						</p>
					</div>

					{/* Card: Gastos por Pagar */}
					<div
						className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow"
						onClick={() => navigate(ROUTES.GASTOS_POR_PAGAR)}
					>
						<div className="flex items-center mb-3 sm:mb-4">
							<div className="bg-yellow-100 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shrink-0">
								<svg
									className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900">
								Por Pagar
							</h3>
						</div>
						<p className="text-sm sm:text-base text-gray-600">
							Gestiona los pagos pendientes
						</p>
					</div>

					{/* Card: Pólizas */}
					<div
						className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow"
						onClick={() => navigate(ROUTES.POLIZAS)}
					>
						<div className="flex items-center mb-3 sm:mb-4">
							<div className="bg-indigo-100 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shrink-0">
								<svg
									className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900">Pólizas</h3>
						</div>
						<p className="text-sm sm:text-base text-gray-600">
							Consulta y gestiona las pólizas contables
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
