import { Card, Count } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import PostStatsCard from 'calypso/components/post-stats-card';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { getPostStat } from 'calypso/state/stats/posts/selectors';
import StatsDetailsNavigation from '../stats-details-navigation';
import PostLikes from '../stats-post-likes';
import { truncateWithLimit, getProcessedText } from '../text-utils';

import './style.scss';

type PostThumbnail = {
	ID: number;
	URL: string;
};

type Post = {
	date: string | null;
	dont_email_post_to_subs: boolean | null;
	title: string;
	type: string | null;
	like_count: number | null;
	post_thumbnail: PostThumbnail | null;
	comment_count: number | null;
	url: string | null;
};

const POST_STATS_CARD_TITLE_LIMIT = 48;

export default function PostDetailHighlightsSection( {
	siteId,
	postId,
	post,
}: {
	siteId: number;
	postId: number;
	post: Post;
} ) {
	const translate = useTranslate();
	const userLocale = useSelector( getCurrentUserLocale );

	const viewCount = useSelector( ( state ) => getPostStat( state, siteId, postId, 'views' ) || 0 );

	const postData = {
		date: post?.date,
		post_thumbnail: post?.post_thumbnail?.URL || null,
		title: truncateWithLimit( getProcessedText( post?.title ), POST_STATS_CARD_TITLE_LIMIT ),
	};

	const { supportsEmailStats } = useSelector( ( state ) =>
		getEnvStatsFeatureSupportChecks( state, siteId )
	);

	const isSimple = useSelector( isSimpleSite );

	const isSubscriptionsModuleActive =
		useSelector( ( state ) => isJetpackModuleActive( state, siteId, 'subscriptions' ) ) ?? false;

	const subscriptionsEnabled = isSimple || isSubscriptionsModuleActive;

	// postId > 0: Show the tabs for posts except for the Home Page (postId = 0).
	const isEmailTabsAvailable =
		subscriptionsEnabled &&
		postId > 0 &&
		! post?.dont_email_post_to_subs &&
		post?.date &&
		// The Newsletter Stats data was never backfilled (internal ref pdDOJh-1Uy-p2).
		new Date( post?.date ) >= new Date( '2023-05-30' ) &&
		supportsEmailStats;

	return (
		<>
			{ siteId && <QueryJetpackModules siteId={ siteId } /> }
			{ isEmailTabsAvailable && (
				<div className="stats-navigation stats-navigation--modernized">
					<StatsDetailsNavigation postId={ postId } givenSiteId={ siteId } />
				</div>
			) }
			<div className="stats__post-detail-highlights-section">
				{ siteId && (
					<>
						<QuerySiteStats siteId={ siteId } statType="stats" query={ {} } />
						<QuerySiteStats siteId={ siteId } statType="statsInsights" />
					</>
				) }

				<div className="highlight-cards">
					<h1 className="highlight-cards-heading">{ translate( 'Highlights' ) }</h1>

					<div className="highlight-cards-list">
						<PostStatsCard
							heading={ translate( 'All-time stats' ) }
							likeCount={ post?.like_count || 0 }
							post={ postData }
							viewCount={ viewCount }
							commentCount={ post?.comment_count || 0 }
							locale={ userLocale }
							titleLink={ post?.url || undefined }
						/>

						<Card className="highlight-card">
							<div className="highlight-card-heading">
								<span>{ translate( 'Post likes' ) }</span>
								<Count count={ post?.like_count || 0 } />
							</div>
							<PostLikes siteId={ siteId } postId={ postId } postType={ post?.type } />
						</Card>
					</div>
				</div>
			</div>
		</>
	);
}
