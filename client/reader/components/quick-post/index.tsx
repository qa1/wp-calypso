import config from '@automattic/calypso-config';
import { Spinner } from '@automattic/components';
import { isLocaleRtl, useLocale } from '@automattic/i18n-utils';
import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
} from '@automattic/verbum-block-editor';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';
import SitesDropdown from 'calypso/components/sites-dropdown';
import wpcom from 'calypso/lib/wp';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { receiveNewPost } from 'calypso/state/reader/streams/actions';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';

import './style.scss';

// Initialize the editor blocks and text formatting.
loadBlocksWithCustomizations();
loadTextFormatting();

// Note: The post data we receive from the API response does
// not match the type in the stream data, but we can insert
// the post data there for now until we create a corresponding
// structure for the newly created post in the stream.
interface PostItem {
	ID: number;
	site_ID: number;
	title: string;
	content: string;
}

function QuickPost( {
	primarySiteId,
	receivePosts,
}: {
	primarySiteId: number | null;
	receivePosts: ( posts: PostItem[] ) => Promise< void >;
} ) {
	const translate = useTranslate();
	const locale = useLocale();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const [ postContent, setPostContent ] = useState( '' );
	const [ editorKey, setEditorKey ] = useState( 0 );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ selectedSiteId, setSelectedSiteId ] = useState< number | null >( primarySiteId ?? null );
	const editorRef = useRef< HTMLDivElement >( null );
	const dispatch = useDispatch();
	const currentUser = useSelector( getCurrentUser );
	const hasLoaded = useSelector( hasLoadedSites );
	const hasSites = ( currentUser?.site_count ?? 0 ) > 0;
	const [ showSuccessMessage, setShowSuccessMessage ] = useState( false );

	const clearEditor = () => {
		setEditorKey( ( key ) => key + 1 );
	};

	const callShowSuccessMessage = () => {
		setShowSuccessMessage( true );
		setTimeout( () => {
			setShowSuccessMessage( false );
		}, 5000 );
	};

	const handleSubmit = () => {
		if ( ! postContent.trim() || ! selectedSiteId || isSubmitting ) {
			return;
		}

		setShowSuccessMessage( false );
		setIsSubmitting( true );

		wpcom
			.site( selectedSiteId )
			.post()
			.add( {
				title: postContent.split( '\n' )[ 0 ], // Use first line as title.
				content: postContent,
				status: 'publish',
			} )
			.then( ( postData: PostItem ) => {
				recordReaderTracksEvent( 'calypso_reader_quick_post_submitted' );
				clearEditor();
				callShowSuccessMessage();

				if ( config.isEnabled( 'reader/quick-post-v2' ) ) {
					receivePosts( [ postData ] ).then( () => {
						// Actual API response will update the stream with the real post data
						dispatch(
							receiveNewPost( {
								streamKey: `following`,
								postData,
							} )
						);
					} );
				}
			} )
			.catch( () => {
				recordReaderTracksEvent( 'calypso_reader_quick_post_error' );
				// TODO: Add error handling
			} )
			.finally( () => {
				setIsSubmitting( false );
			} );
	};

	const handleCancel = () => {
		clearEditor();
	};

	const handleSiteSelect = ( siteId: number ) => {
		setSelectedSiteId( siteId );
	};

	const getButtonText = () => {
		if ( isSubmitting ) {
			return translate( 'Posting' );
		}
		return translate( 'Post' );
	};

	if ( ! hasLoaded ) {
		return (
			<div className="quick-post-input quick-post-input--loading">
				<Spinner />
			</div>
		);
	}

	if ( ! hasSites ) {
		return null; // Don't show QuickPost if user has no sites.
	}

	const isDisabled = isSubmitting;

	return (
		<div className="quick-post-input">
			<label htmlFor="quick-post-site-select" className="quick-post-input__label">
				{ translate( 'Publish a post to' ) }
			</label>
			<div className="quick-post-input__fields">
				<div className="quick-post-input__site-select-wrapper">
					<SitesDropdown
						selectedSiteId={ selectedSiteId || undefined }
						onSiteSelect={ handleSiteSelect }
						isPlaceholder={ ! hasLoaded }
					/>
				</div>
				<div className="verbum-editor-wrapper" ref={ editorRef }>
					<Editor
						key={ editorKey }
						initialContent=""
						onChange={ setPostContent }
						isRTL={ isLocaleRtl( locale ) ?? false }
						isDarkMode={ false }
					/>
				</div>
			</div>
			<div className="quick-post-input__actions">
				<div
					className={ `quick-post-input__success-message ${
						showSuccessMessage ? 'is-visible' : ''
					}` }
					aria-hidden={ ! showSuccessMessage }
				>
					<p>{ translate( 'Post successful! Your message will appear in the feed soon.' ) }</p>
				</div>

				<Button
					onClick={ handleCancel }
					disabled={ isDisabled }
					className="quick-post-input__cancel"
				>
					{ translate( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ handleSubmit }
					disabled={ ! postContent.trim() || isDisabled }
				>
					{ getButtonText() }
				</Button>
			</div>
		</div>
	);
}

export default connect(
	( state: any ) => ( {
		primarySiteId: getPrimarySiteId( state ),
	} ),
	{
		receivePosts: ( posts: PostItem[] ) => receivePosts( posts ) as Promise< void >,
	}
)( QuickPost );
