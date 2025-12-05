import { type JSX, lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import RutaProtegida from "./helpers/RutaProtegida";
import RutaPublica from "./helpers/RutaPublica";
import GlobalSnackbar from "./components/GlobalSnackbar.tsx";
import Loader from "./components/Loader.tsx";
import Header from "./components/Header.tsx";
import Sidebar from "./components/Sidebar.tsx";
import { ROUTES, PERMISSIONS } from "./config/routes.config.ts";
import RutaAutorizador from "./helpers/RutaAutorizador.tsx";
import { useAuthStore } from "./store/authStore";
import { useSidenavStore } from "./store/sidenavStore";
import { GestionDeSesion } from "./helpers/GestionDeSesion.tsx";

const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ListadoGastos = lazy(() => import("./pages/gastos/ListadoGastos"));
const MisGastos = lazy(() => import("./pages/gastos/MisGastos"));
const GastosPorAutorizar = lazy(() => import("./pages/gastos/GastosPorAutorizar"));
const GastosAutorizados = lazy(() => import("./pages/gastos/GastosAutorizados"));
const GastosPorPagar = lazy(() => import("./pages/gastos/GastosPorPagar"));
const CentroCostos = lazy(() => import("./pages/catalogos/CentroCostos"));
const CuentaContable = lazy(() => import("./pages/catalogos/CuentaContable"));
const Plazas = lazy(() => import("./pages/catalogos/Plazas"));
const Division = lazy(() => import("./pages/catalogos/Division"));
const ClaveProducto = lazy(() => import("./pages/catalogos/ClaveProducto"));
const Polizas = lazy(() => import("./pages/Polizas"));
const ConfigParametros = lazy(() => import("./pages/ConfigParametros"));
const Timbrado = lazy(() => import("./pages/Timbrado"));
const Analytics = lazy(() => import("./pages/Analytics"));
const DatosEmpleado = lazy(() => import("./pages/DatosEmpleado"));
const ConfigurarPlazas = lazy(() => import("./pages/ConfigurarPlazas"));
const ConfigurarArbol = lazy(() => import("./pages/ConfigurarArbol"));

/**
 * El componente principal de la aplicación que define la estructura de enrutamiento.
 * Utiliza `react-router` para gestionar las rutas de la aplicación.
 *
 * - Las rutas públicas como `/login` están envueltas en el componente `RutaPublica`.
 * - Las rutas que requieren autenticación están anidadas dentro del componente `RutaProtegida`.
 * - También renderiza el `GlobalSnackbar` para mostrar notificaciones en toda la aplicación.
 *
 * @returns {JSX.Element} El componente de la aplicación con las rutas definidas.
 */
function App(): JSX.Element {
	const estaLogueado = useAuthStore((state) => state.estaLogueado);
	const sideNavState = useSidenavStore((state) => state.sideNavState);

	return (
		<>
			{/* Gestor de sesión - Monitorea la expiración del token y cierra sesión automáticamente */}
			<GestionDeSesion />

			{/* Sidebar y Header solo se muestran cuando el usuario está logueado */}
			{estaLogueado && (
				<>
					<Sidebar />
					<Header />
				</>
			)}

			{/* Contenido principal con margen para el sidebar y header */}
			<div
				className={`min-h-screen transition-all duration-300 ease-in-out ${
					estaLogueado
						? sideNavState
							? "ml-0 lg:ml-64 xl:ml-72 pt-14 sm:pt-16"
							: "ml-0 pt-14 sm:pt-16"
						: ""
				}`}
			>
				<Suspense fallback={<Loader text="Espere..." />}>
					<Routes>
						{/* Rutas públicas */}
						<Route
							path="/"
							element={
								<RutaPublica>
									<LandingPage />
								</RutaPublica>
							}
						/>
						<Route
							path={ROUTES.LOGIN}
							element={
								<RutaPublica>
									<Login />
								</RutaPublica>
							}
						/>

						{/* Rutas protegidas - Dashboard (sin permisos específicos, solo requiere login) */}
						<Route element={<RutaProtegida />}>
							<Route
								path={ROUTES.DASHBOARD}
								element={<Dashboard />}
							/>
						</Route>

						{/* Rutas protegidas - Gestión de Gastos */}
						<Route
							element={
								<RutaProtegida
									allowedPermissions={[PERMISSIONS.SECCION_GASTOS]}
								/>
							}
						>
							<Route
								path={ROUTES.GASTOS_LISTADO}
								element={<ListadoGastos />}
							/>
							<Route
								path={ROUTES.GASTOS_MIS_GASTOS}
								element={<MisGastos />}
							/>
							<Route element={<RutaAutorizador />}>
								<Route
									path={ROUTES.GASTOS_POR_AUTORIZAR}
									element={<GastosPorAutorizar />}
								/>
							</Route>
							<Route
								path={ROUTES.GASTOS_AUTORIZADOS}
								element={<GastosAutorizados />}
							/>
							<Route
								path={ROUTES.GASTOS_POR_PAGAR}
								element={<GastosPorPagar />}
							/>
						</Route>

						{/* Rutas protegidas - Catálogos */}
						<Route
							element={
								<RutaProtegida
									allowedPermissions={[PERMISSIONS.SECCION_CENTRO_COSTOS]}
								/>
							}
						>
							<Route
								path={ROUTES.CATALOGOS_CENTROS_COSTOS}
								element={<CentroCostos />}
							/>
						</Route>
						{/* Ruta alternativa para compatibilidad con menú antiguo */}
						<Route
							element={
								<RutaProtegida
									allowedPermissions={[PERMISSIONS.SECCION_CENTRO_COSTOS]}
								/>
							}
						>
							<Route
								path="/centro-costos"
								element={<CentroCostos />}
							/>
						</Route>
						<Route
							element={
								<RutaProtegida
									allowedPermissions={[PERMISSIONS.SECCION_CUENTA_CONTABLE]}
								/>
							}
						>
							<Route
								path={ROUTES.CATALOGOS_CUENTAS_CONTABLES}
								element={<CuentaContable />}
							/>
						</Route>
						<Route
							element={
								<RutaProtegida
									allowedPermissions={[PERMISSIONS.SECCION_PLAZAS]}
								/>
							}
						>
							<Route
								path={ROUTES.CATALOGOS_PLAZAS}
								element={<Plazas />}
							/>
						</Route>
						<Route
							element={
								<RutaProtegida
									allowedPermissions={[PERMISSIONS.SECCION_DIVISION]}
								/>
							}
						>
							<Route
								path={ROUTES.CATALOGOS_DIVISION}
								element={<Division />}
							/>
						</Route>
						<Route
							element={
								<RutaProtegida
									allowedPermissions={[PERMISSIONS.SECCION_CLAVES_PRODUCTO]}
								/>
							}
						>
							<Route
								path={ROUTES.CATALOGOS_CLAVES_PRODUCTO}
								element={<ClaveProducto />}
							/>
						</Route>

						{/* Rutas protegidas - Pólizas */}
						<Route
							element={
								<RutaProtegida
									allowedPermissions={[PERMISSIONS.SECCION_POLIZAS]}
								/>
							}
						>
							<Route
								path={ROUTES.POLIZAS}
								element={<Polizas />}
							/>
						</Route>

						{/* Rutas protegidas - Parámetros de Gastos */}
						<Route
							element={
								<RutaProtegida
									allowedPermissions={[PERMISSIONS.SECCION_PARAMETROS_GASTOS]}
								/>
							}
						>
							<Route
								path={ROUTES.CONFIG_PARAMETROS}
								element={<ConfigParametros />}
							/>
						</Route>

						{/* Rutas protegidas - Timbrado de Gastos */}
						<Route
							element={
								<RutaProtegida
									allowedPermissions={[PERMISSIONS.SECCION_TIMBRADO]}
								/>
							}
						>
							<Route
								path={ROUTES.TIMBRADO_DE_GASTOS}
								element={<Timbrado />}
							/>
						</Route>

						{/* Rutas protegidas - Analytics */}
						<Route
							element={
								<RutaProtegida
									allowedPermissions={[PERMISSIONS.SECCION_ANALYTICS]}
								/>
							}
						>
							<Route
								path={ROUTES.ANALYTICS}
								element={<Analytics />}
							/>
						</Route>

						{/* Rutas protegidas - Datos del Empleado */}
						<Route
							element={
								<RutaProtegida
									allowedPermissions={[PERMISSIONS.SECCION_DATOS_EMPLEADO]}
								/>
							}
						>
							<Route
								path={ROUTES.DATOS_EMPLEADO}
								element={<DatosEmpleado />}
							/>
							<Route
								path={ROUTES.CONFIGURAR_PLAZAS}
								element={<ConfigurarPlazas />}
							/>
							<Route
								path={ROUTES.CONFIGURAR_ARBOL}
								element={<ConfigurarArbol />}
							/>
						</Route>

						{/* Ruta 404 */}
						<Route
							path="*"
							element={<NotFound />}
						/>
					</Routes>
				</Suspense>
			</div>

			<GlobalSnackbar />
		</>
	);
}

export default App;
