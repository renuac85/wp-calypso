import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import SitePrivacyForm from './form';

export interface Fields {
	blog_public: number;
	wpcom_coming_soon: number;
	wpcom_public_coming_soon: number;
}

interface SitePrivacySettingProps {
	fields: Fields;
	siteId: number;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	updateFields: ( fields: Fields ) => void;
	isAtomicAndEditingToolkitDeactivated: boolean;
	isComingSoon: boolean;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	isUnlaunchedSite: boolean;
	siteIsAtomic: boolean | null;
	siteIsJetpack: boolean | null;
	eventTracker: () => void;
	trackEvent: () => void;
}

const SitePrivacySetting = ( {
	fields,
	handleSubmitForm,
	siteId,
	updateFields,
	isAtomicAndEditingToolkitDeactivated,
	isComingSoon,
	isRequestingSettings,
	isSavingSettings,
	isUnlaunchedSite,
	siteIsAtomic,
	siteIsJetpack,
	eventTracker,
	trackEvent,
}: SitePrivacySettingProps ) => {
	const translate = useTranslate();
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
				<SitePrivacyForm
					fields={ fields }
					siteId={ siteId }
					updateFields={ updateFields }
					isAtomicAndEditingToolkitDeactivated={ isAtomicAndEditingToolkitDeactivated }
					isComingSoon={ isComingSoon }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					isUnlaunchedSite={ isUnlaunchedSite }
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

export default SitePrivacySetting;
