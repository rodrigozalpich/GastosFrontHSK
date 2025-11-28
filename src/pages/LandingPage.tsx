import { type JSX, useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ROUTES } from "../config/routes.config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

/**
 * Componente de página de inicio (Landing Page).
 * Implementa un carrusel de imágenes con auto-play y navegación manual.
 *
 * @returns {JSX.Element} El componente de landing page.
 */
export default function LandingPage(): JSX.Element {
	const slides: string[] = [
		"/assets/LOGOSRFACIL_CONSLOGAN.svg",
		"/assets/LOGOSRFACIL_CONSLOGAN.svg",
		"/assets/LOGOSRFACIL_CONSLOGAN.svg",
	];

	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const intervalRef = useRef<number | null>(null);

	useEffect(() => {
		// Auto-play: cambiar slide cada 4.5 segundos
		intervalRef.current = window.setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
		}, 4500);

		// Limpiar intervalo al desmontar
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [slides.length]);

	const prevSlide = () => {
		setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
		// Reiniciar auto-play después de navegación manual
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
		intervalRef.current = window.setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
		}, 4500);
	};

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
		// Reiniciar auto-play después de navegación manual
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
		intervalRef.current = window.setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
		}, 4500);
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-[#fafafa] px-4 py-8 sm:px-6 lg:px-8">
			<div className="relative w-full max-w-4xl overflow-hidden">
				{/* Carrusel */}
				<div
					className="flex transition-transform duration-500 ease-in-out"
					style={{ transform: `translateX(-${currentIndex * 100}%)` }}
				>
					{slides.map((slide, index) => (
						<div key={index} className="w-full flex-shrink-0 px-2 sm:px-4">
							<img
								src={slide}
								className="w-full max-w-[700px] mx-auto object-contain rounded-lg shadow-md"
								alt={`Slide ${index + 1}`}
							/>
						</div>
					))}
				</div>

				{/* Botón Anterior */}
				<button
					onClick={prevSlide}
					className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-white p-2 sm:p-3 rounded-full shadow hover:bg-gray-200 transition-colors z-10"
					aria-label="Slide anterior"
				>
					<FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
				</button>

				{/* Botón Siguiente */}
				<button
					onClick={nextSlide}
					className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-white p-2 sm:p-3 rounded-full shadow hover:bg-gray-200 transition-colors z-10"
					aria-label="Slide siguiente"
				>
					<FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
				</button>
			</div>

			{/* Botón de Login */}
			<div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-xs px-4">
				<Link
					to={ROUTES.LOGIN}
					className="inline-block w-full text-center px-6 sm:px-8 py-2 sm:py-3 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors font-medium text-base sm:text-lg shadow-lg"
				>
					Iniciar Sesión
				</Link>
			</div>
		</div>
	);
}
