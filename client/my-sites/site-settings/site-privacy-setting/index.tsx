import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import SitePrivacyForm from './form';

interface SitePrivacySettingProps {
	isDisabled: boolean;
	isSaving: boolean;
	onSave: () => void;
}

const SitePrivacySetting = ( { isDisabled, isSaving, onSave }: SitePrivacySettingProps ) => {
	const translate = useTranslate();

	return (
		<>
			<SettingsSectionHeader
				id="site-privacy-settings"
				disabled={ isDisabled }
				isSaving={ isSaving }
				onButtonClick={ onSave }
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
				<SitePrivacyForm />
			</Card>
		</>
	);
};

export default SitePrivacySetting;
