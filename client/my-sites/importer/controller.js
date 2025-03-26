import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { BrowserRouter } from 'react-router-dom';
import ImporterList from 'calypso/blocks/import/list';
import { getFinalImporterUrl } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/helper';
import { decodeURIComponentIfValid } from 'calypso/lib/url';
import NewsletterImporter from 'calypso/my-sites/importer/newsletter/importer';
import SectionImport from 'calypso/my-sites/importer/section-import';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import 'calypso/blocks/import/style/base.scss';

const onboardingFlowRoute = '/setup/site-setup';

export function importSite( context, next ) {
	const state = context.store.getState();
	const engine = context.query?.engine;
	const fromSite = decodeURIComponentIfValid(
		context.query?.[ 'from-site' ] || context.query?.from
	);
	const siteSlug = getSelectedSiteSlug( state );

	const afterStartImport = () => {
		let path = context.pathname;

		if ( fromSite ) {
			path += '?from-site=' + fromSite;
		}
		if ( engine === 'substack' && config.isEnabled( 'importers/newsletter' ) ) {
			if ( fromSite ) {
				page.redirect( `/import/newsletter/substack/${ siteSlug }?from=${ fromSite }` );
				return;
			}
			page.redirect( `/import/newsletter/substack/${ siteSlug }` );
			return;
		}
		page.replace( path );
	};

	context.primary = (
		<SectionImport engine={ engine } fromSite={ fromSite } afterStartImport={ afterStartImport } />
	);
	next();
}

export function importerList( context, next ) {
	const state = context.store.getState();
	const siteSlug = getSelectedSiteSlug( state );

	context.primary = (
		<BrowserRouter>
			<div className="import__onboarding-page">
				<ImporterList
					siteSlug={ siteSlug }
					getFinalImporterUrl={ getFinalImporterUrl }
					submit={ ( { url } ) => {
						url.startsWith( 'importer' )
							? page( `${ onboardingFlowRoute }/${ url }&flow=onboarding` )
							: page( url );
					} }
					onNavBack={ () => {
						page( `/import/${ siteSlug }?flow=onboarding` );
					} }
				/>
			</div>
		</BrowserRouter>
	);
	next();
}

export function importSubstackSite( context, next ) {
	if ( ! config.isEnabled( 'importers/newsletter' ) ) {
		page.redirect( '/import' );
		return;
	}

	const state = context.store.getState();
	const siteSlug = getSelectedSiteSlug( state );
	const supportedImportSubstackSiteSteps = [
		'content',
		'subscribers',
		'paid-subscribers',
		'summary',
	];
	const step = context.params.step;

	if ( step && ! supportedImportSubstackSiteSteps.includes( step ) ) {
		page.redirect( '/import/' + siteSlug );
		return;
	}

	context.primary = (
		<BrowserRouter>
			<NewsletterImporter siteSlug={ siteSlug } engine="substack" step={ step } />
		</BrowserRouter>
	);
	next();
}
