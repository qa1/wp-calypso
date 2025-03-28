import page from '@automattic/calypso-router';
import { useSiteDomainsQuery } from '@automattic/data-stores';
import { DomainsTable, ResponseDomain } from '@automattic/domains-table';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import SiteAddressChanger from 'calypso/blocks/site-address-changer';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector, useDispatch } from 'calypso/state';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import {
	showUpdatePrimaryDomainErrorNotice,
	showUpdatePrimaryDomainSuccessNotice,
} from 'calypso/state/domains/management/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions'; // eslint-disable-line no-restricted-imports
import { setPrimaryDomain } from 'calypso/state/sites/domains/actions';
import { hasDomainCredit as hasDomainCreditSelector } from 'calypso/state/sites/plans/selectors';
import { isSupportSession } from 'calypso/state/support/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { domainManagementList } from '../../paths';
import DomainHeader from '../components/domain-header';
import PointToWpcomDialog from '../components/point-to-wpcom-dialog';
import PrimaryDomainSelector from '../components/primary-domain-selector';
import {
	createBulkAction,
	deleteBulkActionStatus,
	fetchAllDomains,
	fetchBulkActionStatus,
	fetchSite,
	fetchSiteDomains,
} from '../domains-table-fetch-functions';
import EmptyDomainsListCard from './empty-domains-list-card';
import GoogleDomainOwnerBanner from './google-domain-owner-banner';
import ManageAllDomainsButton from './manage-all-domains-button';
import OptionsDomainButton from './options-domain-button';
import { usePurchaseActions } from './use-purchase-actions';
import { filterOutWpcomDomains } from './utils';
import './style.scss';

interface BulkSiteDomainsProps {
	analyticsPath: string;
	analyticsTitle: string;
}

