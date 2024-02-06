import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import wrapSettingsForm from '../wrap-settings-form';
import SitePrivacyForm from './form';

export interface Fields {
	blog_public: number;
	wpcom_coming_soon: number;
	wpcom_public_coming_soon: number;
}

interface Props {
	fields: Fields;
	handleSubmitForm: () => void;
	siteId: string;
	siteIsAtomic: boolean;
	updateFields: ( fields: Fields ) => void;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	eventTracker: () => void;
	trackEvent: () => void;
}

const getFormSettings = ( settings?: Fields ) => {
	if ( ! settings ) {
		return {};
	}

	const { blog_public, wpcom_coming_soon, wpcom_public_coming_soon } = settings;

	return {
		blog_public: parseInt( blog_public, 10 ),
		wpcom_coming_soon: parseInt( wpcom_coming_soon, 10 ),
		wpcom_public_coming_soon: parseInt( wpcom_public_coming_soon, 10 ),
	};
};

const SitePrivacySetting = ( {
	fields,
	handleSubmitForm,
	siteId,
	siteIsAtomic,
	updateFields,
	isRequestingSettings,
	isSavingSettings,
	eventTracker,
	trackEvent,
}: Props ) => {
	const translate = useTranslate();

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
					siteIsAtomic={ siteIsAtomic }
					updateFields={ updateFields }
					isRequestingSettings={ isRequestingSettings }
					eventTracker={ eventTracker }
					trackEvent={ trackEvent }
				/>
			</Card>
		</>
	);
};

export default wrapSettingsForm( getFormSettings )( SitePrivacySetting );
