import { Card } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { external } from '@wordpress/icons';
import i18n, { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import exportSubstackSubscribersImg from 'calypso/assets/images/importer/export-substack-subscribers.png';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { SubscribersStepProps } from '../types';
import { normalizeFromSite } from '../utils';
import SubscriberUploadForm from './upload-form';

export default function StepInitial( {
	selectedSite,
	fromSite,
	siteSlug,
	skipNextStep,
	cardData,
	engine,
	setAutoFetchData,
}: SubscribersStepProps ) {
	const translate = useTranslate();
	const { importSelector } = useSelect( ( select ) => {
		const subscriber = select( Subscriber.store );
		return {
			importSelector: subscriber.getImportSubscribersSelector(),
		};
	}, [] );

	const prevInProgress = useRef( importSelector?.inProgress );
	useEffect( () => {
		if ( ! prevInProgress.current && importSelector?.inProgress ) {
			setAutoFetchData( true );
		}
		prevInProgress.current = importSelector?.inProgress;
	}, [ importSelector?.inProgress, setAutoFetchData ] );

	return (
		<Card>
			<h2>{ translate( 'Step 1: Export your subscribers from Substack' ) }</h2>
			<p>
				{ i18n.fixMe( {
					text: `Generate a CSV of your Substack subscribers. In Substack, go to Subscribers, click Export under "All subscribers," then upload the CSV in the next step. On the free plan, you can import up to 100 subscribers.`,
					newCopy: translate(
						`Generate a CSV of your Substack subscribers. In Substack, go to {{strong}}Subscribers{{/strong}}, click {{strong}}Export{{/strong}} under "All subscribers," then upload the CSV in the next step. On the free plan, {{supportLink}}you can import up to 100 subscribers.{{/supportLink}}`,
						{
							components: {
								strong: <strong />,
								supportLink: (
									<InlineSupportLink
										noWrap={ false }
										showIcon={ false }
										supportLink={ localizeUrl(
											'https://wordpress.com/support/import-subscribers-to-a-newsletter/#troubleshooting-subscriber-imports'
										) }
										supportPostId={ 220199 }
									/>
								),
							},
						}
					),
					oldCopy: createInterpolateElement(
						translate(
							`Generate a CSV file of all your Substack subscribers. On Substack, go to the <strong>Subscribers</strong> tab and click the <strong>Export</strong> button you’ll find on top of the table. Then, upload the downloaded CSV in the next step.`
						),
						{
							strong: <strong />,
						}
					),
				} ) }
			</p>
			<img
				src={ exportSubstackSubscribersImg }
				alt={ translate( 'Export Substack subscribers' ) }
				className="export-subscribers"
			/>
			<Button
				href={ `https://${ normalizeFromSite( fromSite ) }/publish/subscribers` }
				target="_blank"
				rel="noreferrer noopener"
				icon={ external }
				iconPosition="right"
				variant="primary"
			>
				{ translate( 'Open Substack subscribers' ) }
			</Button>
			<hr />
			<h2>{ translate( 'Step 2: Import your subscribers' ) }</h2>
			{ selectedSite.ID && (
				<SubscriberUploadForm
					siteId={ selectedSite.ID }
					nextStepUrl={ `/import/newsletter/${ engine }/${ siteSlug }/summary?from=${ fromSite }` }
					skipNextStep={ skipNextStep }
					cardData={ cardData }
				/>
			) }
		</Card>
	);
}
