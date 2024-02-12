import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SiteSettingPrivacyForm from './form';
import type { AppState } from 'calypso/types';

export interface Fields {
	blog_public: number;
	wpcom_coming_soon: number;
	wpcom_public_coming_soon: number;
}

interface SiteSettingPrivacyProps {
	fields: Fields;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	updateFields: ( fields: Fields ) => void;
	isAtomicAndEditingToolkitDeactivated: boolean;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	siteIsAtomic: boolean | null;
	eventTracker: () => void;
	trackEvent: () => void;
}

const SiteSettingPrivacy = ( {
	fields,
	handleSubmitForm,
	updateFields,
	isAtomicAndEditingToolkitDeactivated,
	isRequestingSettings,
	isSavingSettings,
	siteIsAtomic,
	eventTracker,
	trackEvent,
}: SiteSettingPrivacyProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const siteIsJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isComingSoon = useSelector( ( state: AppState ) => isSiteComingSoon( state, siteId ) );
	const isUnlaunched = useSelector( ( state: AppState ) => isUnlaunchedSite( state, siteId ) );
	const isWpcomStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );
	const isWPForTeamsSite = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );

	return (
		<>
			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader
				id="site-privacy-settings"
				disabled={ isRequestingSettings || isSavingSettings }
				isSaving={ isSavingSettings }
				onButtonClick={ handleSubmitForm }
				showButton
				title={ translate(
					'Privacy {{infoPopover}} Control who can view your site. {{a}}Learn more{{/a}}. {{/infoPopover}}',
					{
						components: {
							a: <InlineSupportLink showIcon={ false } supportContext="privacy" />,
							infoPopover: <InfoPopover position="bottom right" />,
						},
						comment: 'Privacy Settings header',
					}
				) }
			/>
			<Card>
				<SiteSettingPrivacyForm
					fields={ fields }
					siteId={ siteId }
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
					eventTracker={ eventTracker }
					trackEvent={ trackEvent }
				/>
			</Card>
		</>
	);
};

export default SiteSettingPrivacy;
