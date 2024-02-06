import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	PLAN_PREMIUM,
	FEATURE_STYLE_CUSTOMIZATION,
	WPCOM_FEATURES_SITE_PREVIEW_LINKS,
	getPlan,
} from '@automattic/calypso-products';
import { Button, FormLabel, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SitePreviewLink from 'calypso/components/site-preview-link';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

interface SitePrivacyFormProps {
	fields: Fields;
}

const connectComponent = connect( ( state: IAppState ) => {
	const siteId = getSelectedSiteId( state );

	return {
		selectedSite: getSelectedSite( state ),
		siteIsJetpack: isJetpackSite( state, siteId ),
		siteSlug: getSelectedSiteSlug( state ),
		hasSitePreviewLink: siteHasFeature( state, siteId, WPCOM_FEATURES_SITE_PREVIEW_LINKS ),
		isAtomicAndEditingToolkitDeactivated:
			isAtomicSite( state, siteId ) &&
			getSiteOption( state, siteId, 'editing_toolkit_is_active' ) === false,
		isComingSoon: isSiteComingSoon( state, siteId ),
		isUnlaunchedSite: isUnlaunchedSite( state, siteId ),
		isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
		isWpcomStagingSite: isSiteWpcomStaging( state, siteId ),
	};
} );

const SitePrivacyFormNotice = ( { selectedSite, siteSlug } ) => {
	const translate = useTranslate();
	const upgradeUrl = `/plans/${ siteSlug }?plan=${ PLAN_PREMIUM }&feature=${ FEATURE_STYLE_CUSTOMIZATION }`;

	return (
		<>
			<div className="site-settings__advanced-customization-notice">
				<div className="site-settings__advanced-customization-notice-cta">
					<Gridicon icon="info-outline" />
					<span>
						{ translate(
							'Your site contains premium styles that will only be visible once you upgrade to a %(planName)s plan.',
							{
								args: {
									planName: getPlan( PLAN_PREMIUM )?.getTitle() ?? '',
								},
							}
						) }
					</span>
				</div>
				<div className="site-settings__advanced-customization-notice-buttons">
					<Button href={ selectedSite.URL } target="_blank">
						{ translate( 'View site' ) }
					</Button>
					<Button
						className="is-primary"
						href={ upgradeUrl }
						onClick={ () => {
							recordTracksEvent( 'calypso_global_styles_gating_settings_notice_upgrade_click', {
								cta_name: 'settings_site_privacy',
							} );
						} }
					>
						{ translate( 'Upgrade' ) }
					</Button>
				</div>
			</div>
		</>
	);
};

const SitePrivacyForm = connectComponent(
	( {
		eventTracker,
		fields,
		siteId,
		siteIsAtomic,
		trackEvent,
		updateFields,
		isRequestingSettings,

		selectedSite,
		siteIsJetpack,
		siteSlug,
		hasSitePreviewLink,
		isAtomicAndEditingToolkitDeactivated,
		isComingSoon,
		isUnlaunchedSite,
		isWPForTeamsSite,
		isWpcomStagingSite,
	}: SitePrivacyFormProps ) => {
		const translate = useTranslate();
		const { globalStylesInUse, shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

		const blogPublic = parseInt( fields.blog_public, 10 );
		const wpcomComingSoon = 1 === parseInt( fields.wpcom_coming_soon, 10 );
		const wpcomPublicComingSoon = 1 === parseInt( fields.wpcom_public_coming_soon, 10 );
		// isPrivateAndUnlaunched means it is an unlaunched coming soon v1 site
		const isPrivateAndUnlaunched = -1 === blogPublic && isUnlaunchedSite;
		const isNonAtomicJetpackSite = siteIsJetpack && ! siteIsAtomic;
		const isAnyComingSoonEnabled =
			( 0 === blogPublic && wpcomPublicComingSoon ) || isPrivateAndUnlaunched || wpcomComingSoon;
		const isComingSoonDisabled = isRequestingSettings || isAtomicAndEditingToolkitDeactivated;
		const isPublicChecked =
			( wpcomPublicComingSoon && blogPublic === 0 && isComingSoonDisabled ) ||
			( blogPublic === 0 && ! wpcomPublicComingSoon ) ||
			blogPublic === 1;

		const showPreviewLink = isComingSoon && hasSitePreviewLink;
		const shouldShowPremiumStylesNotice = globalStylesInUse && shouldLimitGlobalStyles;

		const handleVisibilityOptionChange = ( {
			blog_public,
			wpcom_coming_soon,
			wpcom_public_coming_soon,
		} ) => {
			trackEvent( `Set blog_public to ${ blog_public }` );
			trackEvent( `Set wpcom_coming_soon to ${ wpcom_coming_soon }` );
			trackEvent( `Set wpcom_public_coming_soon to ${ wpcom_public_coming_soon }` );
			updateFields( { blog_public, wpcom_coming_soon, wpcom_public_coming_soon } );
		};

		return (
			<form>
				<FormFieldset>
					{ ! isNonAtomicJetpackSite &&
						! isWPForTeamsSite &&
						! isAtomicAndEditingToolkitDeactivated && (
							<>
								{ shouldShowPremiumStylesNotice && (
									<SitePrivacyFormNotice selectedSite={ selectedSite } siteSlug={ siteSlug } />
								) }
								<FormLabel
									className={ classnames( 'site-settings__visibility-label is-coming-soon', {
										'is-coming-soon-disabled': isComingSoonDisabled,
									} ) }
								>
									<FormRadio
										name="blog_public"
										value="0"
										checked={ isAnyComingSoonEnabled }
										onChange={ () =>
											handleVisibilityOptionChange( {
												blog_public: 0,
												wpcom_coming_soon: 0,
												wpcom_public_coming_soon: 1,
											} )
										}
										disabled={ isComingSoonDisabled }
										onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
										label={ translate( 'Coming Soon' ) }
									/>
								</FormLabel>
								<FormSettingExplanation>
									{ translate(
										'Your site is hidden from visitors behind a "Coming Soon" notice until it is ready for viewing.'
									) }
								</FormSettingExplanation>
								{ showPreviewLink && (
									<div className="site-settings__visibility-label is-checkbox">
										<SitePreviewLink
											siteUrl={ site.URL }
											siteId={ siteId }
											disabled={ ! isAnyComingSoonEnabled || isSavingSettings }
											forceOff={ ! isAnyComingSoonEnabled }
											source="privacy-settings"
										/>
									</div>
								) }
							</>
						) }
					{ ! isNonAtomicJetpackSite && (
						<>
							<FormLabel className="site-settings__visibility-label is-public">
								<FormRadio
									name="blog_public"
									value="1"
									checked={ isPublicChecked }
									onChange={ () =>
										handleVisibilityOptionChange( {
											blog_public: isWpcomStagingSite ? 0 : 1,
											wpcom_coming_soon: 0,
											wpcom_public_coming_soon: 0,
										} )
									}
									disabled={ isRequestingSettings }
									onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
									label={ translate( 'Public' ) }
								/>
							</FormLabel>
							<FormSettingExplanation>
								{ isWpcomStagingSite
									? translate(
											'Your site is visible to everyone, but search engines are discouraged from indexing staging sites.'
									  )
									: translate( 'Your site is visible to everyone.' ) }
							</FormSettingExplanation>
						</>
					) }

					{ ! isWpcomStagingSite && (
						<>
							<FormLabel className="site-settings__visibility-label is-checkbox is-hidden">
								<FormInputCheckbox
									name="blog_public"
									value="0"
									checked={
										( wpcomPublicComingSoon && blogPublic === 0 && isComingSoonDisabled ) ||
										( 0 === blogPublic && ! wpcomPublicComingSoon )
									}
									onChange={ () =>
										handleVisibilityOptionChange( {
											blog_public:
												wpcomPublicComingSoon || blogPublic === -1 || blogPublic === 1 ? 0 : 1,
											wpcom_coming_soon: 0,
											wpcom_public_coming_soon: 0,
										} )
									}
									disabled={ isRequestingSettings }
									onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
								/>
								<span>{ translate( 'Discourage search engines from indexing this site' ) }</span>
								<FormSettingExplanation>
									{ translate(
										'This option does not block access to your site — it is up to search engines to honor your request.'
									) }
								</FormSettingExplanation>
							</FormLabel>
						</>
					) }
					{ ! isNonAtomicJetpackSite && (
						<>
							<FormLabel className="site-settings__visibility-label is-private">
								<FormRadio
									name="blog_public"
									value="-1"
									checked={
										( -1 === blogPublic && ! wpcomComingSoon && ! isPrivateAndUnlaunched ) ||
										( wpcomComingSoon && isAtomicAndEditingToolkitDeactivated )
									}
									onChange={ () =>
										handleVisibilityOptionChange( {
											blog_public: -1,
											wpcom_coming_soon: 0,
											wpcom_public_coming_soon: 0,
										} )
									}
									disabled={ isRequestingSettings }
									onClick={ eventTracker( 'Clicked Site Visibility Radio Button' ) }
									label={ translate( 'Private' ) }
								/>
							</FormLabel>
							<FormSettingExplanation>
								{ translate(
									'Your site is only visible to you and logged-in members you approve. Everyone else will see a log in screen.'
								) }
							</FormSettingExplanation>
						</>
					) }
				</FormFieldset>
			</form>
		);
	}
);

export default SitePrivacyForm;
