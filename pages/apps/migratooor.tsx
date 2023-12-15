import React from 'react';
import Link from 'next/link';
import {DefaultSeo} from 'next-seo';
import {Migrate} from 'components/apps/Migrate';
import {MigrateContextApp} from 'components/apps/Migrate/useMigrate';

import type {ReactElement} from 'react';

function MigratePage(): ReactElement {
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
							<span className={'font-medium text-neutral-900'}>{'Migrate'}</span>
						</h2>
					</div>
					<div>
						<Migrate />
					</div>
				</div>
			</section>
		</div>
	);
}

export default function WrapperMigrate(): ReactElement {
	return (
		<MigrateContextApp>
			<>
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
				<MigratePage />
			</>
		</MigrateContextApp>
	);
}
