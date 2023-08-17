import { Button, FormInputValidation } from '@automattic/components';
import { englishLocales, useLocale } from '@automattic/i18n-utils';
import { Icon, trash, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CAPTURE_URL_RGX_SOFT } from 'calypso/blocks/import/util';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import useDeleteDomainForwardingMutation from 'calypso/data/domains/forwarding/use-delete-domain-forwarding-mutation';
import useDomainForwardingQuery from 'calypso/data/domains/forwarding/use-domain-forwarding-query';
import useUpdateDomainForwardingMutation from 'calypso/data/domains/forwarding/use-update-domain-forwarding-mutation';
import { withoutHttp } from 'calypso/lib/url';
import { WPCOM_DEFAULT_NAMESERVERS_REGEX } from 'calypso/my-sites/domains/domain-management/name-servers/constants';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: `domain-forwarding-notification`,
};

export default function DomainForwardingCard( {
	domainName,
	nameservers,
}: {
	domainName: string;
	nameservers: string[] | null;
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const locale = useLocale();
	const { hasTranslation } = useI18n();

	const { data: forwarding, isLoading, isError } = useDomainForwardingQuery( domainName );

	// Manage local state for target url and protocol as we split forwarding target into host, path and protocol when we store it
	const [ targetUrl, setTargetUrl ] = useState( '' );
	const [ protocol, setProtocol ] = useState( 'https' );
	const [ isValidUrl, setIsValidUrl ] = useState( true );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	// Display success notices when the forwarding is updated
	const { updateDomainForwarding } = useUpdateDomainForwardingMutation( domainName, {
		onSuccess() {
			dispatch(
				successNotice( translate( 'Domain redirect updated and enabled.' ), noticeOptions )
			);
		},
		onError() {
			dispatch(
				errorNotice( translate( 'An error occurred while updating the redirect.' ), noticeOptions )
			);
		},
	} );

	// Display success notices when the forwarding is deleted
	const { deleteDomainForwarding } = useDeleteDomainForwardingMutation( domainName, {
		onSuccess() {
			setTargetUrl( '' );
			dispatch(
				successNotice( translate( 'Domain redirect deleted successfully.' ), noticeOptions )
			);
		},
		onError() {
			dispatch(
				errorNotice( translate( 'An error occurred while deleting the redirect.' ), noticeOptions )
			);
		},
	} );

	// Render an error if the forwarding fails to load
	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice(
					translate( 'An error occurred while fetching your domain redirects.' ),
					noticeOptions
				)
			);
		}
	}, [ isError, dispatch, translate ] );

	// Load saved forwarding into local state
	useEffect( () => {
		if ( isLoading || ! forwarding ) {
			setTargetUrl( '' );
			setProtocol( 'https' );
			return;
		}

		try {
			const origin =
				( forwarding.isSecure ? 'http://' : 'https://' ) +
				( forwarding.targetHost ?? '_invalid_.domain' );
			const url = new URL( forwarding.targetPath, origin );
			if ( url.hostname !== '_invalid_.domain' ) {
				setTargetUrl( url.hostname + url.pathname + url.search + url.hash );
				setProtocol( forwarding.isSecure ? 'https' : 'http' );
			}
		} catch ( e ) {
			// ignore
		}
	}, [ isLoading, forwarding, setTargetUrl, setProtocol ] );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setTargetUrl( withoutHttp( event.target.value ) );

		if (
			event.target.value.length > 0 &&
			! CAPTURE_URL_RGX_SOFT.test( protocol + '://' + event.target.value )
		) {
			setIsValidUrl( false );
			setErrorMessage( translate( 'Please enter a valid URL.' ) );
			return;
		}

		try {
			const url = new URL( protocol + '://' + event.target.value );

			// Disallow subdomain forwardings to the main domain, e.g. www.example.com => example.com
			// Disallow same domain forwardings (for now, this may change in the future)
			if ( url.hostname === domainName || url.hostname.endsWith( `.${ domainName }` ) ) {
				setErrorMessage( translate( 'Redirects to the same domain are not allowed.' ) );
				setIsValidUrl( false );
				return;
			}
		} catch ( e ) {
			setErrorMessage( translate( 'Please enter a valid URL.' ) );
			setIsValidUrl( false );
			return;
		}

		setIsValidUrl( true );
	};

	const handleDelete = () => {
		if ( isLoading || ! forwarding ) {
			return;
		}
		deleteDomainForwarding();
	};

	const handleChangeProtocol = ( event: React.ChangeEvent< HTMLSelectElement > ) => {
		setProtocol( event.currentTarget.value );
	};

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		let targetHost = '';
		let targetPath = '';
		let isSecure = true;

		if ( targetUrl === '' ) {
			handleDelete();
			return false;
		}

		// Validate we have a valid url from the user
		try {
			const url = new URL( protocol + '://' + targetUrl, 'https://_domain_.invalid' );
			if ( url.origin !== 'https://_domain_.invalid' ) {
				targetHost = url.hostname;
				targetPath = url.pathname + url.search + url.hash;
				isSecure = url.protocol === 'https:';
			}
		} catch ( e ) {
			// ignore
		}

		updateDomainForwarding( {
			targetHost,
			targetPath,
			isSecure,
			forwardPaths: true, // v1 always forward paths
			isPermanent: false, // v1 always temporary
			isActive: true, // v1 always active
			sourcePath: null, // v1 always using domain only
		} );

		return false;
	};

	const hasWpcomNameservers = () => {
		if ( ! nameservers || nameservers.length === 0 ) {
			return false;
		}

		return nameservers.every( ( nameserver ) => {
			return WPCOM_DEFAULT_NAMESERVERS_REGEX.test( nameserver );
		} );
	};

	const renderNotice = () => {
		if ( hasWpcomNameservers() || ! nameservers || ! nameservers.length ) {
			return null;
		}

		const noticeText =
			englishLocales.includes( locale ) ||
			hasTranslation(
				'Domain redirection requires using WordPress.com nameservers.{{br/}}{{a}}Update your nameservers now{{/a}}.'
			)
				? translate(
						'Domain redirection requires using WordPress.com nameservers.{{br/}}{{a}}Update your nameservers now{{/a}}.',
						{
							components: {
								a: <a href="?nameservers=true" />,
								br: <br />,
							},
						}
				  )
				: translate( 'You are not currently using WordPress.com name servers.' );

		return (
			<div className="domain-forwarding-card-notice">
				<Icon
					icon={ info }
					size={ 18 }
					className="domain-forwarding-card-notice__icon gridicon"
					viewBox="2 2 20 20"
				/>
				<div className="domain-forwarding-card-notice__message">{ noticeText }</div>
			</div>
		);
	};

	return (
		<>
			{ renderNotice() }
			<form onSubmit={ handleSubmit }>
				<FormFieldset className="domain-forwarding-card__fields">
					<FormTextInputWithAffixes
						disabled={ isLoading }
						name="destination"
						noWrap
						onChange={ handleChange }
						value={ targetUrl }
						className={ classNames( { 'is-error': ! isValidUrl } ) }
						id="domain-forwarding__input"
						maxLength={ 1000 }
						prefix={
							<FormSelect
								name="protocol"
								id="protocol-type"
								value={ protocol }
								onChange={ handleChangeProtocol }
								disabled={ isLoading }
							>
								<option value="https">https://</option>
								<option value="http">http://</option>
							</FormSelect>
						}
						suffix={
							<Button
								disabled={ isLoading || targetUrl === '' }
								className={ classNames( 'domain-forwarding-card__delete', {
									'is-disabled': isLoading || targetUrl === '',
								} ) }
								onClick={ handleDelete }
							>
								<Icon icon={ trash } size={ 18 } />
							</Button>
						}
					/>
				</FormFieldset>
				<p className="domain-forwarding-card__error-field">
					{ ! isValidUrl ? <FormInputValidation isError={ true } text={ errorMessage } /> : ' ' }
				</p>
				<FormButton
					disabled={
						! isValidUrl ||
						isLoading ||
						( forwarding &&
							forwarding.targetHost + forwarding.targetPath === targetUrl &&
							( forwarding.isSecure ? 'https' : 'http' ) === protocol ) ||
						( ! forwarding && targetUrl === '' )
					}
				>
					{ translate( 'Save' ) }
				</FormButton>
			</form>
		</>
	);
}