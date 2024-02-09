import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { http } from 'msw';
import Launchpad from './launchpad';
import { launchpadResolver } from './msw/resolver';
import type { Meta, StoryObj } from '@storybook/react';

const queryClient = new QueryClient();

const meta: Meta< typeof Launchpad > = {
	title: 'Launchpad/Launchpad',
	component: Launchpad,
	decorators: [
		( Story ) => (
			<QueryClientProvider client={ queryClient }>
				<Story />
			</QueryClientProvider>
		),
	],
	parameters: {
		msw: {
			handlers: [ http.get( '/wpcom/v2/sites/*/launchpad', launchpadResolver ) ],
		},
	},
	argTypes: {
		checklistSlug: {
			defaultValue: 'free',
			options: [ 'free', 'link-in-bio' ],
			control: { type: 'select' },
		},
	},
};

type Story = StoryObj< typeof meta >;
export const Default: Story = {
	args: {
		checklistSlug: 'free',
		siteSlug: 'example.wordpress.com',
		launchpadContext: 'fullscreen',
	},
	argTypes: {
		checklistSlug: {
			options: [ 'free', 'link-in-bio' ],
			control: {
				type: 'select',
			},
		},
	},
};

export default meta;
