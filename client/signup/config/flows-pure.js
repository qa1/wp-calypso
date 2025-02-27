import { isEnabled } from '@automattic/calypso-config';
import {
	HOSTING_LP_FLOW,
	ONBOARDING_FLOW,
	DIFM_FLOW,
	DIFM_FLOW_STORE,
	WEBSITE_DESIGN_SERVICES,
} from '@automattic/onboarding';
import { translate } from 'i18n-calypso';

const noop = () => {};

const getUserSocialStepOrFallback = () =>
	isEnabled( 'signup/social-first' ) ? 'user-social' : 'user';

const getP2Flows = () => {
	return isEnabled( 'p2-enabled' )
		? [
				{
					// When adding steps, make sure that signup campaign ref's continue to work.
					name: 'p2',
					steps: [
						'user',
						'p2-confirm-email',
						'p2-complete-profile',
						'p2-join-workspace',
						'p2-site',
					],
					destination: ( dependencies ) => `https://${ dependencies.siteSlug }`,
					description: 'New P2 signup flow',
					lastModified: '2021-12-27',
					showRecaptcha: true,
				},
		  ]
		: [];
};

export function generateFlows( {
	getRedirectDestination = noop,
	getSignupDestination = noop,
	getLaunchDestination = noop,
	getDomainSignupFlowDestination = noop,
	getEmailSignupFlowDestination = noop,
	getWithThemeDestination = noop,
	getWithPluginDestination = noop,
	getDestinationFromIntent = noop,
	getDIFMSignupDestination = noop,
	getDIFMSiteContentCollectionDestination = noop,
	getHostingFlowDestination = noop,
	getEntrepreneurFlowDestination = noop,
} = {} ) {
	const userSocialStep = getUserSocialStepOrFallback();
	const p2Flows = getP2Flows();

	const flows = [
		{
			name: 'hosting', // This flow is to be removed once the Landpack changes are completed.
			steps: [ userSocialStep, 'hosting-decider' ],
			destination: getHostingFlowDestination,
			description: 'To be deleted.',
			lastModified: '2024-03-22',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'toStepper' ],
			optionalDependenciesInQuery: [ 'toStepper' ],
			hideProgressIndicator: true,
		},
		{
			name: HOSTING_LP_FLOW,
			steps: [ userSocialStep, 'hosting-decider' ],
			destination: getHostingFlowDestination,
			description: 'Create an account and redirect the user to the hosted site flow forking step.',
			lastModified: '2024-03-22',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'toStepper' ],
			optionalDependenciesInQuery: [ 'toStepper' ],
		},
		{
			name: 'account',
			steps: [ userSocialStep, 'set-reader-landing' ],
			destination: getRedirectDestination,
			description: 'Create an account without a blog.',
			lastModified: '2025-02-18',
			get pageTitle() {
				return translate( 'Create an account' );
			},
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'toStepper' ],
			optionalDependenciesInQuery: [ 'toStepper' ],
			hideProgressIndicator: true,
		},
		{
			name: 'business',
			steps: [ userSocialStep, 'domains', 'plans-business', 'storage-addon' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and then add the business plan to the users cart.',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'coupon', 'storage' ],
			optionalDependenciesInQuery: [ 'coupon', 'storage' ],
			hideProgressIndicator: true,
		},
		{
			name: 'premium',
			steps: [ userSocialStep, 'domains', 'plans-premium' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and then add the premium plan to the users cart.',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'coupon' ],
			optionalDependenciesInQuery: [ 'coupon' ],
			hideProgressIndicator: true,
		},
		{
			name: 'personal',
			steps: [ userSocialStep, 'domains', 'plans-personal' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and then add the personal plan to the users cart.',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'coupon' ],
			optionalDependenciesInQuery: [ 'coupon' ],
			hideProgressIndicator: true,
		},
		{
			name: 'free',
			steps: [ userSocialStep, 'domains' ],
			destination: getSignupDestination,
			description: 'Create an account and a blog and default to the free plan.',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'with-theme',
			steps: [ userSocialStep, 'domains-theme-preselected', 'plans-theme-preselected' ],
			destination: getWithThemeDestination,
			description: 'Preselect a theme to activate/buy from an external source',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'theme', 'intervalType' ],
			optionalDependenciesInQuery: [ 'theme_type', 'style_variation', 'intervalType' ],
			hideProgressIndicator: true,
		},
		{
			name: 'with-plugin',
			steps: [ userSocialStep, 'domains', 'plans-business-with-plugin' ],
			destination: getWithPluginDestination,
			description: 'Preselect a plugin to activate/buy, a Business plan is needed',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'plugin', 'billing_period' ],
			hideProgressIndicator: true,
		},
		{
			name: ONBOARDING_FLOW,
			steps: [ userSocialStep, 'domains', 'plans' ],
			destination: getSignupDestination,
			description: 'Abridged version of the onboarding flow. Read more in https://wp.me/pau2Xa-Vs.',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'coupon' ],
			optionalDependenciesInQuery: [ 'coupon' ],
			hideProgressIndicator: true,
		},
		{
			name: 'plans-first',
			steps: [ 'plans', 'domains', userSocialStep ],
			destination: getSignupDestination,
			description: 'Plans first signup flow',
			lastModified: '2024-05-24',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'coupon' ],
			optionalDependenciesInQuery: [ 'coupon' ],
			hideProgressIndicator: true,
		},
		{
			name: 'onboarding-pm',
			steps: [ userSocialStep, 'domains', 'plans' ],
			destination: getSignupDestination,
			description:
				'Paid media version of the onboarding flow. Read more in https://wp.me/pau2Xa-4Kk.',
			lastModified: '2023-12-16',
			showRecaptcha: true,
			hideProgressIndicator: true,
			providesDependenciesInQuery: [ 'coupon' ],
			optionalDependenciesInQuery: [ 'coupon' ],
			props: {
				plans: {
					isCustomDomainAllowedOnFreePlan: true,
					deemphasizeFreePlan: true,
				},
			},
		},
		{
			name: 'import',
			steps: [ userSocialStep, 'domains', 'plans-import' ],
			destination: ( dependencies ) =>
				`/setup/import-focused/import?siteSlug=${ dependencies.siteSlug }`,
			description: 'Beginning of the flow to import content',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			get pageTitle() {
				return translate( 'Import' );
			},
			hideProgressIndicator: true,
		},
		{
			name: 'onboarding-with-email',
			steps: [ userSocialStep, 'mailbox-domain', 'mailbox', 'mailbox-plan' ],
			destination: getEmailSignupFlowDestination,
			description:
				'Copy of the onboarding flow that includes non-skippable domain and email steps; the flow is used by the Professional Email landing page',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'onboarding-registrationless',
			steps: [ 'domains', 'plans-new', 'user-new' ],
			destination: getSignupDestination,
			description: 'Checkout without user account or site. Read more https://wp.me/pau2Xa-1hW',
			lastModified: '2020-06-26',
			showRecaptcha: true,
		},
		{
			name: 'rewind-setup',
			steps: [ 'rewind-form-creds', 'rewind-were-backing' ],
			destination: '/activity-log',
			description: 'Allows users with Jetpack plan to setup credentials',
			lastModified: '2019-11-11',
			disallowResume: true,
			forceLogin: true,
		},
		{
			name: 'rewind-auto-config',
			steps: [ 'creds-permission', 'creds-confirm', 'rewind-were-backing' ],
			destination: '/activity-log',
			description:
				'Allow users of sites that can auto-config to grant permission to server credentials',
			lastModified: '2018-02-13',
			disallowResume: true,
		},
		{
			name: 'clone-site',
			steps: [
				'clone-start',
				'clone-destination',
				'clone-credentials',
				'clone-point',
				'clone-ready',
				'clone-cloning',
			],
			destination: '/activity-log',
			description: 'Allow Jetpack users to clone a site via Rewind (alternate restore)',
			lastModified: '2018-05-28',
			disallowResume: true,
		},
		{
			name: 'ecommerce',
			steps: [ userSocialStep, 'domains', 'plans-ecommerce-fulfilled' ],
			destination: getSignupDestination,
			description: 'Signup flow for creating an online store with an Atomic site',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'ecommerce-monthly',
			steps: [ userSocialStep, 'domains', 'plans-ecommerce-monthly' ],
			destination: getSignupDestination,
			description: 'Signup flow for creating an online store with an Atomic site',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'wpcc',
			steps: [ 'oauth2-user' ],
			destination: getRedirectDestination,
			description: 'WordPress.com Connect signup flow',
			lastModified: '2017-08-24',
			disallowResume: true, // don't allow resume so we don't clear query params when we go back in the history
			showRecaptcha: true,
		},
		...p2Flows,
		{
			name: 'domain',
			steps: [
				'domain-only',
				'site-or-domain',
				'site-picker',
				'plans-site-selected',
				userSocialStep,
			],
			destination: getDomainSignupFlowDestination,
			description: 'An experimental approach for WordPress.com/domains',
			disallowResume: true,
			lastModified: '2023-10-11',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'domain-for-gravatar',
			steps: [ 'domain-only', 'site-or-domain', 'site-picker' ],
			destination: getDomainSignupFlowDestination,
			description: 'Checkout flow for domains on Gravatar',
			disallowResume: true,
			lastModified: '2024-05-07',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'site-selected',
			steps: [ 'plans-site-selected-legacy' ],
			destination: getSignupDestination,
			providesDependenciesInQuery: [ 'siteSlug', 'siteId' ],
			description: 'A flow to test updating an existing site with `Signup`',
			lastModified: '2017-01-19',
		},
		{
			name: 'launch-site',
			steps: [ 'domains-launch', 'plans-launch', 'launch' ],
			destination: getLaunchDestination,
			description: 'A flow to launch a private site.',
			providesDependenciesInQuery: [ 'siteSlug' ],
			lastModified: '2019-11-22',
			get pageTitle() {
				return translate( 'Launch your site' );
			},
		},
		{
			name: 'reader',
			steps: [ userSocialStep, 'set-reader-landing' ],
			destination: '/reader',
			description: 'Signup for an account and land on Reader.',
			lastModified: '2025-02-18',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'crowdsignal',
			steps: [ 'oauth2-name' ],
			destination: getRedirectDestination,
			description: "Crowdsignal's custom WordPress.com Connect signup flow",
			lastModified: '2018-11-14',
			disallowResume: true,
			showRecaptcha: true,
		},
		{
			name: 'business-monthly',
			steps: [ userSocialStep, 'domains', 'plans-business-monthly' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the business monthly plan to the users cart.',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'premium-monthly',
			steps: [ userSocialStep, 'domains', 'plans-premium-monthly' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the premium monthly plan to the users cart.',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'personal-monthly',
			steps: [ userSocialStep, 'domains', 'plans-personal-monthly' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the personal monthly plan to the users cart.',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'setup-site',
			steps: [
				'intent',
				'site-options',
				'starting-point',
				'courses',
				'store-options',
				'store-features',
			],
			destination: getDestinationFromIntent,
			description:
				'Sets up a site that has already been created and paid for (if purchases were made)',
			lastModified: '2024-01-08',
			providesDependenciesInQuery: [ 'siteId', 'siteSlug' ],
			optionalDependenciesInQuery: [ 'siteId' ],
			get pageTitle() {
				return translate( 'Set up your site' );
			},
			enableBranchSteps: true,
			hideProgressIndicator: true,
		},
		{
			name: DIFM_FLOW,
			steps: [
				userSocialStep,
				'new-or-existing-site',
				'difm-site-picker',
				'difm-options',
				'social-profiles',
				'difm-design-setup-site',
				'difm-page-picker',
			],
			destination: getDIFMSignupDestination,
			description: 'A flow for DIFM Lite leads',
			excludeFromManageSiteFlows: true,
			lastModified: '2024-05-16',
			enableBranchSteps: true,
			hideProgressIndicator: true,
			enablePremiumSupport: true,
			get helpCenterButtonText() {
				return translate( 'Questions? Contact our site building team' );
			},
			providesDependenciesInQuery: [ 'coupon', 'back_to', 'newOrExistingSiteChoice' ],
			optionalDependenciesInQuery: [ 'coupon', 'back_to', 'newOrExistingSiteChoice' ],
		},
		{
			name: DIFM_FLOW_STORE,
			steps: [
				userSocialStep,
				'new-or-existing-site',
				'difm-site-picker',
				'difm-store-options',
				'social-profiles',
				'difm-design-setup-site',
				'difm-page-picker',
			],
			destination: getDIFMSignupDestination,
			description: 'The BBE store flow',
			excludeFromManageSiteFlows: true,
			lastModified: '2024-05-16',
			enableBranchSteps: true,
			hideProgressIndicator: true,
			enablePremiumSupport: true,
			get helpCenterButtonText() {
				return translate( 'Questions? Contact our site building team' );
			},
			providesDependenciesInQuery: [ 'coupon' ],
			optionalDependenciesInQuery: [ 'coupon' ],
		},
		{
			name: WEBSITE_DESIGN_SERVICES,
			steps: [ 'difm-options', 'social-profiles', 'difm-design-setup-site', 'difm-page-picker' ],
			destination: getDIFMSignupDestination,
			description: 'A flow for DIFM onboarding',
			excludeFromManageSiteFlows: true,
			providesDependenciesInQuery: [ 'siteSlug', 'back_to' ],
			optionalDependenciesInQuery: [ 'back_to' ],
			lastModified: '2024-06-14',
			enablePremiumSupport: true,
			get helpCenterButtonText() {
				return translate( 'Questions? Contact our site building team' );
			},
		},

		{
			name: 'site-content-collection',
			steps: [ userSocialStep, 'website-content' ],
			destination: getDIFMSiteContentCollectionDestination,
			description: 'A flow to collect DIFM lite site content',
			excludeFromManageSiteFlows: true,
			providesDependenciesInQuery: [ 'siteId', 'siteSlug' ],
			optionalDependenciesInQuery: [ 'siteId', 'siteSlug' ],
			lastModified: '2025-02-27',
			hideProgressIndicator: true,
		},
		{
			name: 'woocommerce-install',
			get pageTitle() {
				return translate( 'Add WooCommerce to your site' );
			},
			steps: [ 'store-address', 'business-info', 'confirm', 'transfer' ],
			destination: '/',
			description: 'Onboarding and installation flow for woocommerce on all plans.',
			providesDependenciesInQuery: [ 'siteSlug', 'back_to' ],
			optionalDependenciesInQuery: [ 'back_to' ],
			lastModified: '2021-12-21',
			disallowResume: false,
		},
		{
			name: 'business-2y',
			steps: [ userSocialStep, 'domains', 'plans-business-2y' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the business 2y plan to the users cart.',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'business-3y',
			steps: [ userSocialStep, 'domains', 'plans-business-3y' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the business 3y plan to the users cart.',
			lastModified: '2024-04-17',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},

		{
			name: 'premium-2y',
			steps: [ userSocialStep, 'domains', 'plans-premium-2y' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the premium 2y plan to the users cart.',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'premium-3y',
			steps: [ userSocialStep, 'domains', 'plans-premium-3y' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the premium 3y plan to the users cart.',
			lastModified: '2024-04-17',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'personal-2y',
			steps: [ userSocialStep, 'domains', 'plans-personal-2y' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the personal 2y plan to the users cart.',
			lastModified: '2023-10-11',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'personal-3y',
			steps: [ userSocialStep, 'domains', 'plans-personal-3y' ],
			destination: getSignupDestination,
			description:
				'Create an account and a blog and then add the personal 3y plan to the users cart.',
			lastModified: '2024-04-17',
			showRecaptcha: true,
			hideProgressIndicator: true,
		},
		{
			name: 'entrepreneur',
			steps: [ userSocialStep ],
			destination: getEntrepreneurFlowDestination,
			description: 'Entrepreneur Trial signup flow that goes through the trialAcknowledge step',
			lastModified: '2024-05-29',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'toStepper', 'redirect_to' ],
			optionalDependenciesInQuery: [ 'toStepper', 'redirect_to' ],
			hideProgressIndicator: true,
		},
		{
			name: 'onboarding-affiliate',
			steps: [ userSocialStep, 'domains', 'plans-affiliate' ],
			destination: getSignupDestination,
			description: 'Affiliates flow',
			lastModified: '2024-06-06',
			showRecaptcha: true,
			providesDependenciesInQuery: [ 'coupon' ],
			optionalDependenciesInQuery: [ 'coupon' ],
			hideProgressIndicator: true,
			enableHotjar: true,
		},
	];

	// convert the array to an object keyed by `name`
	return Object.fromEntries( flows.map( ( flow ) => [ flow.name, flow ] ) );
}

const flows = generateFlows();
export default flows;
