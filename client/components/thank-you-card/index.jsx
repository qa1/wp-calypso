import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import './style.scss';

// Non standard gridicon sizes are used here because we use them as background pattern with various sizes and rotation
/* eslint-disable wpcalypso/jsx-gridicon-size */

const ThankYouCard = ( {
	heading,
	description,
	descriptionWithHTML,
	buttonUrl,
	buttonText,
	name,
	icon,
	action,
} ) => {
	const renderAction = () => {
		if ( action ) {
			return action;
		}

		return (
			<a
				className={ clsx( 'thank-you-card__button', { 'is-placeholder': ! buttonUrl } ) }
				href={ buttonUrl }
			>
				{ buttonText }
			</a>
		);
	};

	return (
		<div className="thank-you-card">
			<div className="thank-you-card__header">
				{ icon ? (
					<div className="thank-you-card__main-icon">{ icon }</div>
				) : (
					<Gridicon className="thank-you-card__main-icon" icon="checkmark-circle" size={ 140 } />
				) }

				<div className="thank-you-card__header-detail">
					<div className={ clsx( 'thank-you-card__name', { 'is-placeholder': ! name } ) }>
						{ name }
					</div>
				</div>

				<div className="thank-you-card__background-icons">
					<Gridicon icon="audio" size={ 52 } />
					<Gridicon icon="audio" size={ 20 } />
					<Gridicon icon="heart" size={ 52 } />
					<Gridicon icon="heart" size={ 41 } />
					<Gridicon icon="star" size={ 26 } />
					<Gridicon icon="status" size={ 52 } />
					<Gridicon icon="audio" size={ 38 } />
					<Gridicon icon="status" size={ 28 } />
					<Gridicon icon="status" size={ 65 } />
					<Gridicon icon="star" size={ 57 } />
					<Gridicon icon="star" size={ 33 } />
					<Gridicon icon="star" size={ 45 } />
				</div>
			</div>
			<div className="thank-you-card__body">
				<div className="thank-you-card__heading">{ heading }</div>
				<div className="thank-you-card__description">
					{ description }
					{ descriptionWithHTML }
				</div>

				<div className="thank-you-card__action">{ renderAction() }</div>
			</div>
		</div>
	);
};
/* eslint-enable wpcalypso/jsx-gridicon-size */

ThankYouCard.propTypes = {
	buttonText: PropTypes.string,
	buttonUrl: PropTypes.string,
	description: PropTypes.string | PropTypes.node,
	descriptionWithHTML: PropTypes.object,
	heading: PropTypes.string,
	name: PropTypes.string | PropTypes.node,
	icon: PropTypes.node,
	action: PropTypes.node,
};

export default ThankYouCard;
