/**
 * @jest-environment jsdom
 */
import React from 'react';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import { useHostingProviderUrlDetails } from 'calypso/data/site-profiler/use-hosting-provider-url-details';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationInstructions from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';
import { Sidebar } from '../sidebar';
import { SitePreview } from '../site-preview';

jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/data/site-migration/use-migration-sticker' );
jest.mock( 'calypso/data/site-profiler/use-hosting-provider-url-details' );
( useMigrationStickerMutation as jest.Mock ).mockReturnValue( {
	deleteMigrationSticker: jest.fn(),
} );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 123,
} );

// Mock the hooks and components
jest.mock( '../sidebar' );
jest.mock( '../site-preview' );

jest.mock( 'calypso/lib/analytics/tracks', () => {
	return {
		recordTracksEvent: jest.fn(),
	};
} );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 123,
} );

const render = ( props?: Partial< StepProps > ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationInstructions { ...combinedProps } /> );
};

( useMigrationStickerMutation as jest.Mock ).mockReturnValue( {
	deleteMigrationSticker: jest.fn(),
} );

( Sidebar as jest.Mock ).mockImplementation( () => <div>Sidebar Component</div> );
( SitePreview as jest.Mock ).mockImplementation( () => <div>SitePreview Component</div> );

describe( 'SiteMigrationInstructions', () => {
	it.each( [
		{ hostingName: 'WP Engine', isUnknown: false, isA8c: false, expected: true },
		{ hostingName: 'WordPress.com', isUnknown: false, isA8c: true, expected: false },
		{ hostingName: 'Unknown', isUnknown: true, isA8c: false, expected: false },
	] )(
		'renders the hosting badge only when the hosting is known and not A8C',
		async ( { hostingName, isUnknown, isA8c, expected } ) => {
			( useHostingProviderUrlDetails as jest.Mock ).mockReturnValue( {
				data: {
					name: hostingName,
					is_unknown: isUnknown,
					is_a8c: isA8c,
				},
			} );

			const { queryByText } = render();

			const maybeExpect = ( arg, exp ) => ( exp ? expect( arg ) : expect( arg ).not );
			maybeExpect( queryByText( `Hosted with ${ hostingName }` ), expected ).toBeInTheDocument();
		}
	);

	it( 'calls deleteMigrationSticker on mount', () => {
		const { deleteMigrationSticker } = useMigrationStickerMutation();

		render();

		expect( deleteMigrationSticker ).toHaveBeenCalledWith( 123 );
	} );
} );
