import page, { Context as PageJSContext } from '@automattic/calypso-router';
import { removeQueryArgs } from '@wordpress/url';
import i18n from 'i18n-calypso';
import Hosting from 'calypso/hosting/server-settings/main';
import { isRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import { PanelWithSidebar } from 'calypso/sites/components/panel-sidebar';
import { SettingsSidebar } from 'calypso/sites/settings/controller';
import { successNotice } from 'calypso/state/notices/actions';

export async function hostingConfiguration( context: PageJSContext, next: () => void ) {
	const { getState, dispatch } = context.store;

	// Update the url and show the notice after a redirect
	if ( context.query && context.query.hosting_features === 'activated' ) {
		dispatch(
			successNotice( i18n.translate( 'Hosting features activated successfully!' ), {
				displayOnNextPage: true,
			} )
		);
		// Remove query param without triggering a re-render
		window.history.replaceState(
			null,
			'',
			removeQueryArgs( window.location.href, 'hosting_features' )
		);
	}
	const isUntangled = await isRemoveDuplicateViewsExperimentEnabled( getState, dispatch );
	context.primary = isUntangled ? (
		<PanelWithSidebar>
			<SettingsSidebar />
			<div className="hosting-configuration">
				<Hosting />
			</div>
		</PanelWithSidebar>
	) : (
		<div className="hosting-configuration">
			<Hosting />
		</div>
	);
	next();
}

export async function redirectToServerSettingsIfDuplicatedView(
	context: PageJSContext,
	next: () => void
) {
	const { getState, dispatch } = context.store;
	const isUntangled = await isRemoveDuplicateViewsExperimentEnabled( getState, dispatch );
	if ( isUntangled ) {
		const siteParam = context.params.site_id;
		return page.redirect( `/sites/settings/server/${ siteParam }` );
	}
	next();
}
