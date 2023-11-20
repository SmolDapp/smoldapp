import React, {Fragment} from 'react';
import Link from 'next/link';
import {DefaultSeo} from 'next-seo';
import ViewTable from '@disperse/2.ViewTable';
import {DisperseContextApp} from '@disperse/useDisperseee';

import type {ReactElement} from 'react';

function Disperse(): ReactElement {
	return (
		<div>
			<section className={'z-10 mx-auto mt-10 grid w-full max-w-5xl'}>
				<div className={'mb-0'}>
					<div className={'flex flex-row items-center justify-between'}>
						<h2 className={'scroll-m-20 pb-4 text-sm'}>
							<Link href={'/'}>
								<span
									className={
										'text-neutral-400 transition-colors hover:text-neutral-900 hover:underline'
									}>
									{'Smol'}
								</span>
							</Link>
							<span className={'text-neutral-400'}>{' / '}</span>
							<span className={'font-medium text-neutral-900'}>{'Disperse'}</span>
						</h2>
					</div>
					<div>
						<ViewTable onProceed={(): void => {}} />
					</div>
				</div>
			</section>
		</div>
	);
}

Disperse.getLayout = function getLayout(page: ReactElement): ReactElement {
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

export default Disperse;
