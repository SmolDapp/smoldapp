import React from 'react';
import Link from 'next/link';
import {DefaultSeo} from 'next-seo';
import ViewNewListName from 'components/views/tokenlistooor/ViewNewListName';
import {MigratooorContextApp} from 'contexts/useMigratooor';

import type {ReactElement} from 'react';


function	Home(): ReactElement {
	return (
		<div className={'mx-auto mt-10 grid w-full max-w-4xl pb-40'}>
			<div className={'pb-4'}>
				<Link href={'/tokenlistooor'} className={'text-xs text-neutral-400'}>
					{'< Back to lists'}
				</Link>
			</div>
			<ViewNewListName />
		</div>
	);
}

export default function Wrapper(): ReactElement {
	return (
		<MigratooorContextApp>
			<>
				<DefaultSeo
					title={'Tokenlistooor - SmolDapp'}
					defaultTitle={'Tokenlistooor - SmolDapp'}
					description={'Up to date token lists that fulfill your needs! Tokenlistooor is a fork of Uniswap Tokenlists, with focus on adding more automation and extra features.'}
					openGraph={{
						type: 'website',
						locale: 'en-US',
						url: 'https://smold.app/tokenlistooor',
						site_name: 'Tokenlistooor - SmolDapp',
						title: 'Tokenlistooor - SmolDapp',
						description: 'Up to date token lists that fulfill your needs! Tokenlistooor is a fork of Uniswap Tokenlists, with focus on adding more automation and extra features.',
						images: [
							{
								url: 'https://smold.app/og_tokenlistooor.png',
								width: 800,
								height: 400,
								alt: 'tokenListooor'
							}
						]
					}}
					twitter={{
						handle: '@smoldapp',
						site: '@smoldapp',
						cardType: 'summary_large_image'
					}} />
				<Home />
			</>
		</MigratooorContextApp>
	);
}

