import { type JSX, useEffect } from "react";
import { useParams, useLocation } from "react-router";
import { useTituloStore } from "../services/tituloService";
import { useNotificacionStore } from "../store/notificacionStore";
import type { UsuarioGastosDTO, PlazaEmpleadoDTO } from "../types/catalogos";
import ConfiguracionArbol from "../components/ConfiguracionArbol";

/**
 * Página para configurar el árbol de autorización de una plaza
 */
export default function ConfigurarArbol(): JSX.Element {
	const { idPlazaEmpleado, tipoArbol } = useParams<{
		idPlazaEmpleado: string;
		tipoArbol: "ejercido" | "anticipo";
	}>();
	const location = useLocation();
	const { actualizarTitulo } = useTituloStore();
	const { mostrarNotificacion } = useNotificacionStore();

	const state = location.state as {
		empleado?: UsuarioGastosDTO;
		plaza?: PlazaEmpleadoDTO;
		tipoArbol?: "ejercido" | "anticipo";
	};

	const empleado = state?.empleado;
	const plaza = state?.plaza;
	const tipoArbolState = (state?.tipoArbol || tipoArbol) as "ejercido" | "anticipo";

	useEffect(() => {
		if (empleado && plaza) {
			actualizarTitulo(
				`Configurar Árbol de Autorización ${tipoArbolState === "ejercido" ? "Ejercido" : "Anticipo"} - ${empleado.nombre} ${empleado.apellidoPaterno}`
			);
		} else {
			actualizarTitulo("Configurar Árbol de Autorización");
		}
	}, [actualizarTitulo, empleado, plaza, tipoArbolState]);

	if (!idPlazaEmpleado || !empleado || !plaza) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">Error: Faltan datos necesarios para configurar el árbol.</p>
				</div>
			</div>
		);
	}

	const handleSuccess = () => {
		mostrarNotificacion("Configuración del árbol guardada exitosamente", "success");
		// Opcional: navegar de vuelta a la página de plazas
		// navigate(`/datos-empleado/configurar-plazas/${idEmpleado}`, { state: { empleado } });
	};

	return (
		<div className="p-3 sm:p-4 lg:p-6">
			<div className="mb-4 sm:mb-6">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
					Configurar Árbol de Autorización {tipoArbolState === "ejercido" ? "Ejercido" : "Anticipo"}
				</h1>
				<p className="text-sm sm:text-base text-gray-600">
					Empleado: <strong>{empleado.nombre} {empleado.apellidoPaterno}</strong> | Plaza:{" "}
					<strong>{plaza.nombrePlaza}</strong>
				</p>
			</div>

			<ConfiguracionArbol
				idPlazaEmpleado={Number(idPlazaEmpleado)}
				nombrePlaza={plaza.nombrePlaza}
				idEmpresa={plaza.idEmpresa || 0}
				tipoArbol={tipoArbolState}
				onSuccess={handleSuccess}
			/>
		</div>
	);
}

