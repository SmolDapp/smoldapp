import React, {Fragment} from 'react';
import Link from 'next/link';
import {DefaultSeo} from 'next-seo';
import MultiSafe from 'components/apps/safe';
import {MultiSafeContextApp} from 'components/apps/safe/useSafe';

import type {ReactElement} from 'react';

function SafePage(): ReactElement {
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
							<span className={'font-medium text-neutral-900'}>{'Multisafe'}</span>
						</h2>
					</div>
					<div>
						<MultiSafe />
					</div>
				</div>
			</section>
		</div>
	);
}

SafePage.getLayout = function getLayout(page: ReactElement): ReactElement {
	return (
		<Fragment>
			<DefaultSeo
				title={'MultiSafe - SmolDapp'}
				defaultTitle={'MultiSafe - SmolDapp'}
				description={'One address, all the chains. Deploy your Safe across multiple chains.'}
				openGraph={{
					type: 'website',
					locale: 'en-US',
					url: 'https://smold.app/safe',
					site_name: 'MultiSafe - SmolDapp',
					title: 'MultiSafe - SmolDapp',
					description: 'One address, all the chains. Deploy your Safe across multiple chains.',
					images: [
						{
							url: 'https://smold.app/og_multisafe.png',
							width: 800,
							height: 400,
							alt: 'MultiSafe'
						}
					]
				}}
				twitter={{
					handle: '@smoldapp',
					site: '@smoldapp',
					cardType: 'summary_large_image'
				}}
			/>
			<MultiSafeContextApp>{page}</MultiSafeContextApp>
		</Fragment>
	);
};

export default SafePage;
