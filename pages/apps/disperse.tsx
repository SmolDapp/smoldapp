import React, {Fragment} from 'react';
import {DefaultSeo} from 'next-seo';
import Disperse from '@disperse/index';
import {DisperseContextApp} from '@disperse/useDisperse';

import type {ReactElement} from 'react';

function DispersePage(): ReactElement {
	return <Disperse />;
}

DispersePage.getLayout = function getLayout(page: ReactElement): ReactElement {
	return (
		<Fragment>
			<DefaultSeo
				title={'Disperse - SmolDapp'}
				defaultTitle={'Disperse - SmolDapp'}
				description={'Distribute ether or tokens to multiple addresses'}
				openGraph={{
					type: 'website',
					locale: 'en-US',
					url: 'https://disperse.smold.app',
					site_name: 'Disperse - SmolDapp',
					title: 'Disperse - SmolDapp',
					description: 'Distribute ether or tokens to multiple addresses',
					images: [
						{
							url: 'https://smold.app/og_disperse.png',
							width: 800,
							height: 400,
							alt: 'disperse'
						}
					]
				}}
				twitter={{
					handle: '@smoldapp',
					site: '@smoldapp',
					cardType: 'summary_large_image'
				}}
			/>
			<DisperseContextApp>{page}</DisperseContextApp>
		</Fragment>
	);
};

DispersePage.AppName = 'Disperse';
DispersePage.AppDescription = 'Transfer funds to multiple receivers';
DispersePage.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Fragment>{page}</Fragment>;
};

export default DispersePage;