export default function BulkSiteDomains( props: BulkSiteDomainsProps ) {
	const site = useSelector( getSelectedSite );
	const [ domainToPointToWpcom, setDomainToPointToWpcom ] = useState< string | null >( null );
	const [ isPointingToWpcom, setIsPointingToWpcom ] = useState( false );
	const userCanSetPrimaryDomains = useSelector(
		( state ) => ! currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
	);
	const hasDomainCredit = useSelector( ( state ) => hasDomainCreditSelector( state, site?.ID ) );
	const { data, isLoading, refetch } = useSiteDomainsQuery( site?.ID, {
		queryFn: () => fetchSiteDomains( site?.ID ),
	} );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isInSupportSession = Boolean( useSelector( isSupportSession ) );
	const [ showPointToWpcomModal, setShowPointToWpcomModal ] = useState( false );
	const { __ } = useI18n();

	const hasNonWpcomDomains = useMemo( () => {
		return filterOutWpcomDomains( data?.domains ?? [] ).length > 0;
	}, [ data ] );

	const item = {
		label: translate( 'Domains' ),
		helpBubble: translate(
			'Manage the domains connected to your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
			{
				components: {
					learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
				},
			}
		),
	};

	const purchaseActions = usePurchaseActions();

	const buttons = [
		<ManageAllDomainsButton key="manage_all_domains_button" />,
		<OptionsDomainButton key="options_domain_button" />,
	];

	const [ changeSiteAddressSourceDomain, setChangeSiteAddressSourceDomain ] =
		useState< ResponseDomain | null >( null );

	const onSetPrimaryDomain = async (
		domain: string,
		onComplete: () => void,
		type: string
	): Promise< void > => {
		if ( site ) {
			dispatch(
				recordGoogleEvent(
					'Domain Management',
					'Changed Primary Domain in Site Domains',
					'Domain Name',
					domain
				)
			);
			dispatch(
				recordTracksEvent( 'calypso_domain_management_settings_change_primary_domain_dropdown', {
					section: type,
					mode: 'dropdown',
				} )
			);
			try {
				await dispatch( setPrimaryDomain( site.ID, domain ) );
				dispatch( showUpdatePrimaryDomainSuccessNotice( domain ) );
				page.replace( domainManagementList( domain ) );
				await refetch();
			} catch ( error ) {
				dispatch( showUpdatePrimaryDomainErrorNotice( ( error as Error ).message ) );
			} finally {
				onComplete();
			}
		}
	};

	const onPointToWpcom = async ( domain: string ) => {
		if ( ! domain ) {
			return;
		}
		setIsPointingToWpcom( true );
		dispatch(
			recordTracksEvent( 'calypso_domain_management_point_to_wpcom', {
				domain,
			} )
		);
		try {
			await wpcomRequest( {
				path: '/domains/point-to-wpcom',
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: {
					domain: domain,
				},
			} );
			await refetch();
			dispatch( successNotice( __( 'Domain is pointing to WordPress.com' ) ) );
		} catch ( error ) {
			dispatch( errorNotice( __( 'Error pointing domain to WordPress.com' ) ) );
		} finally {
			setIsPointingToWpcom( false );
		}
	};

	return (
		<>
			<PageViewTracker path={ props.analyticsPath } title={ props.analyticsTitle } />
			<Main wideLayout>
				<DocumentHead title={ translate( 'Domains' ) } />
				<BodySectionCssClass
					bodyClass={ [ 'edit__body-white', 'is-bulk-domains-page', 'is-bulk-site-domains-page' ] }
				/>
				<DomainHeader items={ [ item ] } buttons={ buttons } mobileButtons={ buttons } />
				{ ! isLoading && <GoogleDomainOwnerBanner /> }
				<PrimaryDomainSelector
					domains={ data?.domains }
					site={ site }
					onSetPrimaryDomain={ onSetPrimaryDomain }
				/>
				<DomainsTable
					isLoadingDomains={ isLoading }
					domains={ data?.domains }
					isAllSitesView={ false }
					siteSlug={ site?.slug ?? null }
					domainStatusPurchaseActions={ purchaseActions }
					userCanSetPrimaryDomains={ userCanSetPrimaryDomains }
					currentUserCanBulkUpdateContactInfo={ ! isInSupportSession }
					onPointToWpcom={ ( domain ) => {
						setDomainToPointToWpcom( domain );
						setShowPointToWpcomModal( true );
					} }
					isPointingToWpcom={ isPointingToWpcom }
					onDomainAction={ ( action, domain ) => {
						if ( action === 'set-primary-address' && site ) {
							return {
								message: translate( 'Set domain as the primary site address' ),
								action: async () => {
									try {
										await dispatch( setPrimaryDomain( site.ID, domain.domain ) );
										dispatch( showUpdatePrimaryDomainSuccessNotice( domain.name ) );
										page.replace( domainManagementList( domain.domain ) );
										await refetch();
									} catch ( error ) {
										dispatch( showUpdatePrimaryDomainErrorNotice( ( error as Error ).message ) );
									}
								},
							};
						}

						if ( action === 'change-site-address' ) {
							setChangeSiteAddressSourceDomain( domain );
						}
					} }
					footer={
						<>
							{ ! isLoading && (
								<EmptyDomainsListCard
									selectedSite={ site }
									hasDomainCredit={ !! hasDomainCredit }
									isCompact={ hasNonWpcomDomains }
									hasNonWpcomDomains={ hasNonWpcomDomains }
								/>
							) }
						</>
					}
					fetchAllDomains={ fetchAllDomains }
					fetchSite={ fetchSite }
					fetchSiteDomains={ fetchSiteDomains }
					createBulkAction={ createBulkAction }
					fetchBulkActionStatus={ fetchBulkActionStatus }
					deleteBulkActionStatus={ deleteBulkActionStatus }
				/>
				{ changeSiteAddressSourceDomain && (
					<SiteAddressChanger
						hasNonWpcomDomains={ hasNonWpcomDomains }
						currentDomain={ changeSiteAddressSourceDomain }
						currentDomainSuffix={ changeSiteAddressSourceDomain.name.match( /\.\w+\.\w+$/ )?.[ 0 ] }
						isDialogVisible
						onClose={ () => setChangeSiteAddressSourceDomain( null ) }
						onSiteAddressChanged={ () => refetch() }
						skipRedirection={ false }
					/>
				) }
				<PointToWpcomDialog
					visible={ showPointToWpcomModal }
					onClose={ ( accepted: boolean ) => {
						setShowPointToWpcomModal( false );
						if ( accepted ) {
							onPointToWpcom( domainToPointToWpcom ?? '' );
						}
					} }
				/>
			</Main>
		</>
	);
}
