import { useLayoutEffect, useState } from '@wordpress/element';

interface Props {
	containerRef: React.MutableRefObject< HTMLDivElement | null >;
	/**
	 * Labelled breakpoints a la "container query".
	 * These are currently observed manually (i.e. we do not use container queries),
	 * but they could be used in the future in a containment context.
	 * The keys are the labels, the values are the minimum widths.
	 */
	containerBreakpoints: Map< string, number >;
}

/**
 * useGridSize returns the current grid size based on the width of the container
 * and the breakpoints passed through as props.
 */
export default function useGridSize( { containerRef, containerBreakpoints }: Props ) {
	const [ gridSize, setGridSize ] = useState< string | null >( null );

	useLayoutEffect( () => {
		if ( ! containerRef.current ) {
			return;
		}

		const observer = new ResizeObserver( ( [ entry ] ) => {
			const { width } = entry.contentRect;

			if ( width ) {
				for ( const [ key, value ] of [ ...containerBreakpoints ].reverse() ) {
					if ( width >= value ) {
						setGridSize( key );
						break;
					}
				}
			}
		} );

		observer.observe( containerRef.current );

		return () => observer.disconnect();
	}, [ containerRef, containerBreakpoints ] );

	return gridSize;
}
