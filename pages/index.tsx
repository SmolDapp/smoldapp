import React, {Fragment} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LogoDisperse from '@disperse/Logo';
import LogoMigratooor from '@migratooor/Logo';
import LogoNFTMigratooor from '@nftmigratooor/Logo';
import LogoTokenlistooor from '@tokenlistooor/Logo';
import {Button} from '@yearn-finance/web-lib/components/Button';

import DisperseWrapper from './disperse';

import type {GetServerSidePropsContext, GetServerSidePropsResult} from 'next';
import type {ReactElement} from 'react';

const	apps = [
	{
		href: '/disperse',
		title: 'Disperse',
		description: (
			<span>
				<span className={'font-semibold text-orange-500'}>{'Distribute'}</span>
				{' ether or tokens to multiple addresses'}
			</span>
		),
		icon: <LogoDisperse className={'h-[80px] w-[80px]'} />
	},
	{
		href: 'https://gib.to',
		title: 'Gib',
		description: (
			<span>
				{'The easiest way to '}
				<span className={'font-semibold text-orange-500'}>{'donate'}</span>
				{' to the crypto projects you love.'}
			</span>
		),
		icon: <Image
			src={'https://gib.to/favicons/favicon.svg'}
			width={80}
			height={80}
			alt={'gib'} />
	},
	{
		href: 'https://dump.services',
		title: 'Dump Services',
		description: (
			<span>
				<span className={'font-semibold text-orange-500'}>{'Dump'}</span>
				{' your tokens like a pro'}
			</span>
		),
		icon: <Image
			src={'/dumpservices.svg'}
			width={80}
			height={80}
			alt={'dump.services'} />
	},
	{
		href: '/migratooor',
		title: 'Migratooor',
		description: (
			<span>
				{'The hassle-free solution for your '}
				<span className={'font-semibold text-orange-500'}>{'wallet-to-wallet migration'}</span>
			</span>
		),
		icon: <LogoMigratooor className={'h-[80px] w-[80px]'} />
	},
	{
		href: '/nftmigratooor',
		title: 'NFTMigratooor',
		// description: 'The easiest way to migrate your NFTs from one wallet to another.',
		description: (
			<span>
				{'Easily '}
				<span className={'font-semibold text-orange-500'}>{'migrate your NFTs'}</span>
				{' to your new wallet.'}
			</span>
		),
		icon: <LogoNFTMigratooor className={'h-[80px] w-[80px]'} />
	}, {
		href: '/tokenlistooor',
		title: 'Tokenlistooor',
		// description: 'Up to date automatic token lists for your dApp.',
		description: (
			<span>
				{'An up to date automatic '}
				<span className={'font-semibold text-orange-500'}>{'tokenList'}</span>
				{' for your dApp.'}
			</span>
		),
		icon: <LogoTokenlistooor className={'h-[80px] w-[80px]'} />
	}
];

function	AppBox({app}: {app: typeof apps[0]}): ReactElement {
	return (
		<Link
			prefetch={false}
			key={app.href}
			href={app.href}
			className={'relative bg-neutral-0'}>
			<div id={app.href} className={'appBox'}>
				<div className={'box-0 !rounded-full'}>
					{app.icon}
				</div>
				<div className={'pt-6 text-left'}>
					<b className={'text-lg'}>{app.title}</b>
					<p>{app.description}</p>
				</div>
			</div>
		</Link>
	);
}

function	Index(props: {app: string}): ReactElement {
	const {app} = props;
	if (app === 'disperse') {
		return <DisperseWrapper />;
	}
	return (
		<Fragment>
			<div className={'mx-auto grid w-full max-w-5xl px-4'}>
				<div className={'mb-0 mt-10 grid grid-cols-6 flex-col md:mb-14 md:mt-20 md:grid-cols-12'}>
					<div className={'col-span-6'}>
						<h1 className={'flex text-5xl font-bold lowercase text-neutral-900 md:text-8xl'}>{'Smol'}</h1>
						<div className={'mb-2 mt-4'}>
							<p className={'w-10/12 text-lg'}>
								{'The registry for small, simple, and secure dapps for all your needs.'}
							</p>
						</div>
						<div className={'mb-12 mt-8 flex flex-row items-center space-x-6'}>
							<Link href={'https://twitter.com/smoldapp'}>
								<Button className={'w-[140px]'}>
									{'Twitter'}
								</Button>
							</Link>
							<Link href={'https://github.com/smoldapp'}>
								<Button className={'w-[140px]'}>
									{'Github'}
								</Button>
							</Link>
						</div>
					</div>
					<div id={'container'} className={'col-span-6 hidden items-center justify-center md:flex'}>
						<p className={'text-neutral-400'}>{'Oh no so much empty space'}</p>
					</div>
				</div>
			</div>
			<div className={'mx-auto grid w-full max-w-5xl px-4'}>
				<section className={'mb-20 grid grid-cols-1 gap-10 md:grid-cols-3'}>
					{apps.map((app): ReactElement => <AppBox key={app.href} app={app} />)}
				</section>
			</div>
		</Fragment>
	);
}

export default Index;


type TResult = {
	app?: string
}
export async function getServerSideProps(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<TResult>> {
	const {host} = context.req.headers;
	const referrer = context.req.headers.referer;
	if ([referrer, host]?.includes('disperse')) {
		return {
			props: {
				app: 'disperse'
			}
		};
	}

	return {
		props: {}
	};
}
