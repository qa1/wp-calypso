import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { PanelCard, PanelCardDescription, PanelCardHeading } from 'calypso/components/panel';
import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getSiteOption, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SiteSettingPrivacyForm from './form';
import type { AppState } from 'calypso/types';

import './style.scss';

export interface Fields {
	blog_public: number;
	wpcom_coming_soon: number;
	wpcom_public_coming_soon: number;
	wpcom_data_sharing_opt_out: boolean;
}

interface PrivacyFormProps {
	fields: Fields;
	handleSubmitForm: ( event?: React.FormEvent< HTMLFormElement > ) => void;
	updateFields: ( fields: Fields ) => void;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
}

const PrivacyForm = ( {
	fields,
	handleSubmitForm,
	updateFields,
	isRequestingSettings,
	isSavingSettings,
}: PrivacyFormProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const siteIsAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const siteIsJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isComingSoon = useSelector( ( state: AppState ) => isSiteComingSoon( state, siteId ) );
	const isP2HubSite = useSelector( ( state: AppState ) => isSiteP2Hub( state, siteId ) );
	const isUnlaunched = useSelector( ( state: AppState ) => isUnlaunchedSite( state, siteId ) );
	const isWpcomStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );
	const isWPForTeamsSite = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );
	const isEditingToolkitActive = useSelector(
		( state ) => !! getSiteOption( state, siteId, 'editing_toolkit_is_active' )
	);
	const isAtomicAndEditingToolkitDeactivated = !! siteIsAtomic && ! isEditingToolkitActive;
	const isUntangled = useRemoveDuplicateViewsExperimentEnabled();

	if ( isP2HubSite ) {
		return <></>;
	}

	const renderSectionHeader = () => {
		return (
			<SettingsSectionHeader
				id="site-privacy-settings"
				disabled={ isRequestingSettings || isSavingSettings }
				isSaving={ isSavingSettings }
				onButtonClick={ handleSubmitForm }
				showButton
				title={ translate(
					'Site Visibility {{infoPopover}} Control who can view your site. {{a}}Learn more{{/a}}. {{/infoPopover}}',
					{
						components: {
							a: <InlineSupportLink showIcon={ false } supportContext="privacy" />,
							infoPopover: <InfoPopover position="bottom right" />,
						},
						comment: 'Site Visibility Settings header',
					}
				) }
			/>
		);
	};

	const renderForm = () => {
		return (
			<>
				<SiteSettingPrivacyForm
					fields={ fields }
					updateFields={ updateFields }
					isAtomicAndEditingToolkitDeactivated={ isAtomicAndEditingToolkitDeactivated }
					isComingSoon={ isComingSoon }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					isUnlaunchedSite={ isUnlaunched }
					isWPForTeamsSite={ isWPForTeamsSite }
					isWpcomStagingSite={ isWpcomStagingSite }
					siteIsAtomic={ siteIsAtomic }
					siteIsJetpack={ siteIsJetpack }
				/>
			</>
		);
	};

	if ( ! isUntangled ) {
		return (
			<>
				{ renderSectionHeader() }
				<Card>{ renderForm() }</Card>
			</>
		);
	}
	return (
		<PanelCard className="settings-site__privacy">
			<PanelCardHeading>{ translate( 'Site Visibility' ) }</PanelCardHeading>
			<PanelCardDescription>
				{ translate( 'Control who can view your site. {{a}}Learn more{{/a}}', {
					components: {
						a: <InlineSupportLink showIcon={ false } supportContext="privacy" />,
					},
				} ) }
			</PanelCardDescription>
			{ renderForm() }
			<Button
				busy={ isSavingSettings }
				disabled={ isRequestingSettings || isSavingSettings }
				onClick={ handleSubmitForm as () => void }
			>
				{ translate( 'Save' ) }
			</Button>
		</PanelCard>
	);
};

export default PrivacyForm;
