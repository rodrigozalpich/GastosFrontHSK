import { type JSX, useState, useEffect } from "react";

interface IconoSVGProps {
	src: string;
	alt: string;
	className?: string;
}

/**
 * Componente que renderiza un SVG inline desde una ruta
 * Permite cambiar el color del SVG usando CSS (currentColor)
 */
export default function IconoSVG({
	src,
	alt,
	className = "",
}: IconoSVGProps): JSX.Element {
	const [svgContent, setSvgContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Cargar el SVG como texto
		fetch(src)
			.then((res) => res.text())
			.then((text) => {
				// Reemplazar colores hardcodeados por currentColor
				// PERO preservar stroke-width y otros atributos
				let modifiedSvg = text;
				
				// Solo reemplazar stroke si tiene un color (no tocar stroke-width)
				modifiedSvg = modifiedSvg.replace(
					/stroke="[^"]*"/g,
					(match) => {
						// Si es un color (hex, rgb, etc), reemplazarlo por currentColor
						if (match.match(/stroke="(#[0-9A-Fa-f]{3,6}|rgb|rgba|currentColor)"/)) {
							return 'stroke="currentColor"';
						}
						return match; // Mantener otros valores de stroke
					}
				);
				
				// Solo reemplazar fill si tiene un color
				modifiedSvg = modifiedSvg.replace(
					/fill="[^"]*"/g,
					(match) => {
						// Si es fill="none", mantenerlo
						if (match === 'fill="none"') {
							return match;
						}
						// Cualquier otro valor de fill (colores hex, rgb, nombres de colores, etc) 
						// reemplazarlo por currentColor
						return 'fill="currentColor"';
					}
				);
				
				// Agregar vector-effect="non-scaling-stroke" a todos los paths
				// para preservar el stroke-width original cuando el SVG se escala
				modifiedSvg = modifiedSvg.replace(
					/<path([^>]*)>/g,
					(match, attrs) => {
						// Si ya tiene vector-effect, no hacer nada
						if (attrs.includes('vector-effect=')) {
							return match;
						}
						// Agregar vector-effect="non-scaling-stroke" si el path tiene stroke
						if (attrs.includes('stroke=')) {
							return `<path${attrs} vector-effect="non-scaling-stroke">`;
						}
						return match;
					}
				);
				
				// Extraer dimensiones originales del SVG
				const widthMatch = modifiedSvg.match(/width="([^"]*)"/);
				const heightMatch = modifiedSvg.match(/height="([^"]*)"/);
				const viewBoxMatch = modifiedSvg.match(/viewBox="([^"]*)"/);
				
				// Asegurar que el SVG tenga width y height explícitos
				if (!widthMatch || !heightMatch) {
					if (viewBoxMatch) {
						const [, viewBox] = viewBoxMatch;
						const [, , width, height] = viewBox.split(/\s+/);
						if (width && height && !widthMatch) {
							modifiedSvg = modifiedSvg.replace(
								/<svg/,
								`<svg width="${width}" height="${height}"`
							);
						}
					}
				}
				
				// Agregar style para que el SVG se ajuste al contenedor
				modifiedSvg = modifiedSvg.replace(
					/<svg([^>]*)>/,
					(match, attrs) => {
						// Agregar style para que el SVG se ajuste al contenedor
						const style = 'display: inline-block; vertical-align: middle; width: 100%; height: 100%;';
						
						// Si ya tiene style, combinarlo
						if (attrs.includes('style=')) {
							return match.replace(
								/style="([^"]*)"/,
								`style="$1; ${style}"`
							);
						}
						
						// Agregar style si no existe
						return `<svg${attrs} style="${style}">`;
					}
				);
				
				setSvgContent(modifiedSvg);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error(`Error cargando SVG: ${src}`, error);
				setIsLoading(false);
			});
	}, [src]);

	if (isLoading) {
		return <div className={`w-4 h-4 ${className}`} />;
	}

	// Extraer clases de color de className para aplicarlas directamente
	const colorClasses = className.split(' ').filter(cls => 
		cls.startsWith('text-') || cls.startsWith('group-hover:')
	).join(' ');

	return (
		<span
			className={`inline-flex items-center justify-center ${className}`}
			style={{ lineHeight: 0, flexShrink: 0 }}
		>
			<span
				dangerouslySetInnerHTML={{ __html: svgContent }}
				aria-label={alt}
				className={`block ${colorClasses || className}`}
				style={{ width: '100%', height: '100%' }}
			/>
		</span>
	);
}

