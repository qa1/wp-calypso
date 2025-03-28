import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { areURLsUnique, isValidUrl } from 'calypso/a8c-for-agencies/components/form/utils';
import { AgencyDirectoryApplication } from '../../types';

type ValidationState = {
	services?: string;
	products?: string;
	directories?: string;
	clientSites?: string;
	feedbackUrl?: string;
};

const useExpertiseFormValidation = () => {
	const translate = useTranslate();
	const [ validationError, setValidationError ] = useState< ValidationState >( {} );

	const updateValidationError = ( newState: ValidationState ) => {
		return setValidationError( ( prev ) => ( { ...prev, ...newState } ) );
	};

	const validate = useCallback(
		( payload: AgencyDirectoryApplication ) => {
			const newValidationError: ValidationState = {};
			if ( payload.services.length < 1 ) {
				newValidationError.services = translate( "Services can't be empty" );
			}

			if ( payload.products.length < 1 ) {
				newValidationError.products = translate( "Products can't be empty" );
			}
			if ( payload.directories.length < 1 ) {
				newValidationError.directories = translate( "Directories can't be empty" );
			} else {
				payload.directories.forEach( ( directory ) => {
					if ( directory.status === 'approved' ) {
						// If the directory has already been approved. We do not need to validate the URLs
						return;
					}

					if ( directory.urls.length < 1 ) {
						newValidationError.clientSites = translate( "Client sites can't be empty" );
						return;
					}
					for ( const url of directory.urls ) {
						if ( ! isValidUrl( url ) ) {
							newValidationError.clientSites = translate( 'Please provide valid URLs' );
							return;
						}
					}
					if ( ! areURLsUnique( directory.urls ) ) {
						newValidationError.clientSites = translate( 'URLs should be unique' );
						return;
					}
				} );
			}

			if ( payload.feedbackUrl === '' ) {
				newValidationError.feedbackUrl = translate( "Feedback URL can't be empty" );
			} else if ( ! isValidUrl( payload.feedbackUrl ) ) {
				newValidationError.feedbackUrl = translate( 'Please enter a valid URL' );
			}

			if ( Object.keys( newValidationError ).length > 0 ) {
				setValidationError( newValidationError );
				return newValidationError;
			}

			return null;
		},
		[ setValidationError, translate ]
	);

	return { validate, validationError, updateValidationError };
};

export default useExpertiseFormValidation;
