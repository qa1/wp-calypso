import { __experimentalNumberControl as NumberControl } from '@wordpress/components';

import './style.scss';

type Props = {
	value: number;
	onChange: ( value: number ) => void;
	minimum?: number;
	maximum?: number;
	increment?: number;
};

export default function A4ANumberInputV2( {
	value,
	onChange,
	minimum = 1,
	maximum,
	increment = 1,
}: Props ) {
	const handleOnChange = ( newValue: unknown ) => {
		// Force convert to number, if NaN use minimum
		const numberValue = Number( newValue ) || minimum;
		onChange( numberValue );
	};

	return (
		<NumberControl
			className="a4a-number-input-v2"
			__next40pxDefaultSize
			isShiftStepEnabled
			min={ minimum }
			max={ maximum }
			step={ increment }
			value={ value }
			onChange={ handleOnChange }
			spinControls="custom"
		/>
	);
}
