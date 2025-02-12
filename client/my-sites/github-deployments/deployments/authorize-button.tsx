import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import SocialLogo from 'calypso/components/social-logo';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { useGithubAccountsQuery } from '../use-github-accounts-query';
import { openPopup } from '../utils/open-popup';

const AUTHORIZE_URL = addQueryArgs( 'https://github.com/login/oauth/authorize', {
	client_id: config( 'github_oauth_client_id' ),
} );

const POPUP_ID = 'github-oauth-authorize';

export const GitHubAuthorizeButton = () => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const { isLoading, isRefetching, refetch } = useGithubAccountsQuery();

	const [ isAuthorizing, setIsAuthorizing ] = useState( false );

	const startAuthorization = () => {
		setIsAuthorizing( true );

		openPopup( { url: AUTHORIZE_URL, popupId: POPUP_ID } )
			.then( () => refetch() )
			.catch( () => dispatch( errorNotice( 'Failed to authorize GitHub. Please try again.' ) ) )
			.finally( () => setIsAuthorizing( false ) );
	};

	if ( isLoading && ! isRefetching ) {
		return null;
	}

	return (
		<Button
			primary
			css={ { display: 'flex', alignItems: 'center' } }
			busy={ isLoading || isAuthorizing }
			disabled={ isLoading || isAuthorizing }
			onClick={ startAuthorization }
		>
			<SocialLogo icon="github" size={ 18 } css={ { marginRight: '4px' } } />
			{ __( 'Authorize GitHub' ) }
		</Button>
	);
};
