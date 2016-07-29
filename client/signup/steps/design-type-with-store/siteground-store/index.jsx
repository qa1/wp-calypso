/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import LoggedOutForm from 'components/logged-out-form';
import FormButton from 'components/forms/form-button';
import StepHeader from 'signup/step-header';
import Button from 'components/button';

import SitegroundLogo from './siteground-logo';

export default React.createClass( {
	displayName: 'SitegroundStoreStep',

	onSubmit( event ) {
		event.preventDefault();

		window.location.href = 'https://www.siteground.com/woocommerce/step1.htm';
	},

	render() {
		return (
			<div className="siteground-store">
				<StepHeader
					headerText={ this.translate( 'Create a WordPress Store' ) }
					subHeaderText={ this.translate( 'Our partners at SiteGround and WooCommerce are here for you' ) }
				/>

				<div className="siteground-store__container">
					<div className="siteground-store__copy">
						<SitegroundLogo />
						<div className="siteground-store__text">
							{ this.translate( 'We\'ve partnered with SiteGround, a top-notch WordPress hosts with a knack for building great e-commerce stores using WooCommerce.' ) }
						</div>
					</div>

					<LoggedOutForm className="siteground-store__form" onSubmit={ this.onSubmit }>
						<span className="sitegrond-store__price-text"> { this.translate( 'Starting at' ) } </span>
						<span className="siteground-store__price"> <b>$3.95</b>/mo </span>
						<FormButton className="siteground-store__form-submit"> { this.translate( 'Create Store' ) } </FormButton>
					</LoggedOutForm>
				</div>

				<div className="siteground-store__back-button-wrapper">
					<Button compact borderless onClick={ this.props.onBackClick }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ this.translate( 'Back' ) }
					</Button>
				</div>
			</div>

		);
	}

} );
