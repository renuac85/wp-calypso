import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { DropdownMenu, MenuGroup, MenuItem, Spinner } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, linkOff } from '@wordpress/icons';
import { DeploymentStatus } from 'calypso/my-sites/github-deployments/deployments/deployment-status';
import { useCreateCodeDeploymentRun } from 'calypso/my-sites/github-deployments/deployments/use-create-code-deployment-run';
import { formatDate } from 'calypso/my-sites/github-deployments/utils/dates';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { useSelector } from '../../../state';
import { manageDeploymentPage } from '../routes';
import { CodeDeploymentData } from './use-code-deployments-query';
import { useDeleteCodeDeployment } from './use-delete-code-deployment';

interface DeploymentsListItemProps {
	deployment: CodeDeploymentData;
}

export const DeploymentsListItem = ( { deployment }: DeploymentsListItemProps ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const locale = useLocale();

	const { deleteDeployment, isPending } = useDeleteCodeDeployment(
		deployment.blog_id,
		deployment.id
	);

	const { triggerManualDeployment } = useCreateCodeDeploymentRun(
		deployment.blog_id,
		deployment.id
	);

	const [ account, repo ] = deployment.repository_name.split( '/' );

	return (
		<tr>
			<td>
				<div className="github-deployments-list__repository-details">
					{ repo }
					<span>{ account }</span>
				</div>
			</td>
			<td>
				<div className="github-deployments-list__commit-details">
					This is the commit message
					<div>
						<a href="https://github.com/{deployment.repository_name}">44d4fa1</a>
						<span>
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M10.0001 3.16667C10.0001 2.59203 10.2284 2.04093 10.6347 1.6346C11.041 1.22827 11.5921 1 12.1667 1C12.7414 1 13.2925 1.22827 13.6988 1.6346C14.1051 2.04093 14.3334 2.59203 14.3334 3.16667C14.3334 3.7413 14.1051 4.2924 13.6988 4.69873C13.2925 5.10506 12.7414 5.33333 12.1667 5.33333C11.5921 5.33333 11.041 5.10506 10.6347 4.69873C10.2284 4.2924 10.0001 3.7413 10.0001 3.16667ZM1.66675 12.8333C1.66675 12.2587 1.89502 11.7076 2.30135 11.3013C2.70768 10.8949 3.25878 10.6667 3.83341 10.6667C4.40805 10.6667 4.95915 10.8949 5.36548 11.3013C5.77181 11.7076 6.00008 12.2587 6.00008 12.8333C6.00008 13.408 5.77181 13.9591 5.36548 14.3654C4.95915 14.7717 4.40805 15 3.83341 15C3.25878 15 2.70768 14.7717 2.30135 14.3654C1.89502 13.9591 1.66675 13.408 1.66675 12.8333ZM1.66675 3.16667C1.66675 2.59203 1.89502 2.04093 2.30135 1.6346C2.70768 1.22827 3.25878 1 3.83341 1C4.40805 1 4.95915 1.22827 5.36548 1.6346C5.77181 2.04093 6.00008 2.59203 6.00008 3.16667C6.00008 3.7413 5.77181 4.2924 5.36548 4.69873C4.95915 5.10506 4.40805 5.33333 3.83341 5.33333C3.25878 5.33333 2.70768 5.10506 2.30135 4.69873C1.89502 4.2924 1.66675 3.7413 1.66675 3.16667ZM3.83341 4.33333C4.14292 4.33325 4.43972 4.21021 4.65851 3.99129C4.8773 3.77237 5.00017 3.47551 5.00008 3.166C4.99999 2.85649 4.87696 2.5597 4.65804 2.3409C4.43912 2.12211 4.14226 1.99924 3.83275 1.99933C3.6795 1.99938 3.52775 2.02961 3.38618 2.08829C3.24461 2.14698 3.11599 2.23298 3.00765 2.34138C2.78886 2.56029 2.66599 2.85716 2.66608 3.16667C2.66617 3.47617 2.78921 3.77297 3.00812 3.99176C3.22704 4.21056 3.52391 4.33342 3.83341 4.33333ZM3.83341 14C3.98667 14 4.13841 13.9697 4.27998 13.911C4.42155 13.8524 4.55018 13.7664 4.65851 13.658C4.76685 13.5496 4.85277 13.4209 4.91138 13.2793C4.96998 13.1377 5.00013 12.9859 5.00008 12.8327C5.00004 12.6794 4.96981 12.5277 4.91112 12.3861C4.85243 12.2445 4.76644 12.1159 4.65804 12.0076C4.54964 11.8992 4.42097 11.8133 4.27937 11.7547C4.13776 11.6961 3.986 11.666 3.83275 11.666C3.52324 11.6661 3.22644 11.7891 3.00765 12.008C2.78886 12.227 2.66599 12.5238 2.66608 12.8333C2.66617 13.1428 2.78921 13.4396 3.00812 13.6584C3.22704 13.8772 3.52391 14.0001 3.83341 14ZM12.1667 4.33333C12.4763 4.33325 12.7731 4.21021 12.9918 3.99129C13.2106 3.77237 13.3335 3.47551 13.3334 3.166C13.3333 2.85649 13.2103 2.5597 12.9914 2.3409C12.7725 2.12211 12.4756 1.99924 12.1661 1.99933C12.0128 1.99938 11.8611 2.02961 11.7195 2.08829C11.5779 2.14698 11.4493 2.23298 11.341 2.34138C11.2327 2.44977 11.1467 2.57845 11.0881 2.72005C11.0295 2.86165 10.9994 3.01341 10.9994 3.16667C10.9995 3.31992 11.0297 3.47166 11.0884 3.61323C11.1471 3.7548 11.2331 3.88343 11.3415 3.99176C11.4499 4.1001 11.5785 4.18602 11.7201 4.24463C11.8617 4.30324 12.0135 4.33338 12.1667 4.33333Z"
									fill="black"
								/>
								<path
									d="M3.83325 11.1668C3.70064 11.1668 3.57347 11.1142 3.4797 11.0204C3.38593 10.9266 3.33325 10.7994 3.33325 10.6668V5.3335C3.33325 5.20089 3.38593 5.07371 3.4797 4.97994C3.57347 4.88617 3.70064 4.8335 3.83325 4.8335C3.96586 4.8335 4.09304 4.88617 4.18681 4.97994C4.28057 5.07371 4.33325 5.20089 4.33325 5.3335V10.6668C4.33325 10.7994 4.28057 10.9266 4.18681 11.0204C4.09304 11.1142 3.96586 11.1668 3.83325 11.1668Z"
									fill="black"
								/>
								<path
									d="M11.6666 5.83317V5.1665H12.6666V5.83317C12.6666 6.49621 12.4032 7.1321 11.9344 7.60094C11.4655 8.06978 10.8296 8.33317 10.1666 8.33317H5.49992C5.1905 8.33317 4.89375 8.45609 4.67496 8.67488C4.45617 8.89367 4.33325 9.19042 4.33325 9.49984H3.33325C3.33325 8.9252 3.56153 8.3741 3.96785 7.96777C4.37418 7.56144 4.92528 7.33317 5.49992 7.33317H10.1666C10.5644 7.33317 10.9459 7.17514 11.2272 6.89383C11.5085 6.61253 11.6666 6.231 11.6666 5.83317Z"
									fill="black"
								/>
							</svg>
							<span>Main</span>
						</span>
					</div>
				</div>
			</td>
			<td>
				<DeploymentStatus status={ 2 } />
			</td>
			<td>
				<span>{ formatDate( locale, new Date( deployment.updated_on ) ) }</span>
			</td>
			<td>
				<span>30s</span>
			</td>
			<td>
				{ isPending ? (
					<Spinner />
				) : (
					<DropdownMenu icon={ <Gridicon icon="ellipsis" /> } label="Select a direction">
						{ ( { onClose } ) => (
							<Fragment>
								<MenuGroup>
									<MenuItem
										onClick={ () => {
											triggerManualDeployment();
											onClose();
										} }
									>
										{ __( 'Trigger manual deploy' ) }
									</MenuItem>
									<MenuItem
										onClick={ () => {
											page( manageDeploymentPage( siteSlug!, deployment.id ) );
											onClose();
										} }
									>
										{ __( 'Configure repository' ) }
									</MenuItem>
								</MenuGroup>
								<MenuGroup>
									<MenuItem
										className="github-deployments-list__menu-item-danger"
										onClick={ () => {
											deleteDeployment();
											onClose();
										} }
									>
										<Icon icon={ linkOff } />
										{ __( 'Disconnect repository ' ) }
									</MenuItem>
								</MenuGroup>
							</Fragment>
						) }
					</DropdownMenu>
				) }
			</td>
		</tr>
	);
};
