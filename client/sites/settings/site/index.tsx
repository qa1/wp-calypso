import { useTranslate } from 'i18n-calypso';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel } from 'calypso/components/panel';
import { SOURCE_SETTINGS_ADMINISTRATION } from 'calypso/my-sites/site-settings/site-tools/utils';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import AdministrationTools from 'calypso/sites/settings/administration/tools';
import { useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import getIsUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { getSiteOption, isJetpackSite, isWpcomSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import SiteSettingsForm from './form';

import './style.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SiteSettings( props: any ) {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteId = useSelector( getSelectedSiteId );
	const siteIsJetpack = useSelectedSiteSelector( isJetpackSite );
	const isUnlaunchedSite = useSelectedSiteSelector( getIsUnlaunchedSite );
	const editingToolkitIsActive = useSelectedSiteSelector(
		getSiteOption,
		'editing_toolkit_is_active'
	);
	const isAtomic = useSelectedSiteSelector( isAtomicSite );
	const isAtomicAndEditingToolkitDeactivated = isAtomic && editingToolkitIsActive === false;
	const siteIsWpcom = useSelectedSiteSelector( isWpcomSite );
	const isWpcomStagingSite = useSelectedSiteSelector( isSiteWpcomStaging );

	const additionalProps = {
		site,
		siteIsJetpack,
		siteIsWpcom,
		isUnlaunchedSite,
		isAtomicAndEditingToolkitDeactivated,
		isWpcomStagingSite,
	};

	return (
		<Panel className="settings-site">
			<NavigationHeader
				title={ translate( 'General settings' ) }
				subtitle={ translate( 'Manage your site settings, including site visibility, and more.' ) }
			/>
			<SiteSettingsForm { ...props } { ...additionalProps } />
			{ ! isWpcomStagingSite && (
				<>
					<QuerySitePurchases siteId={ siteId } />
					<AdministrationTools source={ SOURCE_SETTINGS_ADMINISTRATION } />
				</>
			) }
		</Panel>
	);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFormSettings = ( settings: any ) => {
	const defaultSettings = {
		blog_public: '',
		jetpack_holiday_snow_enabled: false,
		wpcom_coming_soon: '',
		wpcom_data_sharing_opt_out: false,
		wpcom_legacy_contact: '',
		wpcom_locked_mode: false,
		wpcom_public_coming_soon: '',
		wpcom_gifting_subscription: false,
		wpcom_hide_action_bar: false,
		is_fully_managed_agency_site: true,
	};

	if ( ! settings ) {
		return defaultSettings;
	}

	const formSettings = {
		blog_public: settings.blog_public,
		jetpack_holiday_snow_enabled: !! settings.jetpack_holiday_snow_enabled,
		wpcom_coming_soon: settings.wpcom_coming_soon,
		wpcom_data_sharing_opt_out: !! settings.wpcom_data_sharing_opt_out,
		wpcom_legacy_contact: settings.wpcom_legacy_contact,
		wpcom_locked_mode: settings.wpcom_locked_mode,
		wpcom_public_coming_soon: settings.wpcom_public_coming_soon,
		wpcom_gifting_subscription: !! settings.wpcom_gifting_subscription,
		is_fully_managed_agency_site: settings.is_fully_managed_agency_site,
		wpcom_hide_action_bar: settings.wpcom_hide_action_bar,
	};
	return formSettings;
};

export default wrapSettingsForm( getFormSettings )( SiteSettings );
