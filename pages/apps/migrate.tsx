import React, {Fragment} from 'react';
import {DefaultSeo} from 'next-seo';
import {Migrate} from 'components/apps/Migrate';
import {MigrateContextApp} from 'components/apps/Migrate/useMigrate';

import type {ReactElement} from 'react';

function MigratePage(): ReactElement {
	return <Migrate />;
}

MigratePage.getLayout = function getLayout(page: ReactElement): ReactElement {
	return (
		<Fragment>
			<DefaultSeo
				title={'Migratooor - SmolDapp'}
				defaultTitle={'Migratooor - SmolDapp'}
				description={'The easiest way to migrate your tokens from one wallet to another.'}
				openGraph={{
					type: 'website',
					locale: 'en-US',
					url: 'https://smold.app/migratooor',
					site_name: 'Migratooor - SmolDapp',
					title: 'Migratooor - SmolDapp',
					description: 'The easiest way to migrate your tokens from one wallet to another.',
					images: [
						{
							url: 'https://smold.app/og_migratooor.png',
							width: 800,
							height: 400,
							alt: 'migratooor'
						}
					]
				}}
				twitter={{
					handle: '@smoldapp',
					site: '@smoldapp',
					cardType: 'summary_large_image'
				}}
			/>
			<MigrateContextApp>{page}</MigrateContextApp>
		</Fragment>
	);
};

MigratePage.AppName = 'Migrate';
MigratePage.AppDescription = 'Transfer all your funds to another wallet';
MigratePage.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Fragment>{page}</Fragment>;
};

export default MigratePage;
